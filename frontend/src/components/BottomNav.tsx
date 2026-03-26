import { Link, useLocation } from "react-router-dom";
import { House, LibraryBig, Plus, Sparkles, CircleUserRound } from "lucide-react";

const navItems = [
  { label: "Home", path: "/", icon: House },
  { label: "Library", path: "/library", icon: LibraryBig },
  { label: "+", path: "/create", icon: Plus },
  { label: "Reflections", path: "/reflections", icon: Sparkles },
  { label: "Profile", path: "/profile", icon: CircleUserRound },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="relative w-full max-w-[430px]">
        <div className="rounded-t-[34px] border-t border-white/10 bg-[#3A0F46]/92 px-6 pb-5 pt-4 backdrop-blur-xl shadow-[0_-10px_30px_rgba(0,0,0,0.28)]">
          <div className="grid grid-cols-5 items-end text-center">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;

              const Icon = item.icon;

              if (item.label === "+") {
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex justify-center"
                  >
                    <div className="relative -mt-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#F7EBCF] text-[#2A0F35] shadow-[0_0_30px_rgba(247,235,207,0.4)] transition hover:scale-105">
                      <Icon className="h-8 w-8" strokeWidth={2.2} />
                    </div>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex justify-center transition ${isActive
                    ? "text-[#EAD9A0]"
                    : "text-[#D8C894]/85 hover:text-[#EAD9A0]"
                    }`}
                >
                  <Icon className="h-7 w-7" strokeWidth={2.1} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}