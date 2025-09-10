"use client";

import Link from "next/link";

export default function Header() {
  return (
  <header className="sticky top-0 z-50 bg-primary text-white shadow" style={{ color: '#fff' }}>
  <div className="container-readable flex items-center justify-between py-4 text-white" style={{ color: '#fff' }}>
        <Link
          href="/"
          className="text-xl md:text-2xl font-bold text-white hover:opacity-90" style={{ color: '#fff' }}
        >
          Natural Eating Hub
        </Link>

  <nav className="flex items-center gap-6 text-white" style={{ color: '#fff' }}>
          <Link href="/" className="text-white hover:opacity-80" style={{ color: '#fff' }}>
            Home
          </Link>
          <Link href="/about" className="text-white hover:opacity-80" style={{ color: '#fff' }}>
            About
          </Link>
          <Link href="/contato" className="text-white hover:opacity-80" style={{ color: '#fff' }}>
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
}