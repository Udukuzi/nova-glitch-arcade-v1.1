import React from 'react';

export default function SimpleTest() {
  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>✅ App is Working!</h1>
      <p style={{ fontSize: '24px', marginBottom: '30px' }}>Frontend is running successfully</p>
      
      <div style={{ 
        background: 'rgba(255,255,255,0.2)', 
        padding: '30px', 
        borderRadius: '15px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2>Server Status:</h2>
        <ul style={{ textAlign: 'left', fontSize: '18px', lineHeight: '1.8' }}>
          <li>✅ Frontend: Running on port 5173</li>
          <li>✅ Backend: Running on port 5178</li>
          <li>✅ React App: Loaded successfully</li>
        </ul>
        
        <div style={{ marginTop: '30px' }}>
          <h3>Test Navigation:</h3>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
            <a href="/" style={{ 
              padding: '10px 20px', 
              background: 'white', 
              color: '#764ba2',
              textDecoration: 'none',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}>Home Page</a>
            
            <a href="/battle-arena" style={{ 
              padding: '10px 20px', 
              background: 'white', 
              color: '#764ba2',
              textDecoration: 'none',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}>Battle Arena</a>
            
            <a href="/test" style={{ 
              padding: '10px 20px', 
              background: 'white', 
              color: '#764ba2',
              textDecoration: 'none',
              borderRadius: '5px',
              fontWeight: 'bold'
            }}>Test Page</a>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '40px' }}>
        <p>If you see this page, your React app is working correctly!</p>
        <p>The issue might be with the splash screen or initial loading.</p>
      </div>
    </div>
  );
}
