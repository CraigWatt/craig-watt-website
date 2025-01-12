# craigwatt.co.uk

Sat 11 Jan 2025 update:

README.md formatting cheatsheet: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#tables

Framework Comparison table

| Feature	| React + Next.js	| Vue + Nuxt.js	| Svelte + SvelteKit |
| ------------- |:-------------:| :-----:| -----:|
| Language | JavaScript / TypeScript | JavaScript / TypeScript	| JavaScript / TypeScript |
| Framework | Next.js (built on React) | Nuxt (built on Vue) | SvelteKit (built on Svelte) |
| SSR/SSG | Yes (built-in) | Yes (built-in) | Yes (built-in) |
| CMS	| Sanity (agnostic) | Sanity (agnostic) | Sanity (agnostic) |
| Storybook	| @storybook/react | @storybook/vue3 (or @storybook/vue) | @storybook/svelte |
| Unit Testing | React Testing Library | Vue Testing Library | Svelte Testing Library |
| E2E Testing |	Cypress (framework-agnostic) | Cypress (framework-agnostic) | Cypress (framework-agnostic) |
| Deployment | Vercel, Netlify, Docker/Kubernetes, etc. | Vercel, Netlify, Docker/Kubernetes, etc. | Vercel, Netlify,Docker/Kubernetes, etc. |


Kubernetes / DevOps Deployment Table

| Aspect	| Kubernetes (Cloud-Agnostic)	| Docker-only (Single VM / Container PaaS)	| Fully Managed PaaS (e.g. Vercel, Netlify) |
| ------------- |:-------------:| :-----:| -----:|
| Containerization | Mandatory: Build a multi-stage Docker image.  Use a registry accessible by your K8s cluster (ECR, GCR, GHCR, Docker Hub, etc.). | Mandatory, but typically simpler to deploy directly to a single host or a container-based PaaS (Render, Railway).	| Often optional: the platform does the build/deploy. If you do provide a Dockerfile (Netlify can handle it, Vercel in some scenarios), the system manages containers under the hood. |
| Deployment | K8s Manifests: Deployment, Service, Ingress (or a Helm chart).  You manage Ingress Controller (NGINX, Traefik, etc.) and certificates (with cert-manager).  Horizontal scaling with HPA. | Docker run or simple config in a container platform’s UI.  Possibly manual scaling or partial auto-scaling if the platform supports it. | Typically push to Git → platform auto-builds & deploys.  Scaling is often automatic (Vercel) or limited (Netlify for SSR). |
| CI/CD | Yes (built-in) | Yes (built-in) | Yes (built-in) |
| Scalability	| Sanity (agnostic) | Sanity (agnostic) | Sanity (agnostic) |
| Maintenance	| @storybook/react | @storybook/vue3 (or @storybook/vue) | @storybook/svelte |
| Lock-In | React Testing Library | Vue Testing Library | Svelte Testing Library |
| Cost |	Cypress (framework-agnostic) | Cypress (framework-agnostic) | Cypress (framework-agnostic) |
| Ideal Use Cases | Vercel, Netlify, Docker/Kubernetes, etc. | Vercel, Netlify, Docker/Kubernetes, etc. | Vercel, Netlify,Docker/Kubernetes, etc. |


- **Framework**: [Next.js](https://nextjs.org/)
- **Deployment**: [Vercel](https://vercel.com)
- **CMS**: [Sanity](https://www.sanity.io/)
- **Styling**: [Stitches](https://stitches.dev/)

Other considerations:
- **Radix**: [Radix](https://www.radix-ui.com/)


The Main Goal is to bootstrap a personal CV website quickly using:

TypeScript
Next.js
Next-ui

Milestones consist of:

Home Page &/ Portfolio

Blog

'Craig's React Cookbook'

## Running Locally

```
Good Luck!

```
