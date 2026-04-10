import { Camera, Video, Type } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useFloatingOrb } from "../utils/floatingOrbContext";
import type { FragmentType } from "../utils/floatingOrbContext";

interface FloatingOrbProps {
  mode: "default" | "upload";
  orbSize: number;
  orbBottomOffset: number;
  to?: string;
}

const MINI_ORB_OPTIONS: {
  type: FragmentType;
  icon: typeof Camera;
  gradient: string;
  glow: string;
  x: number;
  y: number;
}[] = [
  {
    type: "photo",
    icon: Camera,
    gradient: "radial-gradient(circle at center, rgba(150, 200, 255, 0.9) 0%, rgba(100, 150, 220, 0.8) 50%, rgba(80, 130, 200, 0.9) 100%)",
    glow: "0 0 20px rgba(150, 200, 255, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.4)",
    x: -70,
    y: -50,
  },
  {
    type: "video",
    icon: Video,
    gradient: "radial-gradient(circle at center, rgba(200, 150, 255, 0.9) 0%, rgba(150, 100, 220, 0.8) 50%, rgba(130, 80, 200, 0.9) 100%)",
    glow: "0 0 20px rgba(200, 150, 255, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.4)",
    x: 0,
    y: -90,
  },
  {
    type: "text",
    icon: Type,
    gradient: "radial-gradient(circle at center, rgba(255, 180, 200, 0.9) 0%, rgba(230, 130, 160, 0.8) 50%, rgba(210, 100, 140, 0.9) 100%)",
    glow: "0 0 20px rgba(255, 180, 200, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.4)",
    x: 70,
    y: -50,
  },
];

const MINI_ORB_SIZE = 44;

