import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

/** Pepero stick — шоколадтай нарийн чихэр */
export function PeperoStick(props: P) {
  return (
    <svg viewBox="0 0 24 120" fill="none" {...props}>
      <rect x="9" y="44" width="6" height="74" rx="3" fill="#F5EBDD" />
      <rect x="8" y="2" width="8" height="52" rx="4" fill="#243C5A" />
      <rect x="10" y="6" width="2" height="40" rx="1" fill="white" opacity="0.35" />
    </svg>
  );
}

export function Star(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2c.6 4.8 3.2 7.4 8 8-4.8.6-7.4 3.2-8 8-.6-4.8-3.2-7.4-8-8 4.8-.6 7.4-3.2 8-8z" />
    </svg>
  );
}

export function Ribbon(props: P) {
  return (
    <svg viewBox="0 0 64 40" fill="none" {...props}>
      <path
        d="M32 20c-6-10-16-14-24-10-6 3-6 11 0 14 8 4 18 0 24-4zm0 0c6-10 16-14 24-10 6 3 6 11 0 14-8 4-18 0-24-4z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="20" r="3.5" fill="currentColor" />
      <path d="M30 23l-8 14M34 23l8 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Heart(props: P) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 21s-7.5-4.6-9.6-9.4C.9 8 3.2 4 7.2 4c2 0 3.6 1.1 4.8 2.7C13.2 5.1 14.8 4 16.8 4c4 0 6.3 4 4.8 7.6C19.5 16.4 12 21 12 21z" />
    </svg>
  );
}
