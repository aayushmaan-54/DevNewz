import type { Metadata } from "next";
import "./globals.css";
import Provider from "./provider";


export const metadata: Metadata = {
  metadataBase: new URL("https://devnewz.vercel.app"),
  title: {
    default: "DevNewz",
    template: "DevNewz | %s",
  },
  description:
    "DevNewz is a Hacker News-style feed and discussion platform with velocity-based ranking, nested comments, karma system, and user profiles.",
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "DevNewz - Hacker News Clone",
    description:
      "A Hacker News-style platform with features like velocity-based ranking, nested comments, karma system for users.",
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
        className={`antialiased bg-background text-black text-[10pt] min-h-screen flex flex-col`}
      >
        <Provider>
          <main className="flex-grow">
            {children}
          </main>
        </Provider>
      </body>
    </html>
  );
}