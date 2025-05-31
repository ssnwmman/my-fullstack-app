import { useEffect, useRef, useState } from "react";

type Message = {
  type: "chat" | "quiz";
  message?: string;
  question?: string;
  hint?: string;
};

const Onlinegame: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [hint, setHint] = useState<string>("");
  const [input, setInput] = useState("");
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const name = prompt("닉네임을 입력하세요") || "익명";
    const socket = new WebSocket(`ws://localhost:8000/ws?username=${encodeURIComponent(name)}`);
    ws.current = socket;

    socket.onopen = () => {
      console.log("웹소켓 연결 성공");
    };

    socket.onmessage = (event) => {
      const data: Message = JSON.parse(event.data);
      if (data.type === "chat" && data.message) {
        setMessages((prev) => [...prev, data.message!]);
      } else if (data.type === "quiz" && data.question && data.hint) {
        setQuestion(data.question);
        setHint(data.hint);
      }
    };

    socket.onclose = () => {
      setMessages((prev) => [...prev, "❗ 서버 연결 종료"]);
    };

    return () => {
      socket.close();
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(input.trim());
      setInput("");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🧩 초성 + 힌트 퀴즈 게임</h1>
      <h2>문제: {question}</h2>
      <p>힌트: {hint}</p>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="정답 입력..."
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        style={{ padding: "0.5rem", width: "300px" }}
      />
      <button onClick={sendMessage} style={{ marginLeft: "1rem", padding: "0.5rem" }}>
        제출
      </button>

      <ul style={{ marginTop: "2rem" }}>
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default Onlinegame;