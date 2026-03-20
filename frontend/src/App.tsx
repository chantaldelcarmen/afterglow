import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ExperienceLibrary from "./pages/ExperienceLibrary";
import CreateExperience from "./pages/CreateExperience";
import Reflections from "./pages/Reflections";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<ExperienceLibrary />} />
        <Route path="/create" element={<CreateExperience />} />
        <Route path="/reflections" element={<Reflections />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}