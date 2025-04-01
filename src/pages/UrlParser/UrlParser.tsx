import { useState } from 'react';
import './UrlParser.css';

interface ParsedUrl {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  searchParams: Record<string, string>;
}

const UrlParser = () => {
  const [url, setUrl] = useState('');
  const [parsedUrl, setParsedUrl] = useState<ParsedUrl | null>(null);
  const [error, setError] = useState('');

  const parseUrl = () => {
    try {
      if (!url.trim()) {
        setError('Please enter a URL');
        setParsedUrl(null);
        return;
      }

      // Add protocol if missing
      let urlToProcess = url;
      if (!url.match(/^[a-zA-Z]+:\/\//)) {
        urlToProcess = 'https://' + url;
      }

      const parsedUrlObj = new URL(urlToProcess);
      
      // Extract search params
      const searchParams: Record<string, string> = {};
      parsedUrlObj.searchParams.forEach((value, key) => {
        searchParams[key] = value;
      });

      setParsedUrl({
        protocol: parsedUrlObj.protocol,
        hostname: parsedUrlObj.hostname,
        port: parsedUrlObj.port || '(default)',
        pathname: parsedUrlObj.pathname,
        search: parsedUrlObj.search,
        hash: parsedUrlObj.hash,
        searchParams
      });
      setError('');
    } catch (err) {
      setError(`Invalid URL: ${err instanceof Error ? err.message : String(err)}`);
      setParsedUrl(null);
    }
  };

  const clearUrl = () => {
    setUrl('');
    setParsedUrl(null);
    setError('');
  };

  return (
    <div className="url-parser-container">
      <h1>URL Parser</h1>
      <p className="tool-description">Parse and analyze URL components</p>

      <div className="url-input-container">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a URL (e.g., https://example.com/path?query=value)"
          className="url-input"
        />
        <div className="url-buttons">
          <button onClick={parseUrl}>Parse</button>
          <button onClick={clearUrl}>Clear</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {parsedUrl && (
        <div className="parsed-url-container">
          <h2>Parsed URL Components</h2>
          
          <div className="component-grid">
            <div className="component">
              <h3>Protocol</h3>
              <div className="component-value">{parsedUrl.protocol}</div>
            </div>
            
            <div className="component">
              <h3>Hostname</h3>
              <div className="component-value">{parsedUrl.hostname}</div>
            </div>
            
            <div className="component">
              <h3>Port</h3>
              <div className="component-value">{parsedUrl.port}</div>
            </div>
            
            <div className="component">
              <h3>Path</h3>
              <div className="component-value">{parsedUrl.pathname || '/'}</div>
            </div>
            
            <div className="component">
              <h3>Query String</h3>
              <div className="component-value">{parsedUrl.search || '(none)'}</div>
            </div>
            
            <div className="component">
              <h3>Hash/Fragment</h3>
              <div className="component-value">{parsedUrl.hash || '(none)'}</div>
            </div>
          </div>

          {Object.keys(parsedUrl.searchParams).length > 0 && (
            <div className="query-params">
              <h3>Query Parameters</h3>
              <table>
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(parsedUrl.searchParams).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UrlParser;