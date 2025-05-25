import React from 'react';
import { useNavigate } from 'react-router-dom';
import './pagecss/Home.css'

const Home: React.FC = () => {
  const navigate = useNavigate();

   const handleGoToAbout = () => {
    navigate('/about');
    };
    const handleGoToTest = () => {
    navigate('/Test');
    };
    const handleGoToUm = () => {
      navigate('/');
    };

  return (
    <div className='container'>
      <h1>IT 초성 퀴즈</h1>
      <button onClick={handleGoToAbout}>일반 게임 시작</button>
      <button onClick={handleGoToTest}>온라인 게임 시작</button>
      <button onClick={handleGoToUm}>게임 방법 설명</button>
    </div>
  );
};

export default Home;