# craigwatt.co.uk

Sat 11 Jan 2025 update:

README.md formatting cheatsheet: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#tables

## Framework Comparison table

| Feature | React + Next.js	| Vue + Nuxt.js	| Svelte + SvelteKit | React (No Meta-Framework)
| :--- |:---| :---|:---|:---|
| Language | JavaScript / TypeScript | JavaScript / TypeScript	| JavaScript / TypeScript | JavaScript / TypeScript |
| Framework | Next.js (built on React) | Nuxt (built on Vue) | SvelteKit (built on Svelte) | N/A (using 'Create React App, Vite, or a custom setup) |
| SSR/SSG | Yes (built-in) | Yes (built-in) | Yes (built-in) | None by default; custom SSR/SSG possible via ReactDOMServer or build scripts (no built-in approach). |
| CMS	| Sanity (agnostic) | Sanity (agnostic) | Sanity (agnostic) | Sanity (agnostic) |
| Storybook	| @storybook/react | @storybook/vue3 (or @storybook/vue) | @storybook/svelte | @storybook/react |
| Styling | Stitches (CSS-in-JS) + Radix UI for accessible, unstyled components | Use Vue’s scoped CSS or a minimal headless library (e.g., Headless UI for Vue) | Leverage Svelte’s built-in scoped styling or a minimal community library (e.g., SvelteUI) (no official Radix port) | Stitches (CSS-in-JS) + Radix UI (no built-in approach) |
| Unit Testing | React Testing Library | Vue Testing Library | Svelte Testing Library | React Testing Library |
| E2E Testing |	Cypress / Playwright (both framework-agnostic) | Cypress / Playwright (both framework-agnostic) | Cypress / Playwright (both framework-agnostic) | Cypress / Playwright (both framework-agnostic) |
| Deployment | Vercel, Netlify, Docker/Kubernetes, etc. | Vercel, Netlify, Docker/Kubernetes, etc. | Vercel, Netlify,Docker/Kubernetes, etc. | Netlify, Vercel, Docker/Kubernetes, or any static file host


## Kubernetes / DevOps Deployment Table

| Aspect | Kubernetes (Cloud-Agnostic)	| Docker-only (Single VM / Container PaaS)	| Fully Managed PaaS (e.g. Vercel, Netlify) |
|:--- |:---| :---|:---|
| Containerization | <ul><li> **Mandatory**: Build a multi-stage Docker image. </li><li> Use a registry accessible by your K8s cluster (ECR, GCR, GHCR, Docker Hub, etc.). </li></ul> | Mandatory, but typically simpler to deploy directly to a single host or a container-based PaaS (Render, Railway).	| Often optional: the platform does the build/deploy. If you do provide a Dockerfile (Netlify can handle it, Vercel in some scenarios), the system manages containers under the hood. |
| Deployment | K8s Manifests: Deployment, Service, Ingress (or a Helm chart).  You manage Ingress Controller (NGINX, Traefik, etc.) and certificates (with cert-manager).  Horizontal scaling with HPA. | Docker run or simple config in a container platform’s UI.  Possibly manual scaling or partial auto-scaling if the platform supports it. | Typically push to Git → platform auto-builds & deploys.  Scaling is often automatic (Vercel) or limited (Netlify for SSR). |
| CI/CD | Build & Test in external CI (GitHub Actions, GitLab, etc.).  Push container image to registry.  Deploy with kubectl apply, Helm, or a GitOps tool (Argo CD, Flux). | Similar steps to build & test.  Then either:  1) SSH into the VM to pull/run the new image, or 2) Use the container platform’s deployment mechanism. | Often built-in. E.g., Vercel integrates with GitHub → automatically triggers a build/test/deploy.  Low config overhead. |
| Scalability	| High: Kubernetes can run many replicas across multiple nodes, with advanced load balancing.  CPU/memory-based autoscaling. | Moderate: Container hosts like Render or Railway can scale containers. A single VM may require manual scale-up. | Automatic or limited: Vercel can scale globally for serverless/Edge. Netlify has some SSR limitations. |
| Maintenance	| High: You must maintain the cluster (upgrades, node patches, monitoring, logging).  If using a managed K8s (EKS, GKE, AKS), some tasks are handled by the cloud provider, but there’s still overhead for cluster config. | Moderate: A single VM requires OS-level updates or a host that does it for you.  Container-based PaaS typically handle underlying OS/infrastructure. | Low: The platform manages updates, server infrastructure, SSL certificates, etc. |
| Lock-In | Low: Standard K8s objects. Move to any other K8s cluster with minimal changes.  Avoid cluster-specific features (some advanced cloud add-ons) if you want pure portability. | Moderate: If you rely on specific features of a container PaaS (like proprietary add-ons), switching might require changes. A single VM is not locked in, but is more manual. | Higher: Relying on Vercel or Netlify’s serverless functions, Edge Middleware, or other proprietary features can make migration more involved. |
| Cost | Varies: Managed K8s on AWS/GCP/Azure adds cluster and node costs. Self-managed can be cheaper hardware but more staff time.  For a small site, can be overkill unless you already have a cluster. | - Potentially cheaper if you’re running one small VM or a container-based service for personal projects.  Container PaaS typically pay-per-resource or usage. | Free/low-tier options exist (Vercel, Netlify), but can get pricier with higher traffic or advanced features. |
| Ideal Use Cases | Complex apps or microservices needing advanced orchestration, rolling updates, canary deployments.  DevOps demonstration or already comfortable with K8s.  Avoiding cloud lock-in across multiple providers or on-prem. | Mid-sized apps where you want Docker’s portability but not the overhead of K8s.  Simpler than a full cluster if you’re comfortable with Docker. | Personal sites, small projects, or large projects that want minimal DevOps overhead.  Extremely quick to market; robust platform features. |


## Some Styling Definitions

<ol>
  <li>__Stitches__
    <ul>
      <li>**What It Is**: A modern CSS-in-JS library for React.  It lets you define your styling directly in JavaScript/TypeScript without creating seperate .css files.</li>
      <li>
        Key Features:
        <ul>
          <li>Zero-runtime or low-runtime overhead (compared to older CSS-in-JS libraries).</li>
          <li>**Theming:** Eas</li>
        </ul>
      </li>
    </ul>
  </li>
  <li></li>
  <li></li>
</ol>
<ul>

</ul>



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
