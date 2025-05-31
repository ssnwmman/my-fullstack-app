import React from 'react';
import { useNavigate } from 'react-router-dom';
import './pagecss/Home.css'

const Home: React.FC = () => {
  const navigate = useNavigate();

    const handleGoTogeneral = () => {
    navigate('/generalgame');
    };
    const handleGoToTest = () => {
    navigate('/Test');
    };
    const handleGoToonline = () => {
    navigate('/onlinegame')
    };

  return (
    <div className='container'>
      <h1>IT 초성 퀴즈</h1>
      <button onClick={handleGoTogeneral}>일반 게임 시작</button>
      <button onClick={handleGoToonline}>온라인 게임 시작</button>
      <button onClick={handleGoToTest}>게임 방법 설명</button>
    </div>
  );
};

export default Home;