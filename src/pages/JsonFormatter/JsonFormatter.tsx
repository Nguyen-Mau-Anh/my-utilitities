import { useState } from 'react';
import './JsonFormatter.css';

const JsonFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState(2);

  const formatJson = () => {
    try {
      if (!input.trim()) {
        setError('Please enter JSON data');
        setOutput('');
        return;
      }

      const parsedJson = JSON.parse(input);
      const formattedJson = JSON.stringify(parsedJson, null, indentSize);
      setOutput(formattedJson);
      setError('');
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
      setOutput('');
    }
  };

  const minifyJson = () => {
    try {
      if (!input.trim()) {
        setError('Please enter JSON data');
        setOutput('');
        return;
      }

      const parsedJson = JSON.parse(input);
      const minifiedJson = JSON.stringify(parsedJson);
      setOutput(minifiedJson);
      setError('');
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
      setOutput('');
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  return (
    <div className="json-formatter-container">
      <h1>JSON Formatter</h1>
      <p className="tool-description">Format, validate and beautify JSON data</p>

      <div className="controls">
        <div className="indent-control">
          <label htmlFor="indent-size">Indent Size:</label>
          <select 
            id="indent-size" 
            value={indentSize} 
            onChange={(e) => setIndentSize(Number(e.target.value))}
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="8">8 spaces</option>
          </select>
        </div>
        <div className="action-buttons">
          <button onClick={formatJson}>Format</button>
          <button onClick={minifyJson}>Minify</button>
          <button onClick={clearAll}>Clear</button>
        </div>
      </div>

      <div className="editor-container">
        <div className="editor-section">
          <h3>Input</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JSON here..."
            className="json-editor"
          />
        </div>

        <div className="editor-section">
          <h3>Output</h3>
          <div className="output-header">
            {output && (
              <button className="copy-button" onClick={copyToClipboard}>
                Copy
              </button>
            )}
          </div>
          {error ? (
            <div className="error-message">{error}</div>
          ) : (
            <pre className="json-output">{output}</pre>
          )}
        </div>
      </div>
    </div>
  );
};

export default JsonFormatter;