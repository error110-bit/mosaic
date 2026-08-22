import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <main>
      <p className="eyebrow">Mosaic</p>
      <h1>Interactive learning, built to evolve.</h1>
      <p className="intro">
        The project foundation is ready. Learning experiences will arrive in a
        future milestone.
      </p>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
