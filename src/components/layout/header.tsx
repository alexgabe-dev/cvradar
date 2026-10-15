"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";

export function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      className="brand"
      aria-label="CVRadar kezdőlap"
      onClick={onNavigate}
    >
      <svg
        aria-hidden="true"
        width="31"
        height="31"
        viewBox="0 0 32 32"
        fill="none"
      >
        <circle
          cx="16"
          cy="16"
          r="13"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle
          cx="16"
          cy="16"
          r="7.5"
          stroke="currentColor"
          strokeWidth="1.1"
          opacity=".6"
        />
        <path
          d="M16 3v13l9 9M16 16l9-9"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle cx="16" cy="16" r="2.3" fill="currentColor" />
        <circle cx="23.5" cy="8.5" r="2" fill="currentColor" />
      </svg>
      <span>
        CVRadar<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const path = usePathname();
  const home = path === "/";
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const resize = () => {
      if (window.innerWidth > 700) setOpen(false);
    };
    window.addEventListener("keydown", close);
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("keydown", close);
      window.removeEventListener("resize", resize);
    };
  }, [open]);
  return (
    <header className={`site-header ${home ? "header-dark" : "header-light"}`}>
      <div className="container header-inner">
        <Brand onNavigate={() => setOpen(false)} />
        <nav aria-label="Fő navigáció" className="desktop-nav">
          <Link href="/#igy-mukodik">Így működik</Link>
          <Link href="/#mit-vizsgalunk">Mit vizsgálunk?</Link>
          <Link href="/#arak">Árak</Link>
        </nav>
        <Link className="nav-cta" href="/ellenorzes">
          Szöveg kiolvasása <Icon name="arrow" />
        </Link>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-label={open ? "Menü bezárása" : "Menü megnyitása"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <Icon name="close" /> : <span className="hamburger" />}
        </button>
      </div>
      <nav
        id="mobile-menu"
        hidden={!open}
        aria-label="Mobil navigáció"
        className="mobile-nav"
      >
        <Link onClick={() => setOpen(false)} href="/#igy-mukodik">
          Így működik
        </Link>
        <Link onClick={() => setOpen(false)} href="/#mit-vizsgalunk">
          Mit vizsgálunk?
        </Link>
        <Link onClick={() => setOpen(false)} href="/#arak">
          Árak
        </Link>
        <Link onClick={() => setOpen(false)} href="/ellenorzes">
          Szöveg kiolvasása <Icon name="arrow" />
        </Link>
      </nav>
    </header>
  );
}
