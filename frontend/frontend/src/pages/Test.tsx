import React from 'react';
import { useNavigate } from 'react-router-dom';

const Test: React.FC = () => {
  const navigate = useNavigate();
    const handleGoToHome = () => {
    navigate('/');
    };
return (
    <div className="p-6 max-w-lg mx-auto text-white bg-black min-h-screen">
      <div className="flex items-center space-x-4">
        <button onClick={handleGoToHome} className="text-white text-2xl" aria-label="뒤로 가기">
          &larr;
        </button>
        <h1 className="text-xl font-bold">게임 플레이 방법</h1>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-2">일반 게임 플레이 방법</h2>
        <p className="text-sm leading-relaxed">
          단어의 초성과 단어의 의미를 보고 단어의 초성을 맞추는 게임
          <br />
          건너뛰기 버튼을 누르면 정답을 알려주고 다음 문제로 넘어간다.
          <br />
          3문제를 틀릴시 게임이 끝난다.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">랭크 게임 플레이 방법</h2>
        <p className="text-sm leading-relaxed">
          기본 게임 방식은 일반 게임 모드와 같지만 건너 뛰기 버튼은 없다.
          <br />
          1대1로 대결을 하는 PVP 형식으로 진행된다.
          <br />
          먼저 정답을 맞추는 사람이 1점을 얻는다.
          <br />
          두 사람이 30초 안에 정답을 맞추지 못할 시 다음 문제로 넘어간다.
          <br />
          총 10점을 획득하는 사람이 승리
        </p>
      </section>
    </div>
  );
};

export default Test;