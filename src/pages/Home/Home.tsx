import { FileJson, KeyRound, Link2, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Home.css';

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

const ToolCard = ({ title, description, icon, path }: ToolCardProps) => {
  return (
    <Link to={path} className="tool-card">
      <div className="tool-card-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </Link>
  );
};

const Home = () => {
  const tools = [
    {
      title: 'JSON Formatter',
      description: 'Format, validate and beautify JSON data',
      icon: <FileJson size={32} />,
      path: '/json-formatter'
    },
    {
      title: 'Password Generator',
      description: 'Create strong and secure passwords',
      icon: <KeyRound size={32} />,
      path: '/password-generator'
    },
    {
      title: 'URL Parser',
      description: 'Parse and analyze URL components',
      icon: <Link2 size={32} />,
      path: '/url-parser'
    },
    {
      title: 'SQL Formatter',
      description: 'Format and beautify SQL queries for different database systems',
      icon: <Database size={32} />,
      path: '/sql-formatter'
    }
  ];

  return (
    <div className="home-container">
      <h1>Utility Tools</h1>
      <p className="home-description">
        A collection of useful tools to help with everyday tasks
      </p>
      <div className="tools-grid">
        {tools.map((tool, index) => (
          <ToolCard key={index} {...tool} />
        ))}
      </div>
    </div>
  );
};

export default Home;