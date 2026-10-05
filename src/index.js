import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { isFirebaseConfigured } from "./firebase";
import { SetupNotice } from "./components/SetupNotice";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<React.StrictMode>{isFirebaseConfigured ? <App /> : <SetupNotice />}</React.StrictMode>);
