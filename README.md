# craigwatt.co.uk

Sat 11 Jan 2025 update:

README.md formatting cheatsheet: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet#tables

## This is an Nx Monorepo
```
craigwatt.co.uk/
  ├─ README.md         (the doc you drafted)
  ├─ packages/         (optionally for shared code, if you want)
  ├─ apps/
  │   ├─ nextjs-app/
  │   ├─ vue-nuxt-app/
  │   ├─ sveltekit-app/
  │   └─ react-standalone/
  └─ ...
```

## this is a project that prioritises component-driven-development

## Evolving tree explanation

```
.
├── .git
├── .github
├── .gitignore
├── .next
├── .storybook
├── README.md
├── next-env.d.ts
├── next.config.js
├── node_modules
├── package-lock.json
├── package.json
├── public
├── src
├── structure.txt
├── structure_mini.txt
├── styles
├── tsconfig.json
└── yarn.lock
```

From the `tree` output, we can see your current project is a **Next.js** app with the following structure:

- **`.next/`**: The build/output folder containing Next.js artifacts.
- **`node_modules/`**: Dependencies installed via `npm` or `yarn`.
- **`src/`**, **`public/`**, **`styles/`**: Core directories for source code, static assets, and global styles respectively.
- **`.storybook/`**: Configuration files for Storybook, indicating an existing Storybook setup.
- **Root-level Files**:
  - `package.json`: Defines project dependencies and scripts.
  - `yarn.lock` / `package-lock.json`: Lockfiles for dependency versions.
  - `next.config.js`: Configuration file for Next.js.
  - `tsconfig.json`: TypeScript configuration.
  - `README.md`: Project documentation.
  - Other configuration and environment files as needed.

This structure is typical of a single Next.js repository augmented with additional tools and configurations, such as Storybook for component development and testing. It reflects a well-organized setup aimed at maintaining scalability and ease of development.


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
| Observability | TBA | TBA | TBA | TBA |


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
  <li><strong>Stitches</strong>
    <ul>
      <li><strong>What It Is</strong>: A modern CSS-in-JS library for React. It lets you define your styling directly in JavaScript/TypeScript without creating separate <em>.css</em> files.</li>
      <li>
        Key Features:
        <ul>
          <li>Zero-runtime or low-runtime overhead compared to older CSS-in-JS libraries.</li>
          <li><strong>Theming</strong>: Easily define global design tokens (colors, spacing, fonts) and swap themes at runtime.</li>
          <li>Scoped &amp; composable styled components, reducing naming collisions.</li>
        </ul>
      </li>
    </ul>
  </li>
  <li><strong>Radix UI</strong>
    <ul>
      <li><strong>What It Is</strong>: A set of unstyled, accessible React component primitives (e.g., Dialog, Dropdown, Tabs).</li>
      <li>
        Key Features:
        <ul>
          <li><strong>Accessibility</strong>: Automatically manages ARIA attributes, keyboard navigation, and focus states.</li>
          <li>Unopinionated design – you add your own styles (works great with Stitches).</li>
          <li>Comprehensive library of UI patterns for consistent, production-ready components.</li>
        </ul>
      </li>
    </ul>
  </li>
  <li><strong>Headless UI for Vue</strong>
    <ul>
      <li><strong>What It Is</strong>: A Vue-focused collection of unstyled, fully accessible UI components (similar to Radix UI, but for Vue).</li>
      <li>
        Key Features:
        <ul>
          <li>Offers headless <em>(unstyled)</em> building blocks (Menu, Dialog, Listbox, etc.) you can customize freely.</li>
          <li>Maintains proper accessibility without dictating your design choices.</li>
          <li>Works seamlessly with Vue’s <strong>scoped CSS</strong> or a utility-first framework like Tailwind.</li>
        </ul>
      </li>
    </ul>
  </li>
  <li><strong>Svelte’s Built-In Scoped Styling</strong>
    <ul>
      <li><strong>What It Is</strong>: Svelte automatically scopes <em>&lt;style&gt;</em> blocks within each <em>.svelte</em> component, preventing naming collisions.</li>
      <li>
        Key Features:
        <ul>
          <li>All styles are isolated to the component by default (no global leaks).</li>
          <li>No need for separate files or a dedicated CSS-in-JS library.</li>
          <li>Simple yet powerful approach for smaller projects or to build custom design systems.</li>
        </ul>
      </li>
    </ul>
  </li>
</ol>

## Other future considerations:
- **Radix**: [Radix](https://www.radix-ui.com/)

## Old Milestones consisted of:
- Home Page & Portfolio
- Blog
- 'Craig's React Cookbook'
## New Milestones consist of:
- Home Page & Portfolio
- Slow Cooking Recipes 
