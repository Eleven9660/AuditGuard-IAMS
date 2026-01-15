import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import App from './App';
import { AuthProvider } from './src/context/AuthContext';
import outputs from './amplify_outputs.json';

// Configure Amplify with backend outputs
Amplify.configure(outputs);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Authenticator>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Authenticator>
  </React.StrictMode>
);