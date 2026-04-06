type IconProps = {
  fill?: string;
  size?: number;
  height?: number;
  width?: number;
  className?: string;
  [key: string]: unknown;
};

export const Flash = ({
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
      d="M6.09 13.28h3.09v7.2c0 1.68.91 2.02 2.02.76l7.57-8.6c.93-1.05.54-1.92-.87-1.92h-3.09v-7.2c0-1.68-.91-2.02-2.02-.76l-7.57 8.6c-.92 1.06-.53 1.92.87 1.92Z"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);
