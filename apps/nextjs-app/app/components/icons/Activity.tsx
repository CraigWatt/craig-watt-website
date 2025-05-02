type IconProps = {
  fill?: string;
  size?: number;
  height?: number;
  width?: number;
  className?: string;
  [key: string]: unknown;
};

export const Activity = ({
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
    {/* SVG paths here */}
  </svg>
);
