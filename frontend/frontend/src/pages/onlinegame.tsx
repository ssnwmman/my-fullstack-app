import React, { useEffect, useRef, useState } from "react";

interface Message {
  type: string;
  message?: string;
  question?: string;
  hint?: string;
  time_left?: number;
}

const WS_URL = "ws://localhost:8000/ws?username=사용자";  // username 적절히 변경

export default function QuizGame() {
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [hint, setHint] = useState<string>("");
  const [answer, setAnswer] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      setConnected(true);
      setChatLog((prev) => [...prev, "✅ 서버와 연결되었습니다."]);
    };

    ws.current.onmessage = (event) => {
      const data: Message = JSON.parse(event.data);

      if (data.type === "quiz") {
        setQuestion(data.question || "");
        setHint(data.hint || "");
        setAnswer("");
      } else if (data.type === "timer" && typeof data.time_left === "number") {
        setTimeLeft(data.time_left);
      } else if (data.type === "chat" && data.message) {
        setChatLog((prev) => [...prev, data.message!]);
      }
    };

    ws.current.onclose = () => {
      setConnected(false);
      setChatLog((prev) => [...prev, "⚠️ 서버와 연결이 끊어졌습니다."]);
    };

    ws.current.onerror = () => {
      setChatLog((prev) => [...prev, "⚠️ 웹소켓 에러가 발생했습니다."]);
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendAnswer = () => {
    if (!answer.trim()) return;
    ws.current?.send(answer.trim());
    setAnswer("");
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", fontFamily: "sans-serif" }}>
      <h1>초성 퀴즈 게임</h1>

      <div>
        <strong>문제:</strong> {question}
      </div>
      <div>
        <strong>힌트:</strong> {hint}
      </div>
      <div style={{ marginTop: 10 }}>
        <strong>남은 시간:</strong> {timeLeft}초
      </div>

      <input
        type="text"
        placeholder="정답을 입력하세요"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendAnswer();
        }}
        disabled={!connected}
        style={{ width: "100%", padding: "8px", marginTop: "10px" }}
      />
      <button
        onClick={sendAnswer}
        disabled={!connected}
        style={{ marginTop: 10, padding: "8px 16px" }}
      >
        제출
      </button>

      <div
        style={{
          marginTop: 20,
          padding: 10,
          border: "1px solid #ccc",
          height: 200,
          overflowY: "auto",
          backgroundColor: "#f9f9f9",
        }}
      >
        {chatLog.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: 5 }}>
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}