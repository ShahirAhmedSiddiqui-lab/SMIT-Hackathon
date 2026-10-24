# Nexora

Nexora is a Next.js + Express + TypeScript + MongoDB human capital workspace.

## Setup

Install dependencies:

```bash
npm install
```

Copy `.env.example` to `.env`, replace `JWT_SECRET` with a long random value, and set `MONGODB_URI` to your dedicated HCM database. Keep the database name in `MONGODB_DB_NAME` separate from MongoDB sample databases.

Run the frontend and API together:

```bash
npm run dev:all
```

Or run them separately with `npm run dev` and `npm run dev:server`.

The frontend runs at `http://localhost:3000`; the API runs at `http://localhost:5000`. Confirm the API is running by opening `http://localhost:5000/api/health` before creating the workspace. If the browser says “Cannot reach the API server”, restart with `npm run dev:all`.

If the API exits with a MongoDB Atlas timeout, the application cannot reach the database from the current network. Confirm Atlas Network Access includes your current IP, disable a blocking VPN/firewall, or try another network. Do not paste the URI into chat or source control.

The first working slice includes first-run setup, JWT login/password change, organization settings, HR access creation, employee registration, and a role-scoped employee directory. Continue from `docs/PLAN.md` for the remaining HCM modules.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
