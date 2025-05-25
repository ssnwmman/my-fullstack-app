import React from 'react';
import { useNavigate } from 'react-router-dom';

const About: React.FC = () => {
  const navigate = useNavigate();
    const handleGoToHome = () => {
    navigate('/');
    };
    const handleGoToTest = () => {
      navigate('/Test')
    }

  return (
    <div>
      <h1>About 페이지</h1>
      <button onClick={handleGoToHome}>Home 페이지로 이동</button>
      <button onClick={handleGoToTest}>Test 페이지로 이동</button>
    </div>
  );
};

export default About;