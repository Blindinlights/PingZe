import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const storedTheme = window.localStorage.getItem("poem-theme-mode");
const initialTheme = storedTheme === "light" || storedTheme === "dark"
  ? storedTheme
  : window.matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";

document.documentElement.dataset.theme = initialTheme;
document.documentElement.style.colorScheme = initialTheme;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
