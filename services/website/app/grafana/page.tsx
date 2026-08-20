import { GrafanaRedirectClient } from './GrafanaRedirectClient';

export const metadata = {
  title: 'Grafana Dashboard',
  description: 'Redirecting to the public Grafana dashboard for craigwatt.co.uk.',
};

export default function GrafanaPage() {
  return <GrafanaRedirectClient />;
}
