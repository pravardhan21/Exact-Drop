import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Viewer from './pages/Viewer';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/v/:code" element={<Viewer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
