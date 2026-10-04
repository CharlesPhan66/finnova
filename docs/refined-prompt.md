# Refined prompt: HLBVN point-of-purchase underwriting simulation

Role: senior banking product architect, credit-risk specialist and front-end engineer. Build a working browser prototype for the Business Challenge 2026 HLBVN case. Do not produce a generic AI dashboard and do not change the problem-solution logic below.

## 1. Case facts (label CASE FACT, use only these as facts)
- Financing 1.6M-90.1M VND; tenures 3/6/9/12/18/24 months
- Centralized manual review; 380,000 VND per application; TAT 1.8-4.6 business days
- Mix: salaried with history 35.5%, salaried no history 20.5%, gig/platform 15.0%, online merchants 14.5%, first-time borrowers 14.5%
- Rubric: Diagnosis 20%, Intervention 30%, Solution 35%, Data & Assumptions 10%, Visualization 5%
Everything else is TEAM ASSUMPTION (adjustable input) or SIMULATION (computed output). Never present assumed numbers as HLBVN results. Never invent an official target; proposed TAT is "minutes / near-real-time", adjustable.

## 2. Core story (fixed)
Document-centric manual underwriting -> manual review -> slow, costly, limited visibility on thin-file customers -> poor economics for small-ticket lending. Versus: consented digital data -> identity + fraud + credit + affordability, scored separately -> scorecard + policy rules + human review (AI = shadow challenger) -> Approve / Review / Decline -> faster decision, lower unit cost, better access, controlled risk. The bottleneck is not "approval is slow"; it is that document-centric underwriting cannot use cash-flow and behavioural data that already exists.

## 3. Stack and constraints
React + TypeScript + Vite + Tailwind + Recharts. Client-side only, no backend or external API, no real customer data. Static deploy to GitHub Pages (Vite base `/finnova/`, Actions workflow). Responsive, tooltips on metrics, no placeholder text, no dead buttons. UI in English.

## 4. Screens
1. Baseline vs Proposed hero (current: customer, documents, manual verification, CIC, credit officer, decision, 1.8-4.6 days, 380K; proposed: customer, consent, digital data, identity + fraud, cash-flow + credit + affordability, decision engine, STP/human/decline, near-real-time).
2. Current-process timeline and a live loan-amount input showing 380K as % of principal (380K/2M = 19%), labelled "Illustrative calculation based on case benchmark".
3. Eight scenarios A-H: salaried with history (STP), salaried no history, gig worker, online merchant, first-time borrower (refer or conservative limit, never auto-approve), fraudulent application, strong income but poor affordability, missing/inconsistent data. Animate input -> risk -> decision -> offer -> economics, current vs proposed.
4. Decision engine: inputs (traditional, cash-flow, digital activity, affordability, fraud/identity); outputs (credit risk, fraud risk, affordability, confidence, decision, amount, tenure, human-review flag). Identity, fraud and credit risk stay separate.
5. Explainable logic. Approve if identity verified AND fraud low AND affordability pass AND credit risk low AND confidence >= threshold. Review if credit risk medium OR confidence < threshold. Decline if identity fail OR fraud high OR affordability fail OR credit risk high. Thresholds adjustable, labelled "Illustrative policy thresholds, team assumption". Show positive factors, risk factors and a plain reason; never "AI says no". Missing data: CIC missing but cash-flow strong -> possible; both weak -> refer/decline; identity fails -> stop.
6. Scorecard and AI: scorecard + policy rules + human review (AI = shadow challenger) = decision engine. Rules own hard constraints. Architecture diagram labelled "Proposed architecture"; do not claim HLBVN uses any model.
7. Risk control: identity, application fraud, credit risk, model uncertainty, data quality, responsible lending, model risk.
8. Expected loss EL = PD x LGD x EAD with sliders; widening approval raises approval and EL and shows "Growth without risk discipline". Optimum is set by economics and risk limit, not approval rate.
9. Impact and unit economics, current vs proposed: TAT, cost/application, STP, manual review, approval, abandonment, expected loss, default, disbursement, contribution. Contribution = Revenue - Funding - Processing - Expected credit loss. Sliders for loan amount, revenue, automated cost X, expected loss, approval, conversion, default, funding cost.
10. Monitoring with Green/Amber/Red: approval, STP, manual review, TAT, default, NPL, EL, fraud, false positive/negative, model and data drift, override rate.
11. Data governance: A case-provided/existing, B potentially via partners + consent, C team assumption/future. Never imply HLBVN has all sources or regulatory approval.
12. Judge Q&A (concise): bottleneck, alternative data, why AI, why not rules, fraud control, uncertainty, final owner, how HLBVN earns, incremental value, deployable in 6-12 months.
13. Assumptions drawer, always accessible, listing every CASE FACT / TEAM ASSUMPTION / SIMULATION item with live values.

## 5. Design
Hong Leong Bank inspired: deep blue, white, light blue, small red accent; cards, decision badges, gauges, timelines, simple charts; no neon. Must feel like an internal credit-decisioning tool for an executive committee.

## 6. Demo (3-5 minutes)
Gig worker current vs proposed -> engine -> STP approve -> economics -> risky customer -> decline. Include a built-in step-through demo guide.

## 7. Delivery
Build passes before commit. Then explain: architecture, key assumptions, how to run, 3-minute demo script, what each screen shows, case facts vs assumptions, mapping to the rubric.
