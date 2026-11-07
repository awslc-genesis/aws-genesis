# AWS Learning Club – Genesis

Official website of the AWS Learning Club – Genesis, Tarlac State University.

Planned domain: **aws-genesis.com** (deployed on Vercel).

## Tech stack

- [React](https://react.dev) + JavaScript
- [Vite](https://vite.dev) — dev server and build
- [React Router](https://reactrouter.com) — page routing
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) — components in `src/components/ui`
- [Oxlint](https://oxc.rs) — linting

## Getting started

Requires **Node.js 20.19+** (22 LTS recommended) and **Git**.

```bash
git clone https://github.com/<org-or-user>/aws-genesis.git
cd aws-genesis
npm install
npm run dev
```

Open http://localhost:5173.

| Command           | What it does                     |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start the dev server             |
| `npm run build`   | Build for production into `dist` |
| `npm run preview` | Preview the production build     |
| `npm run lint`    | Lint the code                    |

## Project structure

```
public/                 static files served as-is (favicon, icons)
src/
  assets/               images imported in code (logo)
  components/           shared components
    ui/                 shadcn/ui components
  lib/utils.js          cn() helper for class names
  pages/                one file per page/route
  App.jsx               route definitions
  main.jsx              app entry
  index.css             Tailwind + theme colors
```

- Import from `src` with the `@/` alias: `import { Button } from '@/components/ui/button'`
- Add a page: create `src/pages/About.jsx`, then add `<Route path="/about" element={<About />} />` in `src/App.jsx`
- Add a shadcn component: `npx shadcn@latest add card` (it lands in `src/components/ui`)

## Collaborating with Git

### Branches

- `main` — always deployable. Vercel deploys it to production. **Never push to it directly.**
- Feature branches — one per task, named like `feat/navbar`, `fix/footer-links`, `docs/readme`.

### Daily workflow

```bash
git checkout main
git pull                          # get the latest main
git checkout -b feat/navbar       # new branch for your task

# ...make changes...

git add .
git commit -m "feat: add navbar"
git push -u origin feat/navbar    # first push of the branch
```

Then open a **Pull Request** on GitHub into `main`, ask a teammate to review, and merge once approved. Vercel posts a preview link on every PR so everyone can check the change before it goes live.

After merging, clean up locally:

```bash
git checkout main
git pull
git branch -d feat/navbar
```

### Keeping your branch up to date

If `main` moved while you were working:

```bash
git checkout main
git pull
git checkout feat/navbar
git merge main
```

Fix any conflicts, then `git add .`, `git commit`, `git push`.

### Commit messages

Start with a type: `feat:` new feature · `fix:` bug fix · `style:` visual/CSS only · `refactor:` code cleanup · `docs:` documentation · `chore:` config, dependencies.

### Rules of thumb

- Pull `main` before starting anything.
- Keep PRs small and focused on one thing.
- Run `npm run build` and `npm run lint` before opening a PR.
- Don't commit `node_modules`, `dist`, or `.env` files (already in `.gitignore`).
- Tell the team which part you're working on to avoid editing the same file at the same time.
