export type Fragment = {
  id: string;
  type: "photo" | "video" | "audio" | "text";
  content: string;
  imageUrl?: string;
};

export type Experience = {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  year: number;
  location: string;
  description: string;
  tags: string[];
  fragments: Fragment[];
};