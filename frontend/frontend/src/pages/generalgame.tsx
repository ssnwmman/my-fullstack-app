import React from 'react';
import { useNavigate } from 'react-router-dom';

const About: React.FC = () => {
  const navigate = useNavigate();
    const handleGoToHome = () => {
    navigate('/');
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black px-4 py-6 relative">
      {/* Header */}
      <div className="absolute top-4 right-4">
        <button onClick={handleGoToHome}className="bg-black text-white px-4 py-2 rounded text-sm">게임 끝내기</button>
      </div>

      {/* Title */}
      <h1 className="text-5xl font-bold mt-10 mb-6">단어 초성</h1>

      {/* Description */}
      <p className="text-center text-xs text-black max-w-lg mb-32">
        단어 의미 단어 의미 단어 의미 단어 의미 단어 의미 단어 의미 단어 의미 단어 의미
      </p>

      {/* Input and Skip Buttons */}
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="정답 입력란"
          className="bg-black text-white text-center px-6 py-3 rounded-full w-72 placeholder-white text-lg"
        />
        <button className="bg-black text-white px-4 py-3 rounded-full text-sm">건너뛰기</button>
      </div>
    </div>
  );
};

export default About;