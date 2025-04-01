import { useState } from 'react';
import './SqlFormatter.css';
import { Parser } from 'node-sql-parser';

const SqlFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [sqlDialect, setSqlDialect] = useState('mysql');
  const [indentSize, setIndentSize] = useState(2);
  const [queryAnalysis, setQueryAnalysis] = useState<{
    tables: { name: string; fields: string[] }[];
    queryTree: string;
    complexity: string;
  } | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Function to format SQL based on selected dialect
  const formatSql = () => {
    try {
      if (!input.trim()) {
        setError('Please enter SQL query');
        setOutput('');
        setQueryAnalysis(null);
        return;
      }

      // Basic SQL formatting function
      // In a real implementation, we would use a proper SQL formatting library
      const formattedSql = basicSqlFormat(input, sqlDialect, indentSize);
      setOutput(formattedSql);
      setError('');
      
      // Analyze the SQL query
      analyzeQuery(input, sqlDialect);
    } catch (err) {
      setError(`Error formatting SQL: ${err instanceof Error ? err.message : String(err)}`);
      setOutput('');
      setQueryAnalysis(null);
    }
  };
  
  // Function to analyze SQL query and extract tables, fields, and complexity
  const analyzeQuery = (sql: string, dialect: string) => {
    try {
      const parser = new Parser();
      const opt = { database: dialect };
      
      // Parse the SQL query
      const ast = parser.astify(sql, opt);
      
      // Extract tables and fields
      const tables: { name: string; fields: string[] }[] = [];
      const tablesMap = new Map<string, Set<string>>();
      
      // Function to traverse the AST and extract tables and columns
      const extractTablesAndColumns = (node: any) => {
        if (!node || typeof node !== 'object') return;
        
        // Extract table information
        if (node.type === 'table' && node.table) {
          const tableName = node.table;
          if (!tablesMap.has(tableName)) {
            tablesMap.set(tableName, new Set<string>());
          }
        }
        
        // Extract column information
        if (node.type === 'column_ref' && node.column && node.table) {
          const tableName = node.table;
          const columnName = node.column;
          
          if (!tablesMap.has(tableName)) {
            tablesMap.set(tableName, new Set<string>());
          }
          
          tablesMap.get(tableName)?.add(columnName);
        }
        
        // Recursively process all properties
        for (const key in node) {
          if (Array.isArray(node[key])) {
            node[key].forEach((item: any) => extractTablesAndColumns(item));
          } else if (typeof node[key] === 'object' && node[key] !== null) {
            extractTablesAndColumns(node[key]);
          }
        }
      };
      
      // Start extraction
      if (Array.isArray(ast)) {
        ast.forEach(node => extractTablesAndColumns(node));
      } else {
        extractTablesAndColumns(ast);
      }
      
      // Convert map to array
      tablesMap.forEach((fields, name) => {
        tables.push({
          name,
          fields: Array.from(fields)
        });
      });
      
      // Generate query tree
      let queryTree = 'Query Execution Tree:\n';
      
      if (Array.isArray(ast)) {
        ast.forEach((statement, index) => {
          queryTree += `Statement ${index + 1}:\n`;
          queryTree += generateQueryTree(statement, 1);
        });
      } else {
        queryTree += generateQueryTree(ast, 0);
      }
      
      // Analyze complexity
      const complexity = analyzeComplexity(ast);
      
      setQueryAnalysis({ tables, queryTree, complexity });
      setShowAnalysis(true);
    } catch (err) {
      console.error('Error analyzing query:', err);
      setQueryAnalysis(null);
    }
  };
  
  // Function to generate a query execution tree
  const generateQueryTree = (node: any, level: number): string => {
    if (!node || typeof node !== 'object') return '';
    
    const indent = '  '.repeat(level);
    let tree = '';
    
    // Handle different node types
    if (node.type === 'select') {
      tree += `${indent}SELECT\n`;
      
      if (node.from) {
        tree += `${indent}  FROM\n`;
        node.from.forEach((fromItem: any) => {
          if (fromItem.table) {
            tree += `${indent}    TABLE: ${fromItem.table}${fromItem.as ? ` AS ${fromItem.as}` : ''}\n`;
          } else if (fromItem.expr) {
            tree += `${indent}    SUBQUERY\n`;
            tree += generateQueryTree(fromItem.expr, level + 3);
          }
        });
      }
      
      if (node.where) {
        tree += `${indent}  WHERE\n`;
        tree += `${indent}    ${JSON.stringify(node.where)}\n`;
      }
      
      if (node.group) {
        tree += `${indent}  GROUP BY\n`;
      }
      
      if (node.having) {
        tree += `${indent}  HAVING\n`;
      }
      
      if (node.order) {
        tree += `${indent}  ORDER BY\n`;
      }
      
      if (node.limit) {
        tree += `${indent}  LIMIT\n`;
      }
    } else if (node.type === 'insert') {
      tree += `${indent}INSERT INTO ${node.table}\n`;
    } else if (node.type === 'update') {
      tree += `${indent}UPDATE ${node.table}\n`;
    } else if (node.type === 'delete') {
      tree += `${indent}DELETE FROM ${node.table}\n`;
    } else if (node.type === 'create') {
      tree += `${indent}CREATE TABLE ${node.table}\n`;
    } else if (node.type === 'alter') {
      tree += `${indent}ALTER TABLE ${node.table}\n`;
    } else {
      tree += `${indent}${node.type || 'UNKNOWN NODE TYPE'}\n`;
    }
    
    return tree;
  };
  
  // Function to analyze query complexity
  const analyzeComplexity = (ast: any): string => {
    let complexity = 'Query Complexity Analysis:\n';
    let complexityScore = 0;
    let factors: any[] = [];
    
    // Function to analyze a node for complexity
    const analyzeNode = (node: any) => {
      if (!node || typeof node !== 'object') return;
      
      // Check for joins (increases complexity)
      if (node.type === 'select') {
        // Count tables in FROM clause
        const tableCount = node.from?.length || 0;
        if (tableCount > 1) {
          complexityScore += tableCount - 1;
          factors.push(`Multiple tables (${tableCount}) - potential joins`);
        }
        
        // Check for subqueries
        let hasSubquery = false;
        node.from?.forEach((fromItem: any) => {
          if (fromItem.expr) {
            hasSubquery = true;
            complexityScore += 2;
          }
        });
        if (hasSubquery) {
          factors.push('Contains subqueries');
        }
        
        // Check for GROUP BY
        if (node.group) {
          complexityScore += 1;
          factors.push('Uses GROUP BY');
        }
        
        // Check for HAVING
        if (node.having) {
          complexityScore += 1;
          factors.push('Uses HAVING clause');
        }
        
        // Check for ORDER BY
        if (node.order) {
          complexityScore += 1;
          factors.push('Uses ORDER BY');
        }
        
        // Check for complex WHERE conditions
        if (node.where) {
          const whereComplexity = analyzeWhereComplexity(node.where);
          complexityScore += whereComplexity.score;
          factors = [...factors, ...whereComplexity.factors];
        }
      }
      
      // Recursively process all properties
      for (const key in node) {
        if (Array.isArray(node[key])) {
          node[key].forEach((item: any) => analyzeNode(item));
        } else if (typeof node[key] === 'object' && node[key] !== null) {
          analyzeNode(node[key]);
        }
      }
    };
    
    // Analyze WHERE clause complexity
    const analyzeWhereComplexity = (whereNode: any): { score: number; factors: string[] } => {
      let score = 0;
      const factors: string[] = [];
      
      const countConditions = (node: any): number => {
        if (!node || typeof node !== 'object') return 0;
        
        if (node.operator === 'AND' || node.operator === 'OR') {
          return countConditions(node.left) + countConditions(node.right);
        }
        
        return 1;
      };
      
      const conditionCount = countConditions(whereNode);
      if (conditionCount > 1) {
        score += Math.min(conditionCount - 1, 3); // Cap at 3 for very complex WHERE
        factors.push(`Complex WHERE clause with ${conditionCount} conditions`);
      }
      
      return { score, factors };
    };
    
    // Start analysis
    if (Array.isArray(ast)) {
      ast.forEach(node => analyzeNode(node));
    } else {
      analyzeNode(ast);
    }
    
    // Determine complexity level
    let complexityLevel = 'Simple';
    if (complexityScore > 8) {
      complexityLevel = 'Very Complex';
    } else if (complexityScore > 5) {
      complexityLevel = 'Complex';
    } else if (complexityScore > 2) {
      complexityLevel = 'Moderate';
    }
    
    complexity += `Complexity Level: ${complexityLevel} (Score: ${complexityScore})\n\n`;
    
    if (factors.length > 0) {
      complexity += 'Factors affecting complexity:\n';
      factors.forEach(factor => {
        complexity += `- ${factor}\n`;
      });
    } else {
      complexity += 'This is a simple query with no complex operations.\n';
    }
    
    return complexity;
  };

  // Basic SQL formatter function
  // This is a simple implementation - in production, use a dedicated library
  const basicSqlFormat = (sql: string, dialect: string, indent: number) => {
    // Remove extra whitespace
    let formatted = sql.trim().replace(/\s+/g, ' ');
    
    // Common SQL keywords to format
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN',
      'OUTER JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
      'UNION', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE',
      'ALTER TABLE', 'DROP TABLE', 'AND', 'OR', 'AS'
    ];
    
    // Replace keywords with line breaks and proper indentation
    const indentStr = ' '.repeat(indent);
    
    // Handle different dialects
    if (dialect === 'mysql') {
      // MySQL specific formatting could go here
    } else if (dialect === 'sqlserver') {
      // SQL Server specific formatting could go here
    } else if (dialect === 'oracle') {
      // Oracle specific formatting could go here
    } else if (dialect === 'postgresql') {
      // PostgreSQL specific formatting could go here
    }
    
    // Format common SQL structure
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      formatted = formatted.replace(regex, `\n${keyword}`);
    });
    
    // Indent lines
    formatted = formatted.split('\n').map(line => {
      if (line.trim().startsWith('SELECT') || 
          line.trim().startsWith('INSERT') || 
          line.trim().startsWith('CREATE') || 
          line.trim().startsWith('UPDATE') || 
          line.trim().startsWith('DELETE')) {
        return line.trim();
      }
      return indentStr + line.trim();
    }).join('\n');
    
    // Format parentheses
    let depth = 0;
    let inString = false;
    let stringChar = '';
    let result = '';
    
    for (let i = 0; i < formatted.length; i++) {
      const char = formatted[i];
      
      // Handle string literals
      if ((char === "'" || char === '"') && (i === 0 || formatted[i-1] !== '\\')) {
        if (inString && char === stringChar) {
          inString = false;
        } else if (!inString) {
          inString = true;
          stringChar = char;
        }
      }
      
      if (!inString) {
        if (char === '(') {
          depth++;
          result += char + '\n' + indentStr.repeat(depth);
          continue;
        } else if (char === ')') {
          depth = Math.max(0, depth - 1);
          result += '\n' + indentStr.repeat(depth) + char;
          continue;
        } else if (char === ',') {
          result += char + '\n' + indentStr.repeat(depth);
          continue;
        }
      }
      
      result += char;
    }
    
    return result.trim();
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
    setQueryAnalysis(null);
    setShowAnalysis(false);
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
    }
  };

  return (
    <div className="sql-formatter-container">
      <h1>SQL Formatter</h1>
      <p className="tool-description">Format and beautify SQL queries for different database systems</p>

      <div className="controls">
        <div className="format-controls">
          <div className="control-item">
            <label htmlFor="sql-dialect">SQL Dialect:</label>
            <select 
              id="sql-dialect" 
              value={sqlDialect} 
              onChange={(e) => setSqlDialect(e.target.value)}
            >
              <option value="mysql">MySQL</option>
              <option value="sqlserver">SQL Server</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="oracle">Oracle</option>
              <option value="sqlite">SQLite</option>
            </select>
          </div>
          
          <div className="control-item">
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
        </div>
        
        <div className="action-buttons">
          <button onClick={formatSql}>Format SQL</button>
          <button onClick={clearAll}>Clear</button>
        </div>
      </div>

      <div className="editor-container">
        <div className="editor-section">
          <h3>Input</h3>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your SQL query here..."
            className="sql-editor"
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
            <pre className="sql-output">{output}</pre>
          )}
        </div>
      </div>

      {queryAnalysis && (
        <div className="analysis-container">
          <div className="analysis-header">
            <h3>SQL Query Analysis</h3>
            <button 
              className="toggle-button" 
              onClick={() => setShowAnalysis(!showAnalysis)}
            >
              {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
            </button>
          </div>
          
          {showAnalysis && (
            <div className="analysis-content">
              <div className="analysis-section">
                <h4>Tables and Fields</h4>
                {queryAnalysis.tables.length > 0 ? (
                  <div className="tables-list">
                    {queryAnalysis.tables.map((table, index) => (
                      <div key={index} className="table-item">
                        <div className="table-name">{table.name}</div>
                        <div className="table-fields">
                          {table.fields.length > 0 ? (
                            <ul>
                              {table.fields.map((field, fieldIndex) => (
                                <li key={fieldIndex}>{field}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>No specific fields referenced</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No tables found in the query</p>
                )}
              </div>
              
              <div className="analysis-section">
                <h4>Query Execution Tree</h4>
                <pre className="query-tree">{queryAnalysis.queryTree}</pre>
              </div>
              
              <div className="analysis-section">
                <h4>Query Complexity</h4>
                <pre className="query-complexity">{queryAnalysis.complexity}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SqlFormatter;