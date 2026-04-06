import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "lucide-react";

import { getOneExperience } from "../lib/experience";
import type { Experience } from "../types/experience";
import { colors } from "../design-tokens";

export function ReliveExperience() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [fadeToBlack, setFadeToBlack] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setFadeToBlack(false), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const exp = await getOneExperience(id!);
        setExperience(exp);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return null;

  if (!experience) {
    navigate(`/experience/${id}`);
    return null;
  }

  return (
    <div className="absolute inset-0 z-50 overflow-hidden">
      {/* Fade to black overlay */}
      <AnimatePresence>
        {fadeToBlack && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black z-50"
          />
        )}
      </AnimatePresence>

      {/* Cinematic background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, #0A0010 0%, #16001F 100%)" }}
      >
        {/* Violet orb - top left */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(147,51,234,0.5) 0%, transparent 70%)",
          }}
        />
        {/* Blue orb - middle right */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.35, 0.25] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/2 right-10 w-72 h-72 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
          }}
        />
        {/* Pink orb - bottom center */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(236,72,153,0.35) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate(`/experience/${id}`)}
        className="absolute top-8 left-6 z-30 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300"
        style={{
          background: "rgba(0,0,0,0.3)",
          border: `1px solid ${colors.button.warmBorder}`,
        }}
      >
        <ArrowLeft size={20} style={{ color: colors.text.primary }} />
      </button>
    </div>
  );
}
