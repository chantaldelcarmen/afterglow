import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { CreateExperience } from "./pages/CreateExperience";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-experience" element={<CreateExperience />}/>
      </Routes>
    </BrowserRouter>
  );
}
