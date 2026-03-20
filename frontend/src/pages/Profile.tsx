import BottomNav from "../components/BottomNav";

export default function Profile() {
  return (
    <main className="min-h-screen bg-[#17001F] text-white flex justify-center">
      <div className="w-full max-w-[430px] px-6 pt-10 pb-28">
        <h1 className="text-5xl text-center">Profile</h1>
      </div>
      <BottomNav />
    </main>
  );
}