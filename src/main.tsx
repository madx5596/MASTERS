import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { useAuthStore } from "./store";

// Check auth on app start
useAuthStore.getState().checkAuth();

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
