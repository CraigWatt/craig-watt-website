import type { Metadata } from 'next';
import SalaryInflationCheckerClient from './SalaryInflationCheckerClient';
import { buildPageMetadata } from '../config/metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Salary Inflation Checker',
  description:
    'Check what your salary needs to be today to keep the same buying power using inflation and salary benchmark data.',
  path: '/salary-inflation-checker',
});

export default function SalaryInflationCheckerPage() {
  return <SalaryInflationCheckerClient />;
}
