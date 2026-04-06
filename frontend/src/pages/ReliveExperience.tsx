import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "lucide-react";

import { getOneExperience } from "../lib/experience";
import { getFragments, getFragmentSignedUrl } from "../lib/storage";
import type { Experience } from "../types/experience";
import type { Fragment } from "../types/fragment";
import { colors } from "../design-tokens";
import { Body } from "../components/Typography";

interface ReliveFragment extends Fragment {
  signedUrl: string | null;
}

export function ReliveExperience() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [experience, setExperience] = useState<Experience | null>(null);
  const [fragments, setFragments] = useState<ReliveFragment[]>([]);
  const [loading, setLoading] = useState(true);
  const [fadeToBlack, setFadeToBlack] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFadeToBlack(false), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const [exp, frags] = await Promise.all([
          getOneExperience(id!),
          getFragments(id!),
        ]);
        setExperience(exp);

        const withUrls: ReliveFragment[] = await Promise.all(
          frags.map(async (f: Fragment) => ({
            ...f,
            signedUrl: f.storage_path
              ? await getFragmentSignedUrl(id!, f.id)
              : null,
          }))
        );
        setFragments(withUrls);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 3) {
      if (currentIndex > 0) setCurrentIndex((i) => i - 1);
      else navigate(`/experience/${id}`);
    } else if (x > (width * 2) / 3) {
      if (currentIndex < fragments.length - 1) setCurrentIndex((i) => i + 1);
    } else {
      setIsPaused((prev) => !prev);
    }
  };

  if (loading) return null;

  if (!experience) {
    navigate(`/experience/${id}`);
    return null;
  }

  const currentFragment = fragments[currentIndex];
  const prevFragment = currentIndex > 0 ? fragments[currentIndex - 1] : null;
  const nextFragment = currentIndex < fragments.length - 1 ? fragments[currentIndex + 1] : null;

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
      <motion.button
        onClick={() => navigate(`/experience/${id}`)}
        className="absolute top-8 left-6 z-30 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300"
        style={{
          background: "rgba(0,0,0,0.3)",
          border: `1px solid ${colors.button.warmBorder}`,
        }}
        animate={{ opacity: isPaused ? 1 : 0.5 }}
        whileHover={{ opacity: 1 }}
      >
        <ArrowLeft size={20} style={{ color: colors.text.primary }} />
      </motion.button>

      {/* Fragment display */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        onClick={handleTap}
      >
        {/* Previous fragment */}
        {prevFragment && (
          <motion.div
            key={`prev-${prevFragment.id}`}
            animate={{ x: -80, scale: 0.7, opacity: 0.3, rotateY: 15 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute"
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
          >
            <FragmentCard fragment={prevFragment} />
          </motion.div>
        )}

        {/* Current fragment */}
        {currentFragment && (
          <motion.div
            key={currentFragment.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [0, -5, 0] }}
            transition={{
              scale: { duration: 0.6 },
              opacity: { duration: 0.6 },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            }}
            className="relative z-20"
          >
            <FragmentCard fragment={currentFragment} isActive />
          </motion.div>
        )}

        {/* Next fragment */}
        {nextFragment && (
          <motion.div
            key={`next-${nextFragment.id}`}
            animate={{ x: 80, scale: 0.7, opacity: 0.3, rotateY: -15 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute"
            style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
          >
            <FragmentCard fragment={nextFragment} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

function FragmentCard({
  fragment,
  isActive = false,
}: {
  fragment: ReliveFragment;
  isActive?: boolean;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border backdrop-blur-xl w-60 h-90 md:w-90 md:h-135"
      style={{
        background: colors.surface.glass,
        borderColor: isActive ? colors.button.warmBorder : "rgba(255,255,255,0.1)",
        boxShadow: isActive
          ? `0 0 40px ${colors.button.warmGlow}`
          : "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      {fragment.type === "text" ? (
        <div className="flex items-center justify-center h-full p-8">
          <Body
            style={{
              color: colors.text.primary,
              fontStyle: "italic",
              textAlign: "center",
              fontSize: "20px",
              lineHeight: "1.6",
            }}
          >
            {fragment.text_context ?? fragment.caption}
          </Body>
        </div>
      ) : fragment.signedUrl ? (
        <img
          src={fragment.signedUrl}
          alt={fragment.caption ?? "Fragment"}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full">
          <Body style={{ color: colors.text.mutedDim }}>{fragment.type}</Body>
        </div>
      )}

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </div>
  );
}
