type IconProps = {
  fill?: string;
  size?: number;
  height?: number;
  width?: number;
  className?: string;
  [key: string]: unknown;
};

export const Lock = ({
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
    <g transform="translate(3.5 2)">
      <path
        d="M9.121,6.653V4.5A4.561,4.561,0,0,0,0,4.484V6.653"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        transform="translate(3.85 0.75)"
      />
      <path
        d="M.5,0V2.221"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        transform="translate(7.91 12.156)"
      />
      <path
        d="M7.66,0C1.915,0,0,1.568,0,6.271s1.915,6.272,7.66,6.272,7.661-1.568,7.661-6.272S13.4,0,7.66,0Z"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        transform="translate(0.75 6.824)"
      />
    </g>
  </svg>
);
