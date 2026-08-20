import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const buildDir = path.join(root, 'dist', 'grafana');
const grafanaUrl = process.env.GRAFANA_URL;
const grafanaToken = process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN;

if (!grafanaUrl) {
  throw new Error('Missing required environment variable: GRAFANA_URL');
}

if (!grafanaToken) {
  throw new Error(
    'Missing required environment variable: GRAFANA_SERVICE_ACCOUNT_TOKEN'
  );
}

const manifest = JSON.parse(
  readFileSync(path.join(buildDir, 'manifest.json'), 'utf8')
);

async function grafanaRequest(pathname, init = {}, allowNotFound = false) {
  const response = await fetch(new URL(pathname, grafanaUrl), {
    ...init,
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${grafanaToken}`,
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (allowNotFound && response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(
      `Grafana API request failed for ${pathname} with HTTP ${response.status}${
        body ? `: ${body}` : ''
      }`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function ensureFolder(folder) {
  const existing = await grafanaRequest(`/api/folders/${folder.uid}`, {}, true);

  if (existing) {
    return existing.uid ?? folder.uid;
  }

  const created = await grafanaRequest('/api/folders', {
    method: 'POST',
    body: JSON.stringify({
      title: folder.title,
      uid: folder.uid,
    }),
  });

  return created.uid ?? folder.uid;
}

async function upsertDashboard(folderUid, dashboardMeta) {
  const dashboard = JSON.parse(
    readFileSync(path.join(buildDir, dashboardMeta.fileName), 'utf8')
  );

  const response = await grafanaRequest('/api/dashboards/db', {
    method: 'POST',
    body: JSON.stringify({
      dashboard,
      folderUid,
      message:
        process.env.GITHUB_REF_NAME ||
        process.env.GITHUB_SHA ||
        'Automated sync from craig-watt-website',
      overwrite: true,
    }),
  });

  return response.url ?? response.slug ?? dashboardMeta.uid;
}

const folderUid = await ensureFolder(manifest.folder);

for (const dashboard of manifest.dashboards) {
  const result = await upsertDashboard(folderUid, dashboard);
  console.log(`Synced Grafana dashboard ${dashboard.uid}: ${result}`);
}
