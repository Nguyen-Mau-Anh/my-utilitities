import { useState } from 'react';
import './PasswordGenerator.css';

const PasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    let charset = '';
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+~`|}{[]\\:;?><,./-=';

    if (charset === '') {
      alert('Please select at least one character type');
      return;
    }

    let newPassword = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset[randomIndex];
    }

    setPassword(newPassword);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return '';
    
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    if (strength < 3) return 'weak';
    if (strength < 5) return 'medium';
    return 'strong';
  };

  return (
    <div className="password-generator-container">
      <h1>Password Generator</h1>
      <p className="tool-description">Create strong and secure passwords</p>

      <div className="password-display">
        <input 
          type="text" 
          value={password} 
          readOnly 
          placeholder="Your password will appear here"
        />
        <button 
          className="copy-button" 
          onClick={copyToClipboard} 
          disabled={!password}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {password && (
        <div className={`password-strength ${getPasswordStrength()}`}>
          Password Strength: <span>{getPasswordStrength()}</span>
        </div>
      )}

      <div className="options-container">
        <div className="option">
          <label htmlFor="length">Password Length:</label>
          <div className="range-container">
            <input
              type="range"
              id="length"
              min="4"
              max="32"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
            />
            <input
              type="number"
              min="4"
              max="32"
              value={length}
              onChange={(e) => {
                let newValue = e.target.value;
                // Allow empty input for typing
                if (newValue === '') {
                  // Don't update state, just allow typing
                  return;
                }
                
                const newLength = parseInt(newValue);
                // Only update state if it's a valid number
                if (!isNaN(newLength)) {
                  // Clamp the value between 4 and 32 when input is complete
                  const clampedValue = Math.max(4, Math.min(32, newLength));
                  setLength(clampedValue);
                }
              }}
              onBlur={(e) => {
                // Ensure valid range on blur
                let value = parseInt(e.target.value);
                if (isNaN(value) || value < 4) {
                  setLength(4);
                } else if (value > 32) {
                  setLength(32);
                }
              }}
              className="length-input"
            />
          </div>
        </div>

        <div className="checkbox-options">
          <div className="option">
            <input
              type="checkbox"
              id="uppercase"
              checked={includeUppercase}
              onChange={(e) => setIncludeUppercase(e.target.checked)}
            />
            <label htmlFor="uppercase">Include Uppercase Letters</label>
          </div>

          <div className="option">
            <input
              type="checkbox"
              id="lowercase"
              checked={includeLowercase}
              onChange={(e) => setIncludeLowercase(e.target.checked)}
            />
            <label htmlFor="lowercase">Include Lowercase Letters</label>
          </div>

          <div className="option">
            <input
              type="checkbox"
              id="numbers"
              checked={includeNumbers}
              onChange={(e) => setIncludeNumbers(e.target.checked)}
            />
            <label htmlFor="numbers">Include Numbers</label>
          </div>

          <div className="option">
            <input
              type="checkbox"
              id="symbols"
              checked={includeSymbols}
              onChange={(e) => setIncludeSymbols(e.target.checked)}
            />
            <label htmlFor="symbols">Include Symbols</label>
          </div>
        </div>
      </div>

      <button className="generate-button" onClick={generatePassword}>
        Generate Password
      </button>
    </div>
  );
};

export default PasswordGenerator;