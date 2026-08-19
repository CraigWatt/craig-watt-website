// app/trading212/page.tsx
import type { Metadata } from 'next';
import Trading212Client from './Trading212Client'
import { buildPageMetadata } from '../config/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Trading212 Dashboard',
  description:
    'A public Trading212 dashboard for portfolio snapshots, charts, and simple finance visualisation.',
  path: '/trading212',
});

export default function Trading212Page() {
  return <Trading212Client />
}
