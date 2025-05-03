import Link from "next/link";


export default function Logo() {
  return (
    <>
      <Link 
        className="bg-accent border inline-block border-foreground text-foreground w-fit p-[2px] py-[1.5px] select-none"
        href={'/'}
      >
        DN
      </Link>
    </>
  );
}