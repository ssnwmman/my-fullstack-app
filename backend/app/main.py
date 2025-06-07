from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import requests
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


API_URL = "https://opendict.korean.go.kr/api/search"
API_KEY = "AB2823EF55183E6C1EC3CE18828C8514"
MAX_NUM = 100

def get_initials(word: str) -> str:
    CHOSUNG_LIST = [
        "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ",
        "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ",
        "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
    ]
    HANGUL_BASE = 0xAC00
    initials = []
    for char in word:
        code = ord(char)
        if 0xAC00 <= code <= 0xD7A3:
            code -= HANGUL_BASE
            chosung_index = code // 588
            initials.append(CHOSUNG_LIST[chosung_index])
        else:
            initials.append(char)
    return "".join(initials)

count = 100

params = {
        "key": API_KEY,
        "target": "domain",
        "q": "정보통신",
        "type1": "word",
        "req_type": "json",
        "num": MAX_NUM,
        "start": 1
    }

response = requests.get(API_URL, params=params)
if response.status_code != 200:
        {
        "error": "API 요청 실패",
        "status_code": response.status_code,
        "response_text": response.text
        }


data = response.json()
items = data.get("channel", {}).get("item", [])

questions = []
for item in items:
    raw_word = item.get("word", "")
    parts = raw_word.split("^")
    filtered_parts = [p for p in parts if p not in ("정보", "통신")]
    cleaned_word = "".join(filtered_parts).strip()

    senses = item.get("sense", [])
    if senses and isinstance(senses, list):
            definition = senses[0].get("definition", "뜻풀이가 없습니다.")
    else:
            definition = "뜻풀이가 없습니다."

    if cleaned_word:
        answer = cleaned_word
        initial_word = get_initials(cleaned_word)
        questions.append({"question":initial_word,
                            "answer":answer,
                            "hint":definition})

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[WebSocket, str] = {}
        self.current_question = random.choice(questions)

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections[websocket] = username
        await self.broadcast_chat(f"✅ {username} 님이 접속했습니다.")
        await self.send_personal_message({
            "type": "quiz",
            "question": self.current_question["question"],
            "hint": self.current_question["hint"]
        }, websocket)

    def disconnect(self, websocket: WebSocket):
        username = self.active_connections.get(websocket, "알 수 없는 사용자")
        self.active_connections.pop(websocket, None)
        return username

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections.keys()):
            try:
                await connection.send_json(message)
            except:
                pass

    async def broadcast_chat(self, message: str):
        await self.broadcast({"type": "chat", "message": message})

    async def broadcast_quiz(self):
        await self.broadcast({
            "type": "quiz",
            "question": self.current_question["question"],
            "hint": self.current_question["hint"]
        })

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    username = websocket.query_params.get("username", "익명")
    await manager.connect(websocket, username)

    try:
        while True:
            data = await websocket.receive_text()
            if data == manager.current_question["answer"]:
                await manager.broadcast_chat(f"🎉 {username} 님이 문제를 맞췄습니다! 정답: {manager.current_question['answer']}")
                manager.current_question = random.choice(questions)
                await manager.broadcast_quiz()
            else:
                await manager.send_personal_message({
                    "type": "chat",
                    "message": "❌ 틀렸어요. 다시 시도해보세요."
                }, websocket)
    except WebSocketDisconnect:
        left_user = manager.disconnect(websocket)
        await manager.broadcast_chat(f"⚠️ {left_user} 님이 나갔습니다.")
