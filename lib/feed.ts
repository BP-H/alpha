// lib/feed.ts
export type Post = {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar?: string;
  };
  createdAt: string | number | Date;
  text?: string;
  type?: "text" | "image" | "three";
  image?: string;
  alt?: string; // ← NEW: fixes the type error
  reactions?: Record<string, number>;
};

export const demoFeed: Post[] = [
  {
    id: "p1",
    author: { name: "superNova_2177", handle: "@superNova_2177" },
    createdAt: Date.now(),
    text:
      "Material ask executive year decide use seven — demo copy for layout testing.",
    type: "image",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop",
    alt: "abstract 3D shapes flying through space",
    reactions: { "❤️": 3, "👍": 5 },
  },
];
