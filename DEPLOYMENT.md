# Deployment Guide

Comprehensive deployment documentation for **Ask Dreeso Memory**, covering Vercel hosting, environment configuration, build pipeline, SPA routing, CI/CD integration, and production considerations.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build for Production](#build-for-production)
- [Vercel Deployment](#vercel-deployment)
  - [One-Click Deploy](#one-click-deploy)
  - [Vercel CLI Deploy](#vercel-cli-deploy)
  - [GitHub Integration](#github-integration)
- [Environment Variables](#environment-variables)
- [SPA Routing Configuration](#spa-routing-configuration)
- [CI/CD with GitHub and Vercel](#cicd-with-github-and-vercel)
  - [Automatic Deployments](#automatic-deployments)
  - [Preview Deployments](#preview-deployments)
  - [Branch Protection](#branch-protection)
- [Other Hosting Platforms](#other-hosting-platforms)
  - [Netlify](#netlify)
  - [AWS S3 + CloudFront](#aws-s3--cloudfront)
  - [Docker / Nginx](#docker--nginx)
- [Production Considerations](#production-considerations)
  - [Performance](#performance)
  - [Security](#security)
  - [Monitoring](#monitoring)
  - [Caching](#caching)
  - [Browser Support](#browser-support)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- **Node.js** >= 18.x installed locally (for building)
- **npm** >= 9.x (or equivalent package manager)
- A **Vercel account** (free tier is sufficient) — [vercel.com](https://vercel.com)
- A **GitHub account** (for CI/CD integration)
- All dependencies installed locally:

```bash
npm install
```

---

## Build for Production

Generate an optimized production bundle:

```bash
npm run build
```

This runs `vite build` and outputs to the `dist/` directory. The build includes:

- **Minified JavaScript** bundles with automatic code splitting
- **Optimized CSS** with Tailwind CSS purging (unused classes removed)
- **Static assets** with content hashing for cache busting
- **Tree-shaken** dependencies (only used code is included)

To preview the production build locally before deploying:

```bash
npm run preview
```

This starts a local server at `http://localhost:4173` serving the `dist/` directory.

### Build Output Structure

```
dist/
├── index.html              # Entry HTML with hashed asset references
├── assets/
│   ├── index-[hash].js     # Main application bundle
│   ├── index-[hash].css    # Compiled Tailwind CSS
│   └── vendor-[hash].js    # Third-party dependencies (React, Framer Motion, etc.)
└── vite.svg                # Favicon
```

### Verifying the Build

Before deploying, run the full test suite and linter:

```bash
npm run test
npm run lint
npm run build
```

All three commands must pass without errors before proceeding to deployment.

---

## Vercel Deployment

### One-Click Deploy

The simplest deployment method:

1. Push your code to a GitHub repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Click **Import Project** and select your GitHub repository
4. Vercel auto-detects the Vite framework and configures:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Configure environment variables (see [Environment Variables](#environment-variables))
6. Click **Deploy**

Vercel will build and deploy the application, providing a production URL (e.g., `https://your-project.vercel.app`).

### Vercel CLI Deploy

For command-line deployments:

1. Install the Vercel CLI globally:

```bash
npm install -g vercel
```

2. Authenticate with your Vercel account:

```bash
vercel login
```

3. Deploy from the project root:

```bash
# Preview deployment (staging)
vercel

# Production deployment
vercel --prod
```

4. On first run, the CLI will prompt for project configuration:
   - **Link to existing project?** Select Yes if already created on Vercel, otherwise No
   - **Project name:** `ask-dreeso-memory` (or your preferred name)
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Development command:** `npm run dev`

### GitHub Integration

For automatic deployments on every push:

1. Go to your Vercel dashboard → **Settings** → **Git**
2. Connect your GitHub account if not already connected
3. Import the repository
4. Vercel will automatically:
   - Deploy to **production** on pushes to the `main` branch
   - Create **preview deployments** for pull requests
   - Run the build command and verify it succeeds before promoting

---

## Environment Variables

Configure the following environment variables in your Vercel project dashboard under **Settings** → **Environment Variables**:

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_APP_TITLE` | No | `Ask Dreeso Memory` | Application title displayed in the UI header and browser tab |
| `VITE_NLP_API_URL` | No | `http://localhost:3001/api/nlp` | NLP API endpoint URL (unused in mock mode; reserved for future backend integration) |
| `VITE_SESSION_TIMEOUT_MS` | No | `1800000` | Session timeout in milliseconds (default: 30 minutes / 1,800,000 ms) |
| `VITE_AUDIT_LOG_MAX_ENTRIES` | No | `500` | Maximum number of audit log entries stored in localStorage before automatic trimming |

### Setting Environment Variables on Vercel

1. Navigate to your project on the Vercel dashboard
2. Go to **Settings** → **Environment Variables**
3. Add each variable with the appropriate value
4. Select the environments where each variable should be available:
   - **Production** — live deployment
   - **Preview** — pull request deployments
   - **Development** — local development via `vercel dev`
5. Click **Save**

### Environment Variable Scoping

Vercel supports scoping variables per environment:

```
Production:
  VITE_APP_TITLE = "Ask Dreeso Memory"
  VITE_SESSION_TIMEOUT_MS = "1800000"
  VITE_AUDIT_LOG_MAX_ENTRIES = "500"

Preview:
  VITE_APP_TITLE = "Ask Dreeso Memory (Preview)"
  VITE_SESSION_TIMEOUT_MS = "3600000"
  VITE_AUDIT_LOG_MAX_ENTRIES = "1000"
```

### Local Development

For local development, copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your desired values. Vite automatically loads `.env` files during development. The `.env` file is excluded from version control via `.gitignore`.

> **Important:** All client-side environment variables in Vite **must** be prefixed with `VITE_`. Variables without this prefix are not exposed to the browser bundle.

---

## SPA Routing Configuration

Ask Dreeso Memory uses client-side routing via `react-router-dom` v6 with `createBrowserRouter`. All routes must be rewritten to `index.html` so the React router can handle them.

### Vercel Configuration

The project includes a `vercel.json` file at the repository root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures that all URL paths (e.g., `/home`, `/results`, `/audit`, `/login`) are served by `index.html`, allowing React Router to resolve the correct page component.

### Route Table

| Path | Component | Auth Required | Description |
|---|---|---|---|
| `/` | `RootRedirect` | No | Redirects to `/home` (authenticated) or `/login` (unauthenticated) |
| `/login` | `LoginScreen` | No | User login and persona quick-login |
| `/signup` | `SignupScreen` | No | User registration |
| `/home` | `HomePage` | Yes | Main landing page with intelligence clusters and query bar |
| `/results` | `QueryResultsPage` | Yes | Query results with response cards and actions |
| `/audit` | `AuditLogPage` | Yes | Audit log viewer with search and export |
| `*` | `NotFoundPage` | No | 404 error page for unmatched routes |

---

## CI/CD with GitHub and Vercel

### Automatic Deployments

When your GitHub repository is connected to Vercel:

| Event | Deployment Type | URL |
|---|---|---|
| Push to `main` | Production | `https://your-project.vercel.app` |
| Push to other branches | Preview | `https://your-project-<hash>.vercel.app` |
| Pull request opened/updated | Preview | Linked in the PR as a comment |

### Preview Deployments

Every pull request automatically receives a unique preview URL. This enables:

- **Visual review** of UI changes before merging
- **Functional testing** on a live environment
- **Stakeholder feedback** via shareable preview links

Preview deployments use the **Preview** environment variables configured in Vercel.

### Branch Protection

Recommended GitHub branch protection rules for `main`:

1. Go to **GitHub** → **Settings** → **Branches** → **Branch protection rules**
2. Add a rule for `main`:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require the Vercel deployment to succeed
   - ✅ Require branches to be up to date before merging

### GitHub Actions (Optional)

If you want to run tests before Vercel deploys, add a GitHub Actions workflow:

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      - run: npm ci

      - run: npm run lint

      - run: npm run test

      - run: npm run build
```

This workflow runs linting, tests, and a build check on every push and pull request. Vercel will still handle the actual deployment.

---

## Other Hosting Platforms

### Netlify

1. Create a `netlify.toml` file in the project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Connect your GitHub repository to Netlify
3. Configure environment variables in the Netlify dashboard
4. Deploy

### AWS S3 + CloudFront

1. Build the project:

```bash
npm run build
```

2. Upload the `dist/` directory to an S3 bucket configured for static website hosting

3. Create a CloudFront distribution pointing to the S3 bucket

4. Configure a custom error response in CloudFront:
   - **HTTP Error Code:** 403 and 404
   - **Response Page Path:** `/index.html`
   - **HTTP Response Code:** 200

This ensures SPA routing works correctly.

### Docker / Nginx

Create a `Dockerfile` in the project root:

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create an `nginx.conf` file:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
}
```

Build and run:

```bash
docker build -t ask-dreeso-memory .
docker run -p 8080:80 ask-dreeso-memory
```

---

## Production Considerations

### Performance

- **Code Splitting:** Vite automatically splits vendor dependencies into separate chunks. React, Framer Motion, and React Router are bundled separately from application code.
- **CSS Purging:** Tailwind CSS is configured to purge unused utility classes in production, resulting in a minimal CSS bundle.
- **Asset Hashing:** All static assets include content hashes in filenames, enabling aggressive browser caching with cache-busting on updates.
- **Font Loading:** Google Fonts (Urbanist) are loaded via `<link>` tags with `preconnect` hints in `index.html` for optimal loading performance.
- **Lazy Loading:** Consider adding `React.lazy()` and `Suspense` for route-level code splitting if the bundle size grows significantly.

### Security

- **No Sensitive Data in Client Bundle:** All `VITE_` environment variables are embedded in the JavaScript bundle at build time and are visible to end users. Never store API keys, secrets, or credentials in `VITE_` variables.
- **Authentication:** The current authentication system uses localStorage with btoa-encoded passwords for demo purposes only. For production use, integrate a proper authentication backend (e.g., OAuth 2.0, JWT with a secure backend).
- **Content Security Policy:** Consider adding CSP headers via Vercel's `vercel.json` or your hosting platform's configuration to restrict script sources.
- **HTTPS:** Vercel provides HTTPS by default on all deployments. Ensure your custom domain (if any) also uses HTTPS.
- **localStorage Sensitivity:** Audit log entries and session data are stored in localStorage. Users can inspect and modify this data. For production, consider server-side session management and audit logging.

### Monitoring

- **Vercel Analytics:** Enable Vercel Analytics in your project dashboard for real-time performance monitoring (Web Vitals, page views, visitor metrics).
- **Error Tracking:** Consider integrating an error tracking service (e.g., Sentry) for production error monitoring. The application includes `console.error` calls throughout services that can be replaced with a reporting service.
- **Build Logs:** Vercel provides detailed build logs for every deployment. Check these if a deployment fails.

### Caching

- **Browser Caching:** Hashed asset filenames enable long-term browser caching. The `index.html` file should not be cached aggressively (Vercel handles this automatically).
- **In-Memory Caches:** The application uses in-memory caches for query results (5-minute TTL) and rate limiting (per-user, 1-minute window). These caches reset on page reload since they are not persisted.
- **localStorage:** User data, session state, and audit logs are persisted in localStorage. The audit log is automatically trimmed to `VITE_AUDIT_LOG_MAX_ENTRIES` (default 500) entries.

### Browser Support

The application targets modern browsers with support for:

- **ES2020+** syntax (via Vite's default build target)
- **CSS backdrop-filter** (for glassmorphism effects)
- **CSS Grid and Flexbox** (for responsive layouts)
- **localStorage** (for data persistence)

Supported browsers:

| Browser | Minimum Version |
|---|---|
| Chrome | 88+ |
| Firefox | 78+ |
| Safari | 14+ |
| Edge | 88+ |

> **Note:** Internet Explorer is not supported.

---

## Troubleshooting

### Build Fails on Vercel

1. **Check Node.js version:** Ensure Vercel is using Node.js 18+. Set this in **Settings** → **General** → **Node.js Version**.
2. **Check build logs:** Review the full build output in the Vercel dashboard under **Deployments** → select the failed deployment → **Build Logs**.
3. **Reproduce locally:** Run `npm run build` locally to verify the build succeeds before pushing.
4. **Clear cache:** In the Vercel dashboard, go to **Deployments** → **Redeploy** with the **Clear Build Cache** option enabled.

### Routes Return 404

- Verify that `vercel.json` exists in the repository root with the SPA rewrite rule.
- Ensure the file is committed to the repository (check `.gitignore`).
- For other platforms, verify the equivalent rewrite/redirect configuration is in place.

### Environment Variables Not Working

- Verify variables are prefixed with `VITE_` (required by Vite).
- Verify variables are set for the correct environment (Production / Preview / Development) in the Vercel dashboard.
- After changing environment variables, trigger a new deployment — Vercel does not hot-reload environment variables on existing deployments.
- Locally, ensure the `.env` file exists and the development server has been restarted after changes.

### Blank Page After Deployment

- Open the browser developer console and check for JavaScript errors.
- Verify the `dist/index.html` file references the correct asset paths (should be relative: `/assets/...`).
- Ensure the Vite `base` configuration is not set to a subdirectory path unless the app is hosted at a subpath.

### Fonts Not Loading

- Verify the Google Fonts `<link>` tags are present in `index.html`.
- Check that the `preconnect` hints for `fonts.googleapis.com` and `fonts.gstatic.com` are included.
- If behind a corporate firewall or CSP, ensure Google Fonts domains are allowed.

### Session Expires Too Quickly

- Check the `VITE_SESSION_TIMEOUT_MS` environment variable. The default is `1800000` (30 minutes).
- The session expiration check runs on a 60-second interval. If the browser tab is inactive for longer than the timeout, the session will expire on the next check.
- Increase the timeout value if needed for your use case.

---

## Quick Reference

| Task | Command |
|---|---|
| Install dependencies | `npm install` |
| Start development server | `npm run dev` |
| Run tests | `npm run test` |
| Run linter | `npm run lint` |
| Build for production | `npm run build` |
| Preview production build | `npm run preview` |
| Deploy to Vercel (preview) | `vercel` |
| Deploy to Vercel (production) | `vercel --prod` |