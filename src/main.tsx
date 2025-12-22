import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/index.css';
import { PreferencesProvider } from './context/PreferencesContext';

ReactDOM.render(
  <React.StrictMode>
    <PreferencesProvider>
      <App />
    </PreferencesProvider>
  </React.StrictMode>,
  document.getElementById('root')
);