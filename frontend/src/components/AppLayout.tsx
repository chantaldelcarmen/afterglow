import { Outlet } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import AppBackground from "./AppBackground";

export default function AppLayout() {
  return (
    <AppBackground>
      <main className="min-h-screen flex justify-center text-[#F8EBDD]">
        <div className="w-full max-w-[430px] px-6 pt-8 pb-28">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </AppBackground>
  );
}