# craigwatt.co.uk

Sat 11 Jan 2025 update:

README.md formatting cheatsheet: https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet

## 🚀 Milestones Checklist

### **0. Establish Dependencies and Version Numbers**
- [ ] **Define Core Dependencies**
  - [ ] Specify Node.js version
  - [ ] Define versions for frameworks (Next.js, Vue + Nuxt.js, SvelteKit, React Standalone)
- [ ] **Set Up Package Managers**
  - [ ] Decide between npm or Yarn (if not already)
  - [ ] Specify versions for package managers
- [ ] **Lock Dependency Versions**
  - [ ] Ensure `package.json` and lock files (`yarn.lock`/`package-lock.json`) are up-to-date
- [ ] **Document Dependency Versions**
  - [ ] Create a `DEPENDENCIES.md` or add a section in `README.md` detailing all dependencies and their versions
- [ ] **Set Up Version Control for Dependencies**
  - [ ] Use tools like Renovate or Dependabot for automated dependency updates
- [ ] **Review and Approve Dependencies**
  - [ ] Conduct a team review to ensure all necessary dependencies are included and approved

### **1. Initialize Nx Monorepo**
- [ ] Set Up Nx Workspace
- [ ] Add Existing Applications (`nextjs-app`, `vue-nuxt-app`, `sveltekit-app`, `react-standalone`)
- [ ] Configure Shared Libraries (`libs/shared-ui/`, `libs/shared-utils/`)

### **2. Set Up Dockerized Development Environment**
- [ ] Create Centralized Docker Configuration (`Dockerfile`, `docker-compose.yml`)
- [ ] Configure Environment Variables
- [ ] Document Setup Instructions in `README.md`

### **3. Implement Component-Driven Development with Storybook**
- [ ] Set Up Storybook for Each Framework
- [ ] Create Sample Component Stories
- [ ] Integrate Storybook into CI/CD Pipelines
- [ ] Document Best Practices in `README.md`

### **4. Deploy Observability Stack**
- [ ] Set Up Monitoring Tools (Prometheus, Grafana, Loki, Promtail, Tempo, Mimir, Telegraf)
- [ ] Configure Instrumentation for Applications
- [ ] Create Grafana Dashboards
- [ ] Establish Alerting Mechanisms
- [ ] Document Observability Setup in `README.md`

### **5. Implement SEO Optimization Tools and Practices**
- [ ] Set Up Google Search Console
- [ ] Integrate SEO Tools (Ahrefs, SEMrush, Moz)
- [ ] Automate Lighthouse Audits with Lighthouse CI
- [ ] Optimize Meta Tags and Sitemaps
- [ ] Monitor and Improve SEO Metrics
- [ ] Document SEO Practices in `README.md`

### **6. Establish Continuous Integration and Continuous Deployment (CI/CD) Pipelines**
- [ ] Set Up CI/CD Workflows (e.g., GitHub Actions)
- [ ] Integrate Testing Suites (Jest, Cypress/Playwright)
- [ ] Automate Deployments to Platforms (Vercel, Netlify, Docker/Kubernetes)
- [ ] Implement Caching and Parallelism for Faster Builds
- [ ] Add Status Badges to `README.md`

### **7. Implement Code Quality and Security Checks**
- [ ] Enforce Linting and Formatting (ESLint, Prettier)
- [ ] Integrate Static Code Analysis Tools (SonarQube, CodeClimate)
- [ ] Set Up Security Scanning Tools (Snyk, Dependabot)
- [ ] Document Code Quality Standards in `README.md`

### **8. Develop and Document Shared Libraries (Optional)**
- [ ] Create Shared UI Components (`libs/shared-ui/`)
- [ ] Implement Shared Utilities (`libs/shared-utils/`)
- [ ] Document Usage of Shared Libraries
- [ ] Set Up Storybook for Shared Components

### **9. Establish Monitoring and Maintenance Practices**
- [ ] Regularly Review Observability Dashboards
- [ ] Conduct Periodic SEO Audits
- [ ] Update Dependencies and Tools
- [ ] Gather Team Feedback
- [ ] Document Maintenance Procedures in `README.md`

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

## To work on this project, please ensure you are using our Dockerised Development Environment

Using a Dockerised development environment will ensure all developers to this project are ensuring consistency, scalability and ease of onboarding new developers.  By containerizing our environment, we can eliminate "it works on my machine" issues, streamline setup processes, and maintain uniform configurations across all team members' systems.

## Foundation Dependencies

### **Base Dependencies**
- [ ] **Node.js** (Specify version in `engines` field of `package.json`):
  - Recommended LTS version: `>=18.x` (stable and widely supported).
- [ ] **Package Manager**: `npm` (bundled with Node.js):
  - Use `npm` to manage dependencies and scripts consistently across all environments.
  - Ensure `npm` version is compatible with Node.js (update via `npm install -g npm` if needed).
- [ ] **Framework-Specific**:
  - Next.js (`next`): `^13.0.1`
  - Nuxt.js (`nuxt`): `^3.x`
  - SvelteKit (`@sveltejs/kit`): Latest stable version.
  - React Standalone:
    - `react`: `18.2.0`
    - `react-dom`: `18.2.0`
