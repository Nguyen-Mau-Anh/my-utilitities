import { HashRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import JsonFormatter from './pages/JsonFormatter/JsonFormatter'
import PasswordGenerator from './pages/PasswordGenerator/PasswordGenerator'
import UrlParser from './pages/UrlParser/UrlParser'
import SqlFormatter from './pages/SqlFormatter/SqlFormatter'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="json-formatter" element={<JsonFormatter />} />
          <Route path="password-generator" element={<PasswordGenerator />} />
          <Route path="url-parser" element={<UrlParser />} />
          <Route path="sql-formatter" element={<SqlFormatter />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
