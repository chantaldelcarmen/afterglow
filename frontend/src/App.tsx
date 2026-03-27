import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { CreateExperience } from "./pages/CreateExperience";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import Upload from "./pages/Upload";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { EditExperience } from "./pages/EditExperience";
import { AmbientBackground } from "./components/AmbientBackground";
import { BottomNav } from "./components/BottomNav";

export default function App() {
  return (
    <BrowserRouter>
      <AmbientBackground>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-experience" element={<CreateExperience />}/>
        <Route path="/signin" element={<SignIn />}/>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/experience/:id/edit" element={<EditExperience />} />
      </Routes>
      <BottomNav />
      </AmbientBackground>
    </BrowserRouter>
  );
}
