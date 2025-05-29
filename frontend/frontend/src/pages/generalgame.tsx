import React from 'react';
import { useNavigate } from 'react-router-dom';

const About: React.FC = () => {
  const navigate = useNavigate();
    const handleGoToHome = () => {
    navigate('/');
    };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black p-4">

      <div className="w-full flex justify-end items-start">
        <button onClick={handleGoToHome}className="bg-black text-white px-3 py-2 rounded text-sm">게임 끝내기</button>
      </div>

      <h1 className="text-4xl font-bold mt-10 mb-4">단어 초성</h1>

      <p className="text-center text-sm text-gray-700 max-w-md mb-20">
        단어 의미 단어 의미 단어 의미 단어 의미 단어 의미 단어 의미 단어 의미 단어 의미
      </p>

      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="정답 입력란"
          className="bg-black text-white text-center px-4 py-2 rounded w-64 placeholder-white"
        />
        <button className="bg-black text-white px-3 py-2 rounded text-sm">건너뛰기</button>
      </div>
    </div>
  );
};

export default About;