import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import './styles/themes.css';
import './styles/components.css';

// Disable React DevTools
window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { isDisabled: true };

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
