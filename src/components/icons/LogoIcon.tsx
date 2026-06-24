import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  color?: string;
};

export function LogoIcon({ color = "white", ...props }: Props) {
  return (
    <svg
      viewBox="0 0 52 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <circle cx="14" cy="14" r="12" stroke={color} strokeWidth="4" />
      <circle cx="38" cy="14" r="12" stroke={color} strokeWidth="4" />
      <rect x="23" y="19" width="6" height="21" fill={color} />
    </svg>
  );
}
