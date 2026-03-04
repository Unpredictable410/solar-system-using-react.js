import React from 'react';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>
      <h1>Welcome to the Origin</h1>
      <p>Explore the history of life.</p>
      <br />
      {/* Button to start the 3D experience */}
      <Link to="/evolution" style={{ padding: '10px 20px', background: 'white', color: 'black', textDecoration: 'none', borderRadius: '5px' }}>
        Start Evolution
      </Link>
    </div>
  );
};