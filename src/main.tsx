import { createRoot } from "react-dom/client";
// import "./index.css";
import App from "./App.tsx";
import { clearFieldCache } from "./components/utilities/clearFieldCache";

// Wipe any cached field-level theme values from localStorage before React
// mounts so the backend draft is the sole source of truth on every page
// load. Schema/draft hydration repopulates store2 with the current values.
clearFieldCache();

createRoot(document.getElementById("root")!).render(<App />);
