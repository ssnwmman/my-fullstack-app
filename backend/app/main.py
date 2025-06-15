from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import requests
import random
import asyncio
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from typing import Dict, List

API_URL = "https://opendict.korean.go.kr/api/search"
API_KEY = "96E6D0B58EB3359B3BBF8D09D6A77D88"
MAX_NUM = 10

# 초성 추출 함수
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

def get_random_hangul_char():
    disallowed_chosung_indexes = {1, 4, 7, 9, 12}
    disallowed_jongsung_indexes = {3, 5, 6, 9, 10, 11, 12, 13, 14, 15, 18}
    while True:
        code = random.randint(ord('가'), ord('힣'))
        relative_code = code - 0xAC00
        chosung_index = relative_code // 588
        jongsung_index = relative_code % 28
        if chosung_index not in disallowed_chosung_indexes and jongsung_index not in disallowed_jongsung_indexes:
            return chr(code)

def fetch_questions():
    random_char = get_random_hangul_char()
    params = {
        "key": API_KEY,
        "q": random_char,
        "req_type": "json",
        "advanced": "y",
        "num": MAX_NUM,
        "start": 1,
        "cat": 52,
        "method": "start",
        "type1": "word",
        "type3": "general",
        "type2": "native,loanword,hybrid",
        "pos": 1
    }

    try:
        response = requests.get(API_URL, params=params, timeout=3)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print("API 오류:", e)
        return []

    items = data.get("channel", {}).get("item", [])
    questions = []
    for item in items:
        word = item.get("word", "").replace("^", "").replace("-", "").strip()
        senses = item.get("sense", [])
        if isinstance(senses, dict):
            senses = [senses]
        definition = senses[0].get("definition", "뜻풀이가 없습니다.") if senses else "뜻풀이가 없습니다."

        if word:
            questions.append({
                "question": get_initials(word),
                "answer": word,
                "hint": definition
            })
    return questions

async def fetch_questions_async():
    loop = asyncio.get_running_loop()
    with ThreadPoolExecutor() as pool:
        return await loop.run_in_executor(pool, fetch_questions)

async def get_questions() -> List[dict]:
    result = []
    answers_seen = set()

    while len(result) < 20:
        tasks = [fetch_questions_async() for _ in range(5)]
        responses = await asyncio.gather(*tasks)
        flat_questions = [q for sublist in responses for q in sublist]

        unique_new_questions = [q for q in flat_questions if q["answer"] not in answers_seen]
        random.shuffle(unique_new_questions)

        for q in unique_new_questions[:2]:
            result.append(q)
            answers_seen.add(q["answer"])
            if len(result) >= 20:
                break

    random.shuffle(result)
    return result

# 웹소켓 매니저에 타이머 기능 추가
class ConnectionManager:
    def __init__(self, questions: List[dict]):
        self.active_connections: Dict[WebSocket, str] = {}
        self.questions = questions
        self.current_index = 0
        self.current_question = questions[self.current_index] if questions else None

        self.timer_task: asyncio.Task | None = None
        self.time_limit = 30  # 30초 제한
        self.time_left = self.time_limit

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections[websocket] = username
        await self.broadcast_chat(f"✅ {username} 님이 접속했습니다.")
        if self.current_question:
            await self.send_personal_message({
                "type": "quiz",
                "question": self.current_question["question"],
                "hint": self.current_question["hint"]
            }, websocket)
            await self.send_personal_message({
                "type": "timer",
                "time_left": self.time_left
            }, websocket)
        else:
            await self.send_personal_message({
                "type": "chat",
                "message": "⚠️ 현재 문제가 없습니다."
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
        if self.current_question:
            await self.broadcast({
                "type": "quiz",
                "question": self.current_question["question"],
                "hint": self.current_question["hint"]
            })

    async def start_timer(self):
        # 기존 타이머 취소
        if self.timer_task and not self.timer_task.done():
            self.timer_task.cancel()
        self.time_left = self.time_limit

        async def timer_loop():
            while self.time_left > 0:
                await self.broadcast({
                    "type": "timer",
                    "time_left": self.time_left
                })
                await asyncio.sleep(1)
                self.time_left -= 1

            await self.broadcast_chat("⏰ 시간이 다 되었습니다! 다음 문제로 넘어갑니다.")
            await self.next_question()

        self.timer_task = asyncio.create_task(timer_loop())

    async def next_question(self):
        if not self.questions:
            self.current_question = None
            return
        self.current_index += 1
        if self.current_index >= len(self.questions):
            self.current_index = 0
        self.current_question = self.questions[self.current_index]
        await self.broadcast_quiz()
        await self.start_timer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.questions = await get_questions()
    app.state.manager = ConnectionManager(app.state.questions)
    print("🔄 문제 로딩 완료.")
    yield
    print("🚪 앱 종료 중")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    username = websocket.query_params.get("username", "익명")
    manager: ConnectionManager = app.state.manager

    await manager.connect(websocket, username)

    try:
        while True:
            data = await websocket.receive_text()
            if manager.current_question and data == manager.current_question["answer"]:
                await manager.broadcast_chat(f"🎉 {username} 님이 정답을 맞췄습니다! 정답: {manager.current_question['answer']}")
                await manager.next_question()
            else:
                await manager.send_personal_message({
                    "type": "chat",
                    "message": "❌ 틀렸어요. 다시 시도해보세요."
                }, websocket)
    except WebSocketDisconnect:
        left_user = manager.disconnect(websocket)
        await manager.broadcast_chat(f"⚠️ {left_user} 님이 나갔습니다.")
    except Exception as e:
        print(f"웹소켓 에러: {e}")
        left_user = manager.disconnect(websocket)
        await manager.broadcast_chat(f"⚠️ {left_user} 님이 비정상적으로 나갔습니다.")
