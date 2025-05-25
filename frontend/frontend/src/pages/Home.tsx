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

  return (
    <div className='container'>
      <h1>IT 초성 퀴즈</h1>
      <button onClick={handleGoToAbout}></button>
      <button onClick={handleGoToTest}></button>
      <button onClick={handleGoToTest}></button>
    </div>
  );
};

export default Home;