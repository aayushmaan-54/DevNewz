"use client";
import Logo from "@/app/components/logo";
import { HeaderArgs } from "@/types/types";
import Link from "next/link";
import LogoutButton from "./logout-button";
import { useHeaderData } from "@/common/hooks/use-header-data";
import { usePathname } from "next/navigation";


export default function Header({
  text = "DevNewz",
}: HeaderArgs) {
  const { data: headerData, isLoading } = useHeaderData();
  const pathname = usePathname();

  
  const renderUserInfo = () => {
    if (isLoading) return "Loading...";
    if (!headerData?.username) return null;

    return (
      <>
        <span className="hover:underline">{headerData.username}</span>
        {headerData.karma != null && (
          <span className="ml-1">({headerData.karma})</span>
        )}
        <span> | </span>
      </>
    );
  };

  const headerNavData = [
    { text: "new", link: "/news/newest" },
    { text: "threads", link: `/news/threads` },
    { text: "past", link: `/news/past?date=${new Date().toLocaleDateString('en-GB')}` },
    { text: "comments", link: "/news/newcomments" },
    { text: "ask", link: "/news/ask" },
    { text: "show", link: "/news/show" },
    { text: "submit", link: "/news/submit" },
  ];

  const shouldShowNavLinks = pathname.startsWith('/news') ||
    pathname.startsWith('/auth/profile') ||
    pathname.startsWith('/auth/change-password')||
    pathname.startsWith('/past')||
    pathname.startsWith('/ask') ||
    pathname.startsWith('/show') ||
    pathname.startsWith('/newcomments') ||
    pathname.startsWith('/threads');

  const isActiveRoute = (link: string) => {
    if (link === '/news/newest' && pathname === '/news/newest') return true;
    if (link === '/news/threads' && pathname === '/news/threads') return true;
    if (link.startsWith('/news/past') && pathname.startsWith('/news/past')) return true;
    if (link === '/news/newcomments' && pathname === '/news/newcomments') return true;
    if (link === '/news/ask' && pathname === '/news/ask') return true;
    if (link === '/news/show' && pathname === '/news/show') return true;
    if (link === '/news/submit' && pathname === '/news/submit') return true;
    if (link === '/threads/upvoted' && pathname === '/threads/upvoted') return true;
    if (link === '/threads/downvoted' && pathname === '/threads/downvoted') return true;
    if (link === '/threads/upvotedNews' && pathname === '/threads/upvotedNews') return true;
    if (link === '/threads/downvotedNews' && pathname === '/threads/downvotedNews') return true;
    return false;
  };

  return (
    <header className="bg-orange-500 px-2 py-1 flex justify-between items-center md:w-[95vw] lg:w-[80vw] mx-auto md:mt-3 mt-0">
      <div className="flex items-center flex-wrap">
        <div className="flex items-center mr-4">
          <Logo />
          <Link className="text-lg ml-1 font-semibold" href="/">{text}</Link>
        </div>

        {shouldShowNavLinks && (
          <div className="flex flex-wrap">
            {headerNavData.map((link, index) => (
              <span key={link.text}>
                <Link 
                  href={link.link} 
                  className={`link-2 ${isActiveRoute(link.link) ? 'text-white underline' : ''}`}
                >
                  {link.text}
                </Link>
                {index < headerNavData.length - 1 && <span className="mx-1">|</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="whitespace-nowrap pl-2">
        {headerData?.username && (
          <Link href={`/auth/profile`} className="inline-flex items-center">
            {renderUserInfo()}
          </Link>
        )}
        <LogoutButton />
      </div>
    </header>
  );
}