import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { CreateExperience } from "./pages/CreateExperience";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Logout } from "./pages/Logout";
import Upload from "./pages/Upload";
import { Profile } from "./pages/Profile";
import { Settings } from "./pages/Settings";
import { EditExperience } from "./pages/EditExperience";
import { Library } from "./pages/Library";
import { Insights } from "./pages/Insights";
import { AdminDashboard } from "./pages/AdminDashboard";
import { PlatformReviewer } from "./pages/PlatformReviewer";
import { Unauthorized } from "./pages/Unauthorized";
import { AmbientBackground } from "./components/AmbientBackground";
import { BottomNav } from "./components/BottomNav";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <AmbientBackground>
        <Routes>
          {/* Public routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Authenticated routes */}
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/create-experience" element={<ProtectedRoute><CreateExperience /></ProtectedRoute>} />
          <Route path="/experience/:id/edit" element={<ProtectedRoute><EditExperience /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />

          {/* Role-restricted routes */}
          <Route path="/reviewer" element={<ProtectedRoute allowedRoles={["platform_reviewer", "admin"]}><PlatformReviewer /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
        </Routes>
        <BottomNav />
      </AmbientBackground>
    </BrowserRouter>
  );
}