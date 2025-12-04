
  import { createRoot } from "react-dom/client";
  import { BrowserRouter, Routes, Route } from "react-router-dom";
  import App from "./App.tsx";
  import { Landing } from "./pages/Landing.tsx";
  import "./index.css";
  import "./utils/debugUtils";

  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/landing" element={<Landing />} />
      </Routes>
    </BrowserRouter>
  );
  