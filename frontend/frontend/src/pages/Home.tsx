import React from 'react';
import { useNavigate } from 'react-router-dom';

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
      <button onClick={handleGoToAbout}>About페이지로 이동</button>
      <button onClick={handleGoToTest}>Test페이지로 이동</button>
      <button onClick={handleGoToUm}>아직 미정</button>
    </div>
  );
};

export default Home;