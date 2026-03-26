import { LogOut, Trash2 } from "lucide-react";

const mockProfile = {
  name: "Sarah Mitchell",
  email: "sarah.mitchell@example.com",
  avatarUrl:
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  experiencesCount: 14,
  fragmentsCount: 56,
};

export default function Profile() {
  return (
    <div className="min-h-screen px-6 pt-8 pb-28 text-[#F8EBDD]">
      {/*TODO: make spaceing for title better.*/}
      <h1 className="playfair text-center text-5xl font-semibold tracking-tight text-[#F8EBDD] drop-shadow-[0_0_25px_rgba(255,230,150,0.6)]">
        Afterglow
      </h1>

      <div className="mt-10 flex flex-col items-center">
        <div className="h-28 w-28 overflow-hidden rounded-full border border-white/20 shadow-[0_0_25px_rgba(255,240,200,0.25)]">
          <img
            src={mockProfile.avatarUrl}
            alt={mockProfile.name}
            className="h-full w-full object-cover"
          />
        </div>

        <h2 className="playfair mt-6 text-center text-4xl font-semibold leading-tight">
          {mockProfile.name}
        </h2>

        <p className="mt-2 text-center text-lg text-white/80">
          {mockProfile.email}
        </p>
      </div>

      <section className="mt-8 rounded-[28px] border border-white/10 bg-white/10 px-8 py-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,220,180,0.08)]">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-5xl font-medium text-[#F0D36D]">
              {mockProfile.experiencesCount}
            </p>
            <p className="mt-2 text-lg text-white/65">Experiences</p>
          </div>

          <div>
            <p className="text-5xl font-medium text-[#F28B8B]">
              {mockProfile.fragmentsCount}
            </p>
            <p className="mt-2 text-lg text-white/65">Fragments</p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h3 className="playfair text-3xl font-semibold">Settings</h3>

        <div className="mt-5 space-y-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/10 px-6 py-4 text-xl font-medium text-white/90 backdrop-blur-md shadow-[0_0_18px_rgba(255,220,180,0.06)] transition hover:bg-white/15"
          >
            <LogOut className="h-5 w-5" />
            Log Out
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white/10 px-6 py-4 text-xl font-medium text-white/90 backdrop-blur-md shadow-[0_0_18px_rgba(255,220,180,0.06)] transition hover:bg-white/15"
          >
            <Trash2 className="h-5 w-5" />
            Delete Account
          </button>
        </div>
      </section>

      <p className="mt-8 px-4 text-center text-base leading-relaxed text-white/55">
        Your memories are precious. We&apos;re committed to keeping your data
        private and secure.
      </p>
    </div>
  );
}