- [ ] **TypeScript**:
  - `typescript`: `^5.0.0` (latest stable version)
  - Framework-specific type definitions:
    - `@types/react`
    - `@types/react-dom`
    - `@types/node`

---

### **Development Dependencies**
- [ ] **Code Quality**:
  - **Linting**:
    - Base: `eslint`
    - Framework-Specific:
      - `eslint-config-next`
      - `eslint-plugin-vue`
      - `eslint-plugin-svelte`
  - **Formatting**: `prettier`
- [ ] **Testing**:
  - **Unit Testing**:
    - Base: `jest`
    - Framework-specific testing libraries:
      - `@testing-library/react`
      - `@vue/test-utils`
      - `@testing-library/svelte`
  - **E2E Testing**:
    - Choose one: `cypress` or `playwright`
- [ ] **Storybook**:
  - Core:
    - `@storybook/react`
    - `@storybook/vue3`
    - `@storybook/svelte`
  - Optional Addons:
    - `@storybook/addon-actions`
    - `@storybook/addon-essentials`
    - `@storybook/addon-interactions`

---

### **Monorepo Management**
- [ ] **Nx Plugins**:
  - `@nrwl/workspace`
  - `@nrwl/next`
  - `@nrwl/react`
  - `@nrwl/vue`
  - `@nrwl/svelte`

---

### **Observability and SEO**
- [ ] **Observability Tools**:
  - `@opentelemetry/api`
  - `@opentelemetry/sdk-node`
  - `lighthouse`
- [ ] **SEO Tools**:
  - `lighthouse-ci`
  - `sitemap`

---

### **Scripts in `package.json`**
Ensure scripts for development, testing, and Storybook are defined:
- `dev`, `build`, `start`, `lint`, `test`, `storybook`, `build-storybook`.



## this is a project that prioritises component-driven-development

## Evolving tree explanation

```
From the `tree` output, we can see your current project is a **Next.js** app with the following structure:
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
| Monorepo Management | Nx | Nx | Nx | Nx |
| Development Environment | Dockerized | Dockerized | Dockerized | Dockerized |
| SSR/SSG | Yes (built-in) | Yes (built-in) | Yes (built-in) | None by default; custom SSR/SSG possible via ReactDOMServer or build scripts (no built-in approach). |
| CMS	| Sanity (agnostic) | Sanity (agnostic) | Sanity (agnostic) | Sanity (agnostic) |
| Component-Driven-Development | @storybook/react | @storybook/vue3 (or @storybook/vue) | @storybook/svelte | @storybook/react |
| Styling | Stitches (CSS-in-JS) + Radix UI for accessible, unstyled components | Use Vue’s scoped CSS or a minimal headless library (e.g., Headless UI for Vue) | Leverage Svelte’s built-in scoped styling or a minimal community library (e.g., SvelteUI) (no official Radix port) | Stitches (CSS-in-JS) + Radix UI (no built-in approach) |
| Code Quality | ESLint | ESLint | ESLint | ESLint |
| Code Formatting | Prettier | Prettier | Prettier | Prettier |
| Testing Framework | Jest | Jest | Jest | Jest |
| Unit Testing | React Testing Library | Vue Testing Library | Svelte Testing Library | React Testing Library |
| E2E Testing |	Cypress / Playwright (both framework-agnostic) | Cypress / Playwright (both framework-agnostic) | Cypress / Playwright (both framework-agnostic) | Cypress / Playwright (both framework-agnostic) |
| Deployment | Vercel, Netlify, Docker/Kubernetes, etc. | Vercel, Netlify, Docker/Kubernetes, etc. | Vercel, Netlify, Docker/Kubernetes, etc. | Netlify, Vercel, Docker/Kubernetes, or any static file host
| Observability | Prometheus, Grafana, Loki, OpenTelemetry, Telegraf, Mimir, Tempo; Google Lighthouse; SEO Tools | Prometheus, Grafana, Loki, OpenTelemetry, Telegraf, Mimir, Tempo; Google Lighthouse; SEO Tools | Prometheus, Grafana, Loki, OpenTelemetry, Telegraf, Mimir, Tempo; Google Lighthouse; SEO Tools | Prometheus, Grafana, Loki, OpenTelemetry, Telegraf, Mimir, Tempo; Google Lighthouse; SEO Tools|
| SEO Optimization | Integrated SEO tools (e.g., Google Search Console, Ahrefs, SEMrush); Lighthouse CI for performance audits | Integrated SEO tools (e.g., Google Search Console, Ahrefs, SEMrush); Lighthouse CI for performance audits | Integrated SEO tools (e.g., Google Search Console, Ahrefs, SEMrush); Lighthouse CI for performance audits | Integrated SEO tools (e.g., Google Search Console, Ahrefs, SEMrush); Lighthouse CI for performance audits |
| Dependency Tooling | Dependabot | Dependabot | Dependabot | Dependabot
| Security Tooling | GitHub Secret Scanning, Snyk | GitHub Secret Scanning, Snyk | GitHub Secret Scanning, Snyk | GitHub Secret Scanning, Snyk


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
