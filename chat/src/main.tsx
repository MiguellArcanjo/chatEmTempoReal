import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import Router from './router';

const rootElement = document.getElementById('root');
if (rootElement !== null) {
  const root = ReactDOM.createRoot(rootElement); 
  root.render(
    <StrictMode>
      <Router />
    </StrictMode>,
  );
}