import Link from "next/link";

export default function Footer() {
  return (
    <>
      <footer className="flex flex-col items-center border-t-2 border-accent mb-3">
        <p className="mt-2">
          Made by
          <Link
            href={'https://linktr.ee/aayushmaan_soni'}
            className="a"
          >
            Aayushmaan Soni
          </Link>
        </p>

        <div className="mt-1">
          <label htmlFor="search">Search: </label>
          <input type="text" name="search" id="search" className="input" />
        </div>
      </footer>
    </>
  )
}