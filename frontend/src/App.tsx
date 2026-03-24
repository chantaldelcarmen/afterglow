import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import ExperienceLibrary from "./pages/ExperienceLibrary";
import ExperienceDetail from "./pages/ExperienceDetail";
import CreateExperience from "./pages/CreateExperience";
import Reflections from "./pages/Reflections";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<ExperienceLibrary />} />
          <Route path="/experience/:id" element={<ExperienceDetail />} />
          <Route path="/create" element={<CreateExperience />} />
          <Route path="/reflections" element={<Reflections />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}