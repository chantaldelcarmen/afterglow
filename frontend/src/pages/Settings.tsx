import { useNavigate } from "react-router-dom";
import { H1, H2, Body } from "../components/Typography";
import supabase from "../utils/supabase";

export function Settings() {
  const navigate = useNavigate();

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  return (
    <div className="h-full flex flex-col px-6 py-8 space-y-8 overflow-y-auto">
      <H1 className="text-center">Afterglow</H1>

      <section className="space-y-3">
        <H2>Settings</H2>

        <button
          onClick={handleLogOut}
          className="w-full rounded-full border backdrop-blur-md px-5 py-3.5 flex items-center justify-center gap-2 transition-all duration-300"
          style={{
            background: "var(--color-button-plum-bg)",
            borderColor: "var(--color-button-plum-border)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-button-plum-bg-hover)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.35), 0 0 25px var(--color-button-plum-glow-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--color-button-plum-bg)";
            e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.35), 0 0 18px var(--color-button-plum-glow)";
          }}
        >
          <Body style={{ color: "var(--color-text-primary)" }}>Log Out</Body>
        </button>
      </section>
    </div>
  );
}