export function FloatingOrb({
  mode,
  orbSize,
  orbBottomOffset,
  to = "/create-experience",
}: FloatingOrbProps) {
  const { isOrbExpanded, setOrbExpanded, fragmentTypeCallback } = useFloatingOrb();

  const handleOrbClick = () => {
    if (mode === "upload") {
      setOrbExpanded((prev) => !prev);
    }
  };

  const handleMiniOrbClick = (type: FragmentType) => {
    setOrbExpanded(false);
    fragmentTypeCallback?.(type);
  };

  const wrapperStyle = {
    width: `${orbSize}px`,
    height: `${orbSize}px`,
    bottom: `${orbBottomOffset}px`,
    left: "50%",
    transform: "translate(-50%, 0)",
    zIndex: 45,
  } as const;

  const orbVisual = (
    <motion.div
      className="rounded-full flex items-center justify-center shadow-2xl"
      style={{
        width: `${orbSize}px`,
        height: `${orbSize}px`,
        background: "radial-gradient(circle at center, rgba(255, 255, 255, 1) 0%, rgba(255, 250, 235, 1) 15%, rgba(255, 235, 205, 1) 28%, rgba(245, 215, 175, 1) 42%, rgba(225, 185, 145, 1) 58%, rgba(195, 150, 115, 1) 72%, rgba(165, 120, 90, 1) 85%, rgba(140, 95, 70, 1) 100%)",
        boxShadow: "inset 0 2px 20px rgba(255, 255, 255, 0.9), inset 0 -2px 15px rgba(140, 95, 70, 0.4), inset 0 0 30px rgba(255, 245, 225, 0.3), 0 0 20px rgba(205, 160, 135, 0.35), 0 0 35px rgba(195, 150, 125, 0.25), 0 8px 20px rgba(0, 0, 0, 0.3)",
      }}
      animate={{ scale: isOrbExpanded && mode === "upload" ? 0.95 : 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <motion.svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#321432"
        strokeWidth="2.5"
        strokeLinecap="round"
        animate={{ rotate: isOrbExpanded && mode === "upload" ? 45 : 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <path d="M12 5v14M5 12h14" />
      </motion.svg>
    </motion.div>
  );

  return (
    <>
      {/* Shadow under orb */}
      <div
        className="fixed pointer-events-none"
        style={{
          left: "50%",
          transform: "translate(-50%, 0)",
          bottom: `${orbBottomOffset - 6}px`,
          zIndex: 41,
          width: `${orbSize}px`,
          height: "12px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 30%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Glow halo */}
      <div
        className="fixed pointer-events-none"
        style={{
          left: "50%",
          transform: "translate(-50%, 0)",
          bottom: `${orbBottomOffset}px`,
          zIndex: 41,
          width: "110px",
          height: "110px",
          borderRadius: "50%",
          background: "radial-gradient(circle at center, rgba(255, 240, 220, 1) 0%, rgba(250, 225, 200, 0.95) 20%, rgba(245, 210, 175, 0.8) 40%, rgba(225, 185, 145, 0.5) 65%, transparent 100%)",
          filter: "blur(45px)",
        }}
      />

      {/* Dark shadow ring */}
      <div
        className="fixed pointer-events-none"
        style={{
          left: "50%",
          transform: "translate(-50%, 0)",
          bottom: `${orbBottomOffset}px`,
          zIndex: 42,
          width: `${orbSize + 24}px`,
          height: `${orbSize + 24}px`,
          borderRadius: "50%",
          background: "radial-gradient(circle at center, transparent 45%, rgba(0, 0, 0, 0.4) 55%, rgba(0, 0, 0, 0.25) 70%, rgba(0, 0, 0, 0.1) 85%, transparent 100%)",
          filter: "blur(12px)",
        }}
      />

      {/* Backdrop overlay to close menu on outside tap */}
      <AnimatePresence>
        {isOrbExpanded && mode === "upload" && (
          <motion.div
            className="fixed inset-0"
            style={{
              zIndex: 42,
              background: "rgba(8, 6, 12, 0.5)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOrbExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Ambient glow behind the fan-out cluster */}
      <AnimatePresence>
        {isOrbExpanded && mode === "upload" && (
          <motion.div
            className="fixed pointer-events-none"
            style={{
              left: "50%",
              transform: "translate(-50%, 0)",
              bottom: `${orbBottomOffset + 102}px`,
              zIndex: 44,
              width: "260px",
              height: "176px",
              borderRadius: "50%",
              background:
                [
                  "radial-gradient(circle at 22% 68%, rgba(120, 176, 255, 0.18) 0%, rgba(120, 176, 255, 0.08) 22%, rgba(120, 176, 255, 0) 48%)",
                  "radial-gradient(circle at 50% 24%, rgba(179, 132, 255, 0.22) 0%, rgba(179, 132, 255, 0.1) 24%, rgba(179, 132, 255, 0) 52%)",
                  "radial-gradient(circle at 78% 68%, rgba(255, 168, 205, 0.18) 0%, rgba(255, 168, 205, 0.08) 22%, rgba(255, 168, 205, 0) 48%)",
                  "radial-gradient(ellipse at center, rgba(44, 30, 68, 0.22) 0%, rgba(23, 14, 36, 0.12) 42%, rgba(12, 8, 20, 0) 72%)",
                ].join(", "),
              filter: "blur(22px)",
              boxShadow:
                "0 16px 34px rgba(0, 0, 0, 0.14)",
            }}
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Mini-orb expansion menu */}
      <AnimatePresence>
        {isOrbExpanded && mode === "upload" && (
          <div
            className="fixed"
            style={{
              left: "50%",
              transform: "translate(-50%, 0)",
              bottom: `${orbBottomOffset + orbSize / 2}px`,
              zIndex: 46,
            }}
          >
            {MINI_ORB_OPTIONS.map((opt, i) => {
              const Icon = opt.icon;
              return (
                <motion.button
                  key={opt.type}
                  className="absolute rounded-full flex items-center justify-center shadow-2xl pointer-events-auto"
                  style={{
                    width: `${MINI_ORB_SIZE}px`,
                    height: `${MINI_ORB_SIZE}px`,
                    background: opt.gradient,
                    boxShadow: opt.glow,
                    marginLeft: `${-MINI_ORB_SIZE / 2}px`,
                    marginTop: `${-MINI_ORB_SIZE / 2}px`,
                  }}
                  initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                  animate={{ scale: 1, opacity: 1, x: opt.x, y: opt.y }}
                  exit={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    delay: i * 0.05,
                  }}
                  onClick={() => handleMiniOrbClick(opt.type)}
                >
                  <Icon size={20} className="text-white" />
                </motion.button>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Main orb */}
      {mode === "default" ? (
        <Link
          to={to}
          className="fixed rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-105"
          style={wrapperStyle}
        >
          {orbVisual}
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleOrbClick}
          className="fixed rounded-full flex items-center justify-center"
          style={{
            ...wrapperStyle,
            background: "transparent",
            border: "none",
            padding: 0,
          }}
        >
          {orbVisual}
        </button>
      )}
    </>
  );
}
