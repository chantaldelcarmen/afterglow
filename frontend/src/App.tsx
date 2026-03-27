import { BrowserRouter, Route, Routes } from "react-router-dom";
//import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import ExperienceLibrary from "./pages/ExperienceLibrary";
import ExperienceDetail from "./pages/ExperienceDetail";
import CreateExperience from "./pages/CreateExperience";
//import Reflections from "./pages/Reflections";
//import Profile from "./pages/Profile";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Logout } from "./pages/Logout";
import Upload from "./pages/Upload";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { EditExperience } from "./pages/EditExperience";
import { Insights } from "./pages/Insights";
import { AdminDashboard } from "./pages/AdminDashboard";
import { PlatformReviewer } from "./pages/PlatformReviewer";
import { AmbientBackground } from "./components/AmbientBackground";
import { BottomNav } from "./components/BottomNav";

export default function App() {
  return (
    <BrowserRouter>
      <AmbientBackground>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<ExperienceLibrary/>}/>
          <Route path="/insights" element={<Insights />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/create-experience" element={<CreateExperience />} />
          <Route path="/experience/:id/edit" element={<EditExperience />} />
          <Route path="/experience/:id" element={<ExperienceDetail />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/reviewer" element={<PlatformReviewer />} />
        </Routes>
        <BottomNav />
      </AmbientBackground>
    </BrowserRouter>
  );
}