# 👋 Hi, I’m Craig Watt

I’m a **Platform Engineer focused on observability, automation, and reliable delivery** at [Sky](https://www.sky.com).

I build and operate production systems across:

- **Languages & Frameworks:** C, Python, TypeScript, React, Next.js
- **Infrastructure & Automation:** AWS, Kubernetes, Terraform, Ansible, Docker
- **Observability & Reliability:** Prometheus, Grafana, Telegraf, Concourse CI, GitHub Actions

## 🌟 Current projects

- [stream.craigwatt.win](https://stream.craigwatt.win) - a self-hosted video streaming platform on a Raspberry Pi k3s Kubernetes cluster, built with reproducible infrastructure and production-style guard rails.
- [vfo](https://github.com/CraigWatt/vfo) - a C/FFmpeg batch encoder for device-aware video processing.
- [Personal site](https://craigwatt.co.uk) - a Next.js/Tailwind portfolio and blog focused on projects, writing, experience, credentials, and observability experiments.
  - Includes a [Trading212 Dashboard](https://craigwatt.co.uk/trading212) for finance visualisation.

## 📌 Interests

- Platform engineering and observability
- C systems and media tooling
- Automation, IaC, and CI/CD
- Select frontend work when it supports the platform story

## 🤝 Open to collaborating on

- Platform engineering and observability tools
- C systems projects
- Infrastructure automation and delivery tooling

## 📫 Reach me

- Email: [craig@webrefine.co.uk](mailto:craig@webrefine.co.uk)
- [LinkedIn](https://www.linkedin.com/in/craig-watt-dev/)
- [X (Twitter)](https://x.com/devcraigwatt)

---

### ⚡ Tech Stack

**Languages & Frameworks**

`C` · `Python` · `TypeScript` · `React` · `Next.js`

**Cloud & Infra**

`AWS` · `Kubernetes` · `Terraform` · `Ansible` · `Docker`

**Observability & CI/CD**

`Prometheus` · `Grafana` · `Telegraf` · `Concourse CI` · `GitHub Actions`

---

## 📦 Repo

Static-first personal site with two small managed APIs:

- `services/website`
- `services/contact-api`
- `services/trading212-api`
- `platform/trading212`
- `infra`

### Layout

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

### Local commands

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

`website:build` produces the exported static site in [services/website/out](/Users/craigwatt/localProjects/craig-watt-website/services/website/out) and `build:functions` bundles the Lambda handlers into `dist/services/*`.

## Deployment

The production stack is:

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

Terraform state locking uses S3 lockfiles, so there is no separate DynamoDB lock table.

Bootstrap resources for the GitHub Actions deployment role live under [infra/bootstrap](/Users/craigwatt/localProjects/craig-watt-website/infra/bootstrap).
