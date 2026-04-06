import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

import { getOneExperience } from "../lib/experience";
import { getFragments, getFragmentSignedUrl } from "../lib/storage";
import type { Experience } from "../types/experience";
import type { Fragment } from "../types/fragment";
import { colors } from "../design-tokens";
import { Body } from "../components/Typography";

interface ReliveFragment extends Fragment {
  signedUrl: string | null;
  isAnchor: boolean;
}

export function ReliveExperience() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [experience, setExperience] = useState<Experience | null>(null);
  const [contextFragments, setContextFragments] = useState<ReliveFragment[]>([]);
  const [peakFragment, setPeakFragment] = useState<ReliveFragment | null>(null);
  const [loading, setLoading] = useState(true);

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
            isAnchor: f.id === exp.anchor_fragment_id,
            signedUrl: f.storage_path
              ? await getFragmentSignedUrl(id!, f.id)
              : null,
          }))
        );

        setContextFragments(withUrls.filter((f) => !f.isAnchor));
        setPeakFragment(withUrls.find((f) => f.isAnchor) ?? null);
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

      {/* Placeholder content */}
      <div className="flex items-center justify-center h-full">
        <Body style={{ color: colors.text.muted }}>
          {experience.title} · {contextFragments.length} context · {peakFragment ? "1 peak" : "no peak"}
        </Body>
      </div>
    </div>
  );
}
