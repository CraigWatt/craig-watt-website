import type { Metadata } from 'next';
import SalaryInflationCheckerClient from './SalaryInflationCheckerClient';

export const metadata: Metadata = {
  title: 'Salary Inflation Checker',
  description: 'Check what your salary needs to be today to keep the same buying power.',
};

export default function SalaryInflationCheckerPage() {
  return <SalaryInflationCheckerClient />;
}
