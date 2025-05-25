import React from 'react';
import { useNavigate } from 'react-router-dom';

const Test: React.FC = () => {
  const navigate = useNavigate();
    const handleGoToHome = () => {
    navigate('/');
    };
    const handleGoToAbout = () => {
    navigate('/About');
    };
  return (
    <div>
      <h1>Test 페이지</h1>
      <button onClick={handleGoToHome}>Home 페이지로 이동</button>
      <button onClick={handleGoToAbout}>About 페이지로 이동</button>
    </div>
  );
};

export default Test;