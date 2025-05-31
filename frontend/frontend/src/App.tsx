import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/generalgame';
import Test from './pages/Test';
import Onlinegame from './pages/onlinegame';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generalgame" element={<About />} />
        <Route path="/Test" element={<Test />}/>
        <Route path="/onlinegame" element={<Onlinegame />}/>
      </Routes>
    </Router>
  );
};

export default App;