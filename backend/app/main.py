from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

questions = [
    {"question": "ㄱㅅ", "answer": "감사", "hint": "고마울 때 쓰는 말"},
    {"question": "ㅎㅅ", "answer": "학생", "hint": "학교 다니는 사람"},
    {"question": "ㅅㅌ", "answer": "사탕", "hint": "달콤한 간식"},
    {"question": "ㅂㅂ", "answer": "바보", "hint": "멍청한 사람을 낮잡아 부르는 말"},
    {"question": "ㅈㄱ", "answer": "자기", "hint": "자신을 가리키는 말"},
]

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[WebSocket, str] = {}
        self.current_question = random.choice(questions)

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections[websocket] = username
        await self.broadcast_chat(f"✅ {username} 님이 접속했습니다.")
        # 새 접속자에게 현재 문제 보내기
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
                # 연결 끊김 등 오류 시 무시
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
                # 다음 문제로 교체
                manager.current_question = random.choice(questions)
                await manager.broadcast_quiz()
            else:
                # 틀린 사람에게만 알림 보내기
                await manager.send_personal_message({
                    "type": "chat",
                    "message": "❌ 틀렸어요. 다시 시도해보세요."
                }, websocket)

    except WebSocketDisconnect:
        left_user = manager.disconnect(websocket)
        await manager.broadcast_chat(f"⚠️ {left_user} 님이 나갔습니다.")