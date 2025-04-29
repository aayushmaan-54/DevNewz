import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: new URL("https://devnewz.vercel.app"),
  title: {
    default: "DevNewz",
    template: "DevNewz | %s",
  },
  description:
    "DevNewz is a Hacker News-style feed and discussion platform with velocity-based ranking, nested comments, karma system, and user profiles with anti-procrastination settings.",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "DevNewz - Hacker News Clone",
    description:
      "A Hacker News-style platform with features like velocity-based ranking, nested comments, karma system, and anti-procrastination settings for users.",
    images: ["/devnewz-og.png"],
  },
  keywords: [
    "DevNewz",
    "Hacker News Clone",
    "Feed Platform",
    "Tech News",
    "Velocity Ranking",
    "Nested Comments",
    "Karma System",
    "User Profiles",
    "Anti-Procrastination",
    "Discussion Platform",
    "Post Submission",
    "Community Platform",
    "Upvoting System",
    "Tech Forum",
    "Post Voting",
  ],
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased bg-background text-black`}
      >
        {children}
      </body>
    </html>
  );
}