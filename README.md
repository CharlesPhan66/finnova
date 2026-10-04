# Point-of-Purchase Underwriting Simulation

By Team Finnova.

Interactive, fully client-side simulation for the Business Challenge 2026 (HLBVN case): document-centric manual underwriting versus real-time, data-driven underwriting (illustrative scorecard + policy rules + human review, with AI as a shadow challenger).

All customers and outputs are simulated locally. Numbers are labelled CASE FACT, TEAM ASSUMPTION or SIMULATION. Nothing here is an HLBVN result, target or policy.

## Run

```
npm install
npm run dev      # http://localhost:5173/finnova/
npm run build    # type-check + production build into dist/
npm run preview
```

Stack: React, TypeScript, Vite, Tailwind CSS, Recharts. `vite.config.ts` sets `base: '/finnova/'` for GitHub Pages.

## Deploy

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on push to `main`. In the repository: Settings > Pages > Source = GitHub Actions.

## Layout

- `src/lib/data.ts` case facts, scenarios, default assumptions
- `src/lib/engine.ts` identity / fraud / credit / affordability / confidence and the STP-Refer-Decline policy
- `src/lib/econ.ts` per-application economics
- `src/screens/` the 12 screens; the assumptions register is the drawer in the header
- `docs/refined-prompt.md` the refined build prompt
