import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { CreateExperience } from "./pages/CreateExperience";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import Upload from "./pages/Upload";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-experience" element={<CreateExperience />}/>
        <Route path="/signin" element={<SignIn />}/>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}
