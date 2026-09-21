import React from "react";
import ReactDOM from 'react-dom/client'
import './index.css'
import './styles/globals.css'
import { AuthProvider } from './authContext.jsx'
import { ThemeProvider } from './ThemeContext.jsx'
import ProjectRoutes from './Routes.jsx';
import { BrowserRouter as Router } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <ThemeProvider>
      <Router>
        <ProjectRoutes />
      </Router>
    </ThemeProvider>
  </AuthProvider>
);
