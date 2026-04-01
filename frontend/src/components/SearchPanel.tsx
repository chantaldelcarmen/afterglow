import { FilterChip } from "./FilterChip";
import { colors, typography } from "../design-tokens";
import { Label, Body } from "./Typography";
import React from "react";

interface SearchPanelProps {
  isVisible: boolean;
  activeFilters: string[];
  onFilterToggle: (label: string) => void;
  onRecentClick: (value: string) => void;
  onClearFilters: () => void;
  dateRange: { start: string; end: string };
  onDateRangeChange: (range: { start: string; end: string }) => void;
  onClosePanel: () => void;
}

const recentSearches = ["Golden Beach", "Graduation"];
const filterOptions = ["2024", "2023", "2022"];

export function SearchPanel({
  isVisible,
  activeFilters,
  onFilterToggle,
  onRecentClick,
  onClearFilters,
  dateRange,
  onDateRangeChange,
  onClosePanel,
}: SearchPanelProps) {
  const [tempDateRange, setTempDateRange] = React.useState(dateRange);

  React.useEffect(() => {
    setTempDateRange(dateRange);
  }, [dateRange]);

  const handleApplyDateRange = () => {
    onDateRangeChange(tempDateRange);
    onClosePanel();
  };

  const handleClearDateRange = () => {
    const cleared = { start: "", end: "" };
    setTempDateRange(cleared);
    onDateRangeChange(cleared);
  };

  if (!isVisible) return null;

  return (
    <div
      className="relative rounded-[28px] border backdrop-blur-xl p-6 space-y-6 mt-3 transition-all duration-300"
      style={{
        background: colors.surface.glassCard,
        borderColor: colors.surface.glassCardBorder,
        boxShadow: "inset 0 1px 2px rgba(255, 255, 255, 0.1), 0 8px 24px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div
        className="absolute inset-0 rounded-[28px] opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.15), transparent 70%)",
        }}
      />

      {/* Recent */}
      <div className="relative z-10 space-y-3">
        <Label className="uppercase tracking-wider">Recent</Label>
        <div className="space-y-2">
          {recentSearches.map((search) => (
            <button
              key={search}
              className="w-full text-left px-3 py-2 rounded-xl transition-all duration-200"
              onClick={() => onRecentClick(search)}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <Body>{search}</Body>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="uppercase tracking-wider">Filter by</Label>
          <button
            type="button"
            className="text-xs uppercase tracking-wide"
            style={{ color: colors.text.muted, textShadow: typography.shadows.text }}
            onClick={onClearFilters}
          >
            Clear
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <FilterChip
              key={option}
              label={option}
              isActive={activeFilters.includes(option)}
              onClick={() => onFilterToggle(option)}
            />
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div className="relative z-10 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="uppercase tracking-wider">Date Range</Label>
          <button
            type="button"
            className="text-xs uppercase tracking-wide"
            style={{ color: colors.text.muted, textShadow: typography.shadows.text }}
            onClick={handleClearDateRange}
          >
            Clear
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide" style={{ color: colors.text.muted }}>
              From
            </label>
            <input
              type="date"
              value={tempDateRange.start}
              onChange={(e) => setTempDateRange({ ...tempDateRange, start: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border backdrop-blur-xl transition-all duration-200 outline-none"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                color: colors.text.primary,
                fontFamily: typography.fonts.sansSerif,
                fontSize: "14px",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(159, 122, 234, 0.4)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide" style={{ color: colors.text.muted }}>
              To
            </label>
            <input
              type="date"
              value={tempDateRange.end}
              onChange={(e) => setTempDateRange({ ...tempDateRange, end: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border backdrop-blur-xl transition-all duration-200 outline-none"
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                color: colors.text.primary,
                fontFamily: typography.fonts.sansSerif,
                fontSize: "14px",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "rgba(159, 122, 234, 0.4)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              }}
            />
          </div>
        </div>
        <button
          type="button"
          className="w-full px-4 py-2 rounded-full border backdrop-blur-xl transition-all duration-200 text-xs uppercase tracking-wide"
          style={{
            background: "rgba(159, 122, 234, 0.15)",
            borderColor: "rgba(159, 122, 234, 0.3)",
            color: colors.text.primary,
            textShadow: typography.shadows.text,
          }}
          onClick={handleApplyDateRange}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(159, 122, 234, 0.5)";
            e.currentTarget.style.background = "rgba(159, 122, 234, 0.25)";
            e.currentTarget.style.boxShadow = `0 0 20px ${colors.button.warmGlow}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(159, 122, 234, 0.3)";
            e.currentTarget.style.background = "rgba(159, 122, 234, 0.15)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
}