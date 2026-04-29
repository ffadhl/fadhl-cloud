import React, { useState, useRef, useEffect } from 'react';
import { Cloud } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    inputRefs[0].current.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(false);

    if (value && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
    if (e.key === 'Enter' && pin.every(p => p !== '')) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const pinString = pin.join('');
    if (pinString.length === 4) {
      const success = onLogin(pinString);
      if (!success) {
        setError(true);
        setPin(['', '', '', '']);
        inputRefs[0].current.focus();
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        <Cloud size={48} color="var(--primary-color)" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Fadhl Cloud</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Masukkan PIN untuk mengakses cloud
        </p>

        <div className="pin-inputs">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="pin-input"
              style={{ borderColor: error ? '#d93025' : '' }}
            />
          ))}
        </div>

        {error && (
          <p style={{ color: '#d93025', fontSize: '12px', marginTop: '-16px', marginBottom: '16px' }}>
            PIN salah. Silakan coba lagi.
          </p>
        )}

        <button 
          className="btn-primary" 
          onClick={handleSubmit}
          disabled={pin.some(p => p === '')}
        >
          Masuk
        </button>
      </div>
    </div>
  );
};

export default Login;
