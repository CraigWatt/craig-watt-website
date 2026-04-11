import Image from 'next/image';
import type { TechIcon } from '../data/profile';

type TechIconRowProps = {
  icons: TechIcon[];
  size?: number;
  className?: string;
  tileClassName?: string;
};

export function TechIconRow({
  icons,
  size = 24,
  className = '',
  tileClassName = 'h-10 w-10',
}: TechIconRowProps) {
  if (!icons.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {icons.map((icon) => {
        const hasThemePair = Boolean(icon.lightSrc && icon.darkSrc);

        return (
          <span
            key={icon.label}
            className={`inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-white dark:bg-slate-100 ${tileClassName}`}
            title={icon.label}
            aria-label={icon.label}
          >
            {hasThemePair ? (
              <>
                <Image
                  src={icon.lightSrc!}
                  alt={icon.label}
                  width={size}
                  height={size}
                  className="block dark:hidden"
                />
                <Image
                  src={icon.darkSrc!}
                  alt={icon.label}
                  width={size}
                  height={size}
                  className="hidden dark:block"
                />
              </>
            ) : icon.src ? (
              <Image src={icon.src} alt={icon.label} width={size} height={size} />
            ) : null}
          </span>
        );
      })}
    </div>
  );
}
