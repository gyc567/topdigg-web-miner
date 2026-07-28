# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/3db4e56a-7544-4dce-a78b-eab8c48c0b81

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3db4e56a-7544-4dce-a78b-eab8c48c0b81) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3db4e56a-7544-4dce-a78b-eab8c48c0b81) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

---

## Deploying to Vercel with prerendered SEO

This project uses a custom puppeteer-based prerender step (`scripts/prerender.mjs`) that produces a fully-rendered HTML page per route in `dist/`. On Vercel, this step is **automatically skipped** because Chromium downloads don't fit Vercel's build-container time/memory budget.

To deploy with prerendered SEO pages, use the prebuilt workflow:

```sh
# 1. Build (vite only) + prerender (locally, via puppeteer + Chromium)
VERCEL=0 npm run build

# 2. Deploy the prebuilt dist/ to Vercel
npx vercel deploy --prebuilt --prod
```

If you only `git push` (no `--prebuilt`), Vercel will run `npm run build` itself and skip prerender. The site will deploy as an SPA fallback (rewrites in `vercel.json`), which is fine for users but loses SEO benefit of static HTML pages.

To enable prerender on Vercel: set `CI_SKIP_PRERENDER=0` in the Vercel build env and remove the `VERCEL` check from `scripts/prerender.mjs`. Then add `@sparticuz/chromium` to the deps and replace `puppeteer.launch` with `@sparticuz/chromium`. See `scripts/prerender.mjs` for inline notes.
