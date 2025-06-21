type IconProps = {
  fill?: string;
  size?: number;
  height?: number;
  width?: number;
  className?: string;
  [key: string]: unknown;
};

export const CpuIcon = ({
  fill = 'currentColor',
  size = 24,
  height,
  width,
  className,
  ...props
}: IconProps) => (
  <svg
    className={className}
    fill="none"
    height={height || size}
    width={width || size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M12 20v2"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M12 2v2"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M17 20v2"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M17 2v2"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M2 12h2"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M2 17h2"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M2 7h2"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M20 12h2"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M20 17h2"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M20 7h2"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M7 20v2"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <path
      d="M7 2v2"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="2"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
    <rect
      x="8"
      y="8"
      width="8"
      height="8"
      rx="1"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);
