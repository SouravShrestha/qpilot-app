import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  color?: string;
};

export function SidebarIcon({ color = "white", ...props }: Props) {
  return (
    <svg
      width="24"
      height="20"
      viewBox="0 0 24 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M19 0H5C2.243 0 0 2.243 0 5V15C0 17.757 2.243 20 5 20H19C21.757 20 24 17.757 24 15V5C24 2.243 21.757 0 19 0ZM2 15V5C2 3.346 3.346 2 5 2H9V18H5C3.346 18 2 16.654 2 15ZM22 15C22 16.654 20.654 18 19 18H11V2H19C20.654 2 22 3.346 22 5V15Z"
        fill={color}
      />
    </svg>
  );
}
