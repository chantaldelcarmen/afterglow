import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";

export function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.signOut().then(() => navigate("/signin"));
  }, [navigate]);

  return null;
}
