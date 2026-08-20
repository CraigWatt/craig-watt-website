import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ReduceDataOptionsBuilder } from '@grafana/grafana-foundation-sdk/common';
import {
  DashboardBuilder,
  DatasourceVariableBuilder,
} from '@grafana/grafana-foundation-sdk/dashboard';
import {
  MetricEditorMode,
  MetricQueryType,
  MetricsQueryBuilder,
  QueryMode,
} from '@grafana/grafana-foundation-sdk/cloudwatch';
import { PanelBuilder as StatPanelBuilder } from '@grafana/grafana-foundation-sdk/stat';
import { PanelBuilder as TextPanelBuilder, TextMode } from '@grafana/grafana-foundation-sdk/text';
import { PanelBuilder as TimeSeriesPanelBuilder } from '@grafana/grafana-foundation-sdk/timeseries';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const outDir = path.join(root, 'dist', 'grafana');

const config = {
  awsRegion: process.env.AWS_REGION ?? 'eu-west-2',
  apiGatewayId: process.env.GRAFANA_API_GATEWAY_ID ?? '',
  cloudFrontDistributionId:
    process.env.GRAFANA_CLOUDFRONT_DISTRIBUTION_ID ?? '',
  domain: process.env.GRAFANA_WEBSITE_DOMAIN ?? 'craigwatt.co.uk',
};

const folder = {
  title: 'craigwatt.co.uk',
  uid: 'craigwatt-co-uk',
};

const cloudwatchDatasource = {
  type: 'cloudwatch',
  uid: '${cloudwatch_datasource}',
};

const lambdaFunctions = [
  {
    name: 'craigwatt-co-uk-contact',
    title: 'Contact API',
  },
  {
    name: 'craigwatt-co-uk-cost-of-living',
    title: 'Salary Inflation Checker API',
  },
  {
    name: 'craigwatt-co-uk-trading212',
    title: 'Trading212 API',
  },
];

function gridPos(x, y, w, h) {
  return { h, w, x, y };
}

function reduceToLastValue() {
  return new ReduceDataOptionsBuilder()
    .calcs(['lastNotNull'])
    .fields('/.*/');
}

function cloudwatchMetric({
  refId,
  label,
  region = config.awsRegion,
  namespace,
  metricName,
  dimensions,
  statistic = 'Sum',
  period = 'auto',
}) {
  return new MetricsQueryBuilder()
    .queryMode(QueryMode.Metrics)
    .metricQueryType(MetricQueryType.Search)
    .metricEditorMode(MetricEditorMode.Builder)
    .refId(refId)
    .id(refId.toLowerCase())
    .label(label)
    .region(region)
    .namespace(namespace)
    .metricName(metricName)
    .dimensions(dimensions)
    .statistic(statistic)
    .period(period)
    .datasource(cloudwatchDatasource);
}

function statPanel({ title, description, unit, decimals, query, pos }) {
  const panel = new StatPanelBuilder()
    .title(title)
    .description(description)
    .gridPos(pos)
    .datasource(cloudwatchDatasource)
    .reduceOptions(reduceToLastValue())
    .withTarget(query);

  if (unit) {
    panel.unit(unit);
  }

  if (typeof decimals === 'number') {
    panel.decimals(decimals);
  }

  return panel;
}

function timeseriesPanel({ title, description, unit, pos, queries }) {
  const panel = new TimeSeriesPanelBuilder()
    .title(title)
    .description(description)
    .gridPos(pos)
    .datasource(cloudwatchDatasource);

  if (unit) {
    panel.unit(unit);
  }

  for (const query of queries) {
    panel.withTarget(query);
  }

  return panel;
}

function textPanel({ title, content, pos }) {
  return new TextPanelBuilder()
    .title(title)
    .gridPos(pos)
    .mode(TextMode.Markdown)
    .content(content);
}

