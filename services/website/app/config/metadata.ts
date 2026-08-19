import type { Metadata } from 'next';
import { siteOrigin } from '../data/site';

const siteName = 'Craig Watt';
const defaultImage = {
  url: '/images/og/craig-watt-share-card-v2.png',
  width: 1200,
  height: 630,
  alt: 'Craig Watt brand card with circular avatar and name',
};

type MetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  tags?: string[];
};

function toAbsoluteUrl(path: string) {
  return new URL(path, siteOrigin).toString();
}

export function buildPageMetadata({
  title,
  description,
  path,
  image,
  imageWidth,
  imageHeight,
  imageAlt,
  type = 'website',
  publishedTime,
  tags,
}: MetadataOptions): Metadata {
  const pageUrl = toAbsoluteUrl(path);
  const imageUrl = toAbsoluteUrl(image ?? defaultImage.url);

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName,
      locale: 'en_GB',
      type,
      images: [
        {
          url: imageUrl,
          width: imageWidth ?? defaultImage.width,
          height: imageHeight ?? defaultImage.height,
          alt: imageAlt ?? defaultImage.alt,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(tags?.length ? { tags } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}
