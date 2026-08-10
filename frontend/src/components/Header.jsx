import React from 'react';
import { Link } from 'react-router-dom';

export const Header = () => {
  return (
    <nav style={{ position: 'fixed', top: 0, width: '100%', padding: '20px', color: 'white', zIndex: 100, display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ fontWeight: 'bold' }}>EVO.</div>
      <div>
        <Link to="/" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>Home</Link>
        <Link to="/evolution" style={{ color: '#00ff88', textDecoration: 'none' }}>Evolution Mode</Link>
      </div>
    </nav>
  );
};