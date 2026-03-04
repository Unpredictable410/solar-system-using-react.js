import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import your pages/components (Create these files next!)
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Evolution } from './pages/Evolution';

import './App.css';

function App() {
  return (
    <Router>
      {/* The Header is outside Routes so it stays visible while scrolling/navigating */}
      <Header />
      
      <Routes>
        {/* The Landing Page */}
        <Route path="/" element={<Home />} />
        
        {/* The 3D Evolution Experience */}
        <Route path="/evolution" element={<Evolution />} />
      </Routes>
    </Router>
  );
}

export default App;