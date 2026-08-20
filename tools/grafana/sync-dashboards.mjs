import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const buildDir = path.join(root, 'dist', 'grafana');
const grafanaUrl = process.env.GRAFANA_URL;
const grafanaToken = process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN;
const pinnedCloudwatchDatasourceUid =
  process.env.GRAFANA_CLOUDWATCH_DATASOURCE_UID ?? '';

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

function replaceDatasourceUid(value, datasourceUid) {
  if (Array.isArray(value)) {
    return value.map((item) => replaceDatasourceUid(item, datasourceUid));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        replaceDatasourceUid(entry, datasourceUid),
      ])
    );
  }

  if (value === '__GRAFANA_CLOUDWATCH_DATASOURCE_UID__') {
    return datasourceUid;
  }

  return value;
}

async function resolveCloudwatchDatasourceUid() {
  if (pinnedCloudwatchDatasourceUid) {
    return pinnedCloudwatchDatasourceUid;
  }

  const datasources = await grafanaRequest('/api/datasources');
  const cloudwatchDatasources = Array.isArray(datasources)
    ? datasources.filter((datasource) => datasource?.type === 'cloudwatch')
    : [];

  if (cloudwatchDatasources.length === 0) {
    throw new Error(
      'No CloudWatch datasource was found in Grafana. Add one manually or set GRAFANA_CLOUDWATCH_DATASOURCE_UID.'
    );
  }

  const preferredDatasource =
    cloudwatchDatasources.find((datasource) => datasource?.isDefault) ??
    cloudwatchDatasources[0];

  if (!preferredDatasource?.uid) {
    throw new Error(
      'A CloudWatch datasource was found in Grafana, but it did not include a uid.'
    );
  }

  console.log(
    `Using CloudWatch datasource ${preferredDatasource.name ?? preferredDatasource.uid} (${preferredDatasource.uid})`
  );

  return preferredDatasource.uid;
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

async function upsertDashboard(folderUid, dashboardMeta, datasourceUid) {
  const rawDashboard = JSON.parse(
    readFileSync(path.join(buildDir, dashboardMeta.fileName), 'utf8')
  );
  const dashboard = replaceDatasourceUid(rawDashboard, datasourceUid);

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

const cloudwatchDatasourceUid = await resolveCloudwatchDatasourceUid();
const folderUid = await ensureFolder(manifest.folder);

for (const dashboard of manifest.dashboards) {
  const result = await upsertDashboard(
    folderUid,
    dashboard,
    cloudwatchDatasourceUid
  );
  console.log(`Synced Grafana dashboard ${dashboard.uid}: ${result}`);
}
