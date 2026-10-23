import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { I18nProvider } from "./i18n.jsx";
import "./styles.css";

// HashRouter keeps deep links working on any static host without server config
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter>
      <I18nProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </I18nProvider>
    </HashRouter>
  </React.StrictMode>
);
