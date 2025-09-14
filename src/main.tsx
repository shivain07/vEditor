import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router";
import MainRoutes from "./routes/MainRoutes.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
     <MainRoutes/>
    </BrowserRouter>
  </StrictMode>
);
