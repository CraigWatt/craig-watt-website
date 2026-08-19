import type { Metadata } from 'next';
import { buildPageMetadata } from '../config/metadata';
import { ExperienceClientPage } from './ExperienceClientPage';

export const metadata: Metadata = buildPageMetadata({
  title: 'Experience',
  description:
    'A scrollable timeline of Craig Watt’s engineering path across platform work, observability, and delivery.',
  path: '/experience',
});

export default function ExperiencePage() {
  return <ExperienceClientPage />;
}
