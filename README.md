# craigwatt.co.uk

Static-first personal site with two small managed APIs:

- `services/website`
- `services/contact-api`
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
npx nx run website:serve
npx nx run website:build
npx nx run website:start
npx nx run website:lint
npx nx run website:test
npx nx run website:storybook
npx nx run website:build-storybook
npm run build:functions
```

`website:build` produces the exported static site in [services/website/out](/Users/craigwatt/localProjects/craig-watt-website/services/website/out) and `build:functions` bundles the Lambda handlers into `dist/services/*`.

## Deployment

The production stack is now:

- S3 for static asset storage
- CloudFront for CDN + `/api/*` routing
- API Gateway for public API ingress
- Lambda for `contact` and `trading212`
- Route 53 for DNS

Terraform entrypoint:

```bash
cd infra
terraform init
terraform apply
```

Bootstrap resources for the GitHub Actions deployment role live under [infra/bootstrap](/Users/craigwatt/localProjects/craig-watt-website/infra/bootstrap).
