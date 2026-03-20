import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Library", path: "/library" },
  { label: "+", path: "/create" },
  { label: "Reflections", path: "/reflections" },
  { label: "Profile", path: "/profile" },
];
 // TODO: add the actual logos
export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex justify-center">
      <div className="w-full max-w-[430px] bg-[#2A0F35]/95 backdrop-blur-md border-t border-white/10 px-4 py-3">
        <div className="grid grid-cols-5 items-center text-center text-sm text-white/70">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (item.label === "+") {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex justify-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F7EBCF] text-3xl text-[#2A0F35] shadow-lg -mt-8">
                    +
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={isActive ? "text-white font-semibold" : ""}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}