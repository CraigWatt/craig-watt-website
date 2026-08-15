# craigwatt.co.uk

Static-first personal site with supporting APIs and infrastructure:

- `services/website`
- `services/contact-api`
- `services/cost-of-living-api`
- `services/trading212-api`
- `platform/trading212`
- `infra`

## Layout

```text
craig-watt-website/
├─ services/
│  ├─ website/
│  ├─ website-e2e/
│  ├─ contact-api/
│  ├─ cost-of-living-api/
│  └─ trading212-api/
├─ platform/
│  └─ trading212/
└─ infra/
   ├─ bootstrap/
   ├─ modules/
   └─ services/
```

## Local commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run e2e
npm run storybook
npm run build-storybook
npm run build:functions
```

`npm run build` produces the exported static site in `services/website/out`, and `npm run build:functions` bundles the Lambda handlers into `dist/services/*`.

## Public data sources

Dynamic data is fetched by AWS Lambda and proxied through API Gateway, so the site stays static at the edge while the data updates independently.

- `GET /api/trading212` for portfolio data
- `POST /api/contact` for the contact form
- `GET /api/cost-of-living` for the new cost-of-living snapshots

The cost-of-living endpoint uses public sources only, so there are no extra API keys to store in GitHub Secrets for the first pass:

- ONS Consumer Price Inflation bulletin for CPIH and the inflation baseline
- ONS ASHE Table 7 dataset page for salary-by-location source acquisition
- Tesco lunch meal-deals page for current meal-deal price snapshots

## Deployment

The production stack is now:

- S3 for static asset storage
- CloudFront for CDN + `/api/*` routing
- API Gateway for public API ingress
- Lambda for `contact`, `cost-of-living`, and `trading212`
- Route 53 for DNS

Terraform entrypoint:

```bash
cd infra
terraform init
terraform apply
```

Terraform state locking now uses S3 lockfiles, so there is no separate DynamoDB lock table.

Bootstrap resources for the GitHub Actions deployment role live under `infra/bootstrap`.
