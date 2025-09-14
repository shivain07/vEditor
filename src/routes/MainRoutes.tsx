import { Route, Routes } from "react-router";
import Home from "../pages/Home";
import FileConverter from "../pages/FileConverter";
import Roadmap from "../pages/Roadmap";

function MainRoutes() {
  return (
    <Routes>
      <Route index path="/" element={<Home />} />
      <Route path="/converter" element={<FileConverter />} />
      <Route path="/roadmap" element={<Roadmap />} />
    </Routes>
  );
}

export default MainRoutes;
