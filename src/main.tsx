import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { useAuthStore, useDataStore } from "./store";

// Check auth on app start
useAuthStore.getState().checkAuth();

// Load initial data
useDataStore.getState().fetchData();

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
