'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
export function Pulse() {
  return (
    <span className="nat-pulse" aria-hidden="true">
      <i />
    </span>
  );
}
export function CTA({ placement }: { placement: string }) {
  return (
    <Link className="button" href="/#early-access" data-placement={placement}>
      Join Early Access <ArrowUpRight size={17} />
    </Link>
  );
}
export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="wordmark" href="/" aria-label="Nat home">
          <Pulse />
          Nat<span className="beta-label">EARLY ACCESS</span>
        </Link>
        <nav className={open ? 'nav open' : 'nav'} aria-label="Main navigation">
          {[
            ['How it works', 'how-it-works'],
            ['What Nat does', 'what-nat-does'],
            ['Developers', 'developers'],
          ].map(([label, id]) => (
            <Link key={id} href={'/#' + id} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <CTA placement="header" />
          <button
            className="menu-button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="container footer">
      <div>
        <Link href="/" className="wordmark">
          <Pulse />
          Nat
        </Link>
        <p>
          Your website knows the answer.
          <br />
          Now it can say it.
        </p>
      </div>
      <div className="footer-links">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <span>© 2026 Nat</span>
      </div>
    </footer>
  );
}
