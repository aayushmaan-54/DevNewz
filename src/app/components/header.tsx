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
    { text: "new", link: "/newest" },
    { text: "threads", link: `/threads?id=${headerData?.username || 'username'}` },
    { text: "past", link: `/past?date=${new Date().toLocaleDateString('en-GB')}` },
    { text: "comments", link: "/newcomments" },
    { text: "ask", link: "/ask" },
    { text: "show", link: "/show" },
    { text: "submit", link: "/submit" },
  ];

  const shouldShowNavLinks = pathname.startsWith('/news') ||
    pathname.startsWith('/auth/profile') ||
    pathname.startsWith('/auth/change-password');


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
                <Link href={link.link} className="link-2">
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