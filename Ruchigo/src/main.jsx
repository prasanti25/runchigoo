import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import "./product.css";

import ToastHub from "./components/common/ToastHub.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { RestaurantProvider } from "./context/RestaurantContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { InboxProvider } from "./context/InboxContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            <InboxProvider>
              <CartProvider>
                <RestaurantProvider>
                  <App />
                  <ToastHub />
                </RestaurantProvider>
              </CartProvider>
            </InboxProvider>
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
