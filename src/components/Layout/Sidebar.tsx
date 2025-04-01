import { NavLink } from 'react-router-dom';
import { Sun, Moon, FileJson, KeyRound, Link2, Database } from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  currentTheme: string;
}

const Sidebar = ({ isOpen, toggleTheme, currentTheme }: SidebarProps) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h2>Utility Tools</h2>
        <button className="theme-toggle" onClick={toggleTheme}>
          {currentTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/" end>
              <span className="icon">🏠</span>
              <span className="text">Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/json-formatter">
              <span className="icon"><FileJson size={18} /></span>
              <span className="text">JSON Formatter</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/password-generator">
              <span className="icon"><KeyRound size={18} /></span>
              <span className="text">Password Generator</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/url-parser">
              <span className="icon"><Link2 size={18} /></span>
              <span className="text">URL Parser</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/sql-formatter">
              <span className="icon"><Database size={18} /></span>
              <span className="text">SQL Formatter</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="sidebar-footer">
        <p>© 2025 Utility Tools</p>
      </div>
    </aside>
  );
};

export default Sidebar;