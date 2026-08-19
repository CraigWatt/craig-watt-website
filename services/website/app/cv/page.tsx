import type { Metadata } from 'next';
import { buildPageMetadata } from '../config/metadata';
import { CvClientPage } from './CvClientPage';

export const metadata: Metadata = buildPageMetadata({
  title: 'CV',
  description:
    'A printable CV view of Craig Watt’s platform engineering, observability, and automation experience.',
  path: '/cv',
});

export default function CvPage() {
  return <CvClientPage />;
}
