import type { ReactNode } from "react";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

export const ICONS = {
  overview: (
    <Icon>
      <rect x="2" y="2" width="5" height="5" rx="1" />
      <rect x="9" y="2" width="5" height="5" rx="1" />
      <rect x="2" y="9" width="5" height="5" rx="1" />
      <rect x="9" y="9" width="5" height="5" rx="1" />
    </Icon>
  ),
  campaigns: (
    <Icon>
      <path d="M2.5 6.5v3h2l5 3v-9l-5 3h-2Z" />
      <path d="M12 6a2.5 2.5 0 0 1 0 4" />
    </Icon>
  ),
  plus: (
    <Icon>
      <path d="M8 3v10M3 8h10" />
    </Icon>
  ),
  approvals: (
    <Icon>
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
      <path d="m5.5 8 1.8 1.8L10.5 6.5" />
    </Icon>
  ),
  inventory: (
    <Icon>
      <path d="m8 2 6 3-6 3-6-3 6-3Z" />
      <path d="m2 8 6 3 6-3" />
      <path d="m2 11 6 3 6-3" />
    </Icon>
  ),
  pilots: (
    <Icon>
      <path d="M2.5 6.5 4 2.5h8l1.5 4" />
      <path d="M3 6.5v7h10v-7" />
      <path d="M6.5 13.5v-4h3v4" />
    </Icon>
  ),
  forecast: (
    <Icon>
      <path d="M2.5 13.5h11" />
      <path d="M4 11V8M7 11V5.5M10 11V7M13 11V3.5" />
    </Icon>
  ),
  about: (
    <Icon>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 7.5v3.5M8 5.2v.1" />
    </Icon>
  ),
  plan: (
    <Icon>
      <path d="M3 3.5h10M3 8h10M3 12.5h6" />
    </Icon>
  ),
  sources: (
    <Icon>
      <path d="M6.5 9.5 9.5 6.5" />
      <path d="M7.5 4.5 9 3a2.5 2.5 0 0 1 3.5 3.5L11 8" />
      <path d="M8.5 11.5 7 13a2.5 2.5 0 0 1-3.5-3.5L5 8" />
    </Icon>
  ),
  menu: (
    <Icon>
      <path d="M2.5 4h11M2.5 8h11M2.5 12h11" />
    </Icon>
  ),
  close: (
    <Icon>
      <path d="m4 4 8 8M12 4l-8 8" />
    </Icon>
  ),
} as const;
