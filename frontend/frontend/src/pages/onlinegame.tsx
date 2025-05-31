import { useEffect, useRef, useState } from "react";

type Message = {
  type: "chat" | "quiz";
  message?: string;
  question?: string;
  hint?: string;
};

const Onlinegame = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [hint, setHint] = useState<string>("");
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const name = prompt("닉네임을 입력하세요") || "익명";
    setUsername(name);
    const socket = new WebSocket(`ws://localhost:8000/ws?username=${encodeURIComponent(name)}`);
    ws.current = socket;

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

  useEffect(() => {
    // 채팅창 스크롤 아래로 이동
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() && ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(input.trim());
      setInput("");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "600px", margin: "0 auto" }}>
      <h1>🧩 온라인 IT 초성 퀴즈 게임</h1>
      <h2>문제: {question}</h2>
      <p>힌트: {hint}</p>

      <div style={{ display: "flex", marginTop: "1rem" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="정답 입력..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ padding: "0.5rem", flex: 1 }}
        />
        <button onClick={sendMessage} style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}>
          제출
        </button>
      </div>

      <div
        style={{
          marginTop: "2rem",
          height: "300px",
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              backgroundColor: msg.includes(username) ? "#d1e7dd" : "#ffffff",
              padding: "0.5rem 1rem",
              marginBottom: "0.5rem",
              borderRadius: "20px",
              alignSelf: "flex-start",
              maxWidth: "80%",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            {msg}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
    </div>
  );
};

export default Onlinegame;