function buildOperationalOverview() {
  const intro = [
    'This dashboard is generated from code in the repository and synced by GitHub Actions.',
    '',
    '- Select your **CloudWatch** datasource from the dropdown above.',
    `- Lambda and SES signals are wired by naming convention for **${config.domain}**.`,
    config.apiGatewayId
      ? `- API Gateway panels are wired to **${config.apiGatewayId}**.`
      : '- API Gateway panels are not wired yet because no API ID was supplied during build.',
    config.cloudFrontDistributionId
      ? `- CloudFront panels are wired to **${config.cloudFrontDistributionId}**.`
      : '- CloudFront panels are not wired yet because no distribution ID was supplied during build.',
  ].join('\n');

  const dashboard = new DashboardBuilder('craigwatt.co.uk / Platform Health')
    .uid('craigwatt-platform-health')
    .description(
      'AWS platform health for craigwatt.co.uk, generated via the Grafana Foundation SDK.'
    )
    .tags([
      'generated',
      'foundation-sdk',
      'craigwatt',
      'website',
      'aws',
      'platform-health',
    ])
    .refresh('1m')
    .time({ from: 'now-6h', to: 'now' })
    .timezone('browser')
    .withVariable(
      new DatasourceVariableBuilder('cloudwatch_datasource')
        .label('CloudWatch datasource')
        .description('Pick the Grafana CloudWatch datasource for this AWS account.')
        .type('cloudwatch')
    )
    .withPanel(
      textPanel({
        title: 'Wiring',
        content: intro,
        pos: gridPos(0, 0, 24, 5),
      })
    );

  dashboard
    .withPanel(
      statPanel({
        title: 'Contact invocations',
        description: 'Latest Lambda invocation value for the contact form handler.',
        query: cloudwatchMetric({
          refId: 'A',
          label: 'Contact invocations',
          namespace: 'AWS/Lambda',
          metricName: 'Invocations',
          dimensions: { FunctionName: 'craigwatt-co-uk-contact' },
        }),
        pos: gridPos(0, 5, 6, 5),
      })
    )
    .withPanel(
      statPanel({
        title: 'Contact errors',
        description: 'Latest Lambda error value for the contact form handler.',
        query: cloudwatchMetric({
          refId: 'B',
          label: 'Contact errors',
          namespace: 'AWS/Lambda',
          metricName: 'Errors',
          dimensions: { FunctionName: 'craigwatt-co-uk-contact' },
        }),
        pos: gridPos(6, 5, 6, 5),
      })
    )
    .withPanel(
      statPanel({
        title: 'SES sends',
        description: 'Latest send count for the craigwatt.co.uk SES identity.',
        query: cloudwatchMetric({
          refId: 'C',
          label: 'SES sends',
          namespace: 'AWS/SES',
          metricName: 'Send',
          dimensions: { Identity: config.domain },
        }),
        pos: gridPos(12, 5, 6, 5),
      })
    )
    .withPanel(
      statPanel({
        title: 'Checker invocations',
        description:
          'Latest Lambda invocation value for the salary inflation checker API.',
        query: cloudwatchMetric({
          refId: 'D',
          label: 'Checker invocations',
          namespace: 'AWS/Lambda',
          metricName: 'Invocations',
          dimensions: { FunctionName: 'craigwatt-co-uk-cost-of-living' },
        }),
        pos: gridPos(18, 5, 6, 5),
      })
    )
    .withPanel(
      timeseriesPanel({
        title: 'Lambda invocations',
        description: 'Invocation trend for the three managed website APIs.',
        unit: 'short',
        pos: gridPos(0, 10, 12, 8),
        queries: lambdaFunctions.map((service, index) =>
          cloudwatchMetric({
            refId: `L${index + 1}`,
            label: service.title,
            namespace: 'AWS/Lambda',
            metricName: 'Invocations',
            dimensions: { FunctionName: service.name },
          })
        ),
      })
    )
    .withPanel(
      timeseriesPanel({
        title: 'Lambda errors',
        description: 'Error trend for the three managed website APIs.',
        unit: 'short',
        pos: gridPos(12, 10, 12, 8),
        queries: lambdaFunctions.map((service, index) =>
          cloudwatchMetric({
            refId: `E${index + 1}`,
            label: service.title,
            namespace: 'AWS/Lambda',
            metricName: 'Errors',
            dimensions: { FunctionName: service.name },
          })
        ),
      })
    )
    .withPanel(
      timeseriesPanel({
        title: 'Lambda duration p95',
        description:
          'P95 execution time for the three managed website APIs in milliseconds.',
        unit: 'ms',
        pos: gridPos(0, 18, 12, 8),
        queries: lambdaFunctions.map((service, index) =>
          cloudwatchMetric({
            refId: `D${index + 1}`,
            label: service.title,
            namespace: 'AWS/Lambda',
            metricName: 'Duration',
            dimensions: { FunctionName: service.name },
            statistic: 'p95',
          })
        ),
      })
    )
    .withPanel(
      timeseriesPanel({
        title: 'SES delivery health',
        description:
          'Send, delivery, bounce, and complaint trend for the craigwatt.co.uk SES identity.',
        unit: 'short',
        pos: gridPos(12, 18, 12, 8),
        queries: [
          cloudwatchMetric({
            refId: 'S1',
            label: 'Send',
            namespace: 'AWS/SES',
            metricName: 'Send',
            dimensions: { Identity: config.domain },
          }),
          cloudwatchMetric({
            refId: 'S2',
            label: 'Delivery',
            namespace: 'AWS/SES',
            metricName: 'Delivery',
            dimensions: { Identity: config.domain },
          }),
          cloudwatchMetric({
            refId: 'S3',
            label: 'Bounce',
            namespace: 'AWS/SES',
            metricName: 'Bounce',
            dimensions: { Identity: config.domain },
          }),
          cloudwatchMetric({
            refId: 'S4',
            label: 'Complaint',
            namespace: 'AWS/SES',
            metricName: 'Complaint',
            dimensions: { Identity: config.domain },
          }),
        ],
      })
    );

  if (config.apiGatewayId) {
    dashboard.withPanel(
      timeseriesPanel({
        title: 'API Gateway requests and latency',
        description:
          'Request count and latency for the website HTTP API stage.',
        unit: 'short',
        pos: gridPos(0, 26, 12, 8),
        queries: [
          cloudwatchMetric({
            refId: 'G1',
            label: 'Requests',
            namespace: 'AWS/ApiGateway',
            metricName: 'Count',
            dimensions: { ApiId: config.apiGatewayId, Stage: 'live' },
          }),
          cloudwatchMetric({
            refId: 'G2',
            label: 'Latency p95',
            namespace: 'AWS/ApiGateway',
            metricName: 'Latency',
            dimensions: { ApiId: config.apiGatewayId, Stage: 'live' },
            statistic: 'p95',
          }),
        ],
      })
    );

    dashboard.withPanel(
      timeseriesPanel({
        title: 'API Gateway 4xx and 5xx',
        description: 'Client and server error trend for the website HTTP API.',
        unit: 'short',
        pos: gridPos(12, 26, 12, 8),
        queries: [
          cloudwatchMetric({
            refId: 'G3',
            label: '4xx',
            namespace: 'AWS/ApiGateway',
            metricName: '4xx',
            dimensions: { ApiId: config.apiGatewayId, Stage: 'live' },
          }),
          cloudwatchMetric({
            refId: 'G4',
            label: '5xx',
            namespace: 'AWS/ApiGateway',
            metricName: '5xx',
            dimensions: { ApiId: config.apiGatewayId, Stage: 'live' },
          }),
        ],
      })
    );
  }

  if (config.cloudFrontDistributionId) {
    dashboard.withPanel(
      timeseriesPanel({
        title: 'CloudFront requests and bytes',
        description:
          'Traffic trend for the public edge distribution in the global CloudFront namespace.',
        unit: 'short',
        pos: gridPos(0, 34, 12, 8),
        queries: [
          cloudwatchMetric({
            refId: 'C1',
            label: 'Requests',
            region: 'us-east-1',
            namespace: 'AWS/CloudFront',
            metricName: 'Requests',
            dimensions: {
              DistributionId: config.cloudFrontDistributionId,
              Region: 'Global',
            },
          }),
          cloudwatchMetric({
            refId: 'C2',
            label: 'Bytes downloaded',
            region: 'us-east-1',
            namespace: 'AWS/CloudFront',
            metricName: 'BytesDownloaded',
            dimensions: {
              DistributionId: config.cloudFrontDistributionId,
              Region: 'Global',
            },
          }),
        ],
      })
    );

    dashboard.withPanel(
      timeseriesPanel({
        title: 'CloudFront error rates',
        description:
          '4xx and 5xx error rates from the public edge distribution.',
        unit: 'percentunit',
        pos: gridPos(12, 34, 12, 8),
        queries: [
          cloudwatchMetric({
            refId: 'C3',
            label: '4xx error rate',
            region: 'us-east-1',
            namespace: 'AWS/CloudFront',
            metricName: '4xxErrorRate',
            dimensions: {
              DistributionId: config.cloudFrontDistributionId,
              Region: 'Global',
            },
            statistic: 'Average',
          }),
          cloudwatchMetric({
            refId: 'C4',
            label: '5xx error rate',
            region: 'us-east-1',
            namespace: 'AWS/CloudFront',
            metricName: '5xxErrorRate',
            dimensions: {
              DistributionId: config.cloudFrontDistributionId,
              Region: 'Global',
            },
            statistic: 'Average',
          }),
        ],
      })
    );
  }

  return {
    description:
      'Platform health dashboard for craigwatt.co.uk backed by AWS CloudWatch metrics.',
    fileName: 'platform-health.json',
    title: 'craigwatt.co.uk / Platform Health',
    uid: 'craigwatt-platform-health',
    json: dashboard.build(),
  };
}

const dashboards = [buildOperationalOverview()];

mkdirSync(outDir, { recursive: true });

const manifest = {
  generatedAt: new Date().toISOString(),
  folder,
  dashboards: dashboards.map((dashboard) => ({
    description: dashboard.description,
    fileName: dashboard.fileName,
    title: dashboard.title,
    uid: dashboard.uid,
  })),
};

for (const dashboard of dashboards) {
  writeFileSync(
    path.join(outDir, dashboard.fileName),
    JSON.stringify(dashboard.json, null, 2) + '\n'
  );
}

writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

console.log(`Generated ${dashboards.length} Grafana dashboard(s) in ${outDir}`);
