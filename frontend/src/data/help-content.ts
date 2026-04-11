export interface HelpContent {
  title: string;
  description: string;
  tips: string[];
}

export const HELP_CONTENT: Record<string, HelpContent> = {
  "/": {
    title: "Home",
    description: "Your personal memory dashboard.",
    tips: [
      "The featured card shows your most recent experience",
      "Tap 'Relive Now' to revisit a memory in cinematic mode",
      "Use 'Surprise Me' to rediscover a random experience",
      "Recently Relived shows your last two experiences",
    ],
  },
  "/library": {
    title: "Your Library",
    description: "Browse and search all your memories.",
    tips: [
      "Search by title, location, or emotion tag",
      "Filter by year using the filter chips",
      "Set a date range to narrow down results",
      "Tap any card to view the full experience",
      "Experiences are grouped by year automatically",
    ],
  },
  "/insights": {
    title: "Your Patterns",
    description: "Discover emotional trends across your memories.",
    tips: [
      "Patterns are generated from all your published experiences",
      "Drafts are excluded from pattern calculations",
      "The AI Reflection summarizes your emotional month",
      "Most Active Time of Day is based on when you created experiences",
    ],
  },
   "/experience-detail": {
    title: "Experience Detail",
    description: "View and manage everything about this memory.",
    tips: [
      "Double tap any fragment to set it as the anchor — the emotional peak of your experience",
      "The anchor fragment appears as the cover image and is the highlight of your Relive flow",
      "You need an anchor fragment set before you can publish or relive this experience",
      "Add or remove fragments using the Edit button in the Fragments section",
      "Reflections are written at the end of a Relive session and can be edited anytime",
      "Hit Relive Experience to move through your memory in cinematic mode",
    ],
  },
  "/profile": {
    title: "Your Profile",
    description: "View your account and memory stats.",
    tips: [
      "Experience count includes all your published experiences",
      "Fragment count includes all uploaded photos, videos and text",
      "Go to Settings to manage your account preferences",
    ],
  },
};
