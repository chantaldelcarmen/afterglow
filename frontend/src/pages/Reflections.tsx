import {
  CalendarDays,
  Heart,
  Users,
  MapPin,
  SunMedium,
} from "lucide-react";

type Reflection = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
};

const mockReflections: Reflection[] = [
  {
    id: "1",
    title: "Most Active Month",
    value: "March 2026",
    subtitle: "24 memories created",
    icon: CalendarDays,
    iconColor: "text-[#7EA6FF]",
  },
  {
    id: "2",
    title: "Most Frequent Emotion",
    value: "Joyful",
    subtitle: "Appears in 67% of memories",
    icon: Heart,
    iconColor: "text-[#F08AC0]",
  },
  {
    id: "3",
    title: "Most Common People",
    value: "Sarah & Emma",
    subtitle: "Featured in 18 memories",
    icon: Users,
    iconColor: "text-[#7BE0E8]",
  },
  {
    id: "4",
    title: "Most Visited Place",
    value: "Riverside Café",
    subtitle: "12 visits this month",
    icon: MapPin,
    iconColor: "text-[#F2C86B]",
  },
  {
    id: "5",
    title: "Happiest Time of Day",
    value: "Golden Hour",
    subtitle: "4–6:30 PM",
    icon: SunMedium,
    iconColor: "text-[#FF9A76]",
  },
];

function ReflectionCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
}: Reflection) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/10 px-5 py-5 backdrop-blur-md shadow-[0_0_24px_rgba(255,220,180,0.08)]">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
          <Icon className={`h-7 w-7 ${iconColor}`} />
        </div>

        <div className="min-w-0">
          <p className="text-sm text-white/45">{title}</p>
          <h3 className="playfair mt-1 text-3xl leading-tight font-semibold text-[#F8EBDD]">
            {value}
          </h3>
          <p className="mt-1 text-base text-white/55">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export default function Reflections() {
  return (
    <div className="min-h-screen px-6 pt-8 pb-28 text-[#F8EBDD]">
      <h1 className="playfair text-center text-5xl font-semibold tracking-tight text-[#F8EBDD] drop-shadow-[0_0_25px_rgba(255,230,150,0.35)]">
        Afterglow
      </h1>

      <div className="mt-8 space-y-4">
        {mockReflections.map((reflection) => (
          <ReflectionCard key={reflection.id} {...reflection} />
        ))}
      </div>
    </div>
  );
}