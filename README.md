# POLARIS

A single-user, local-first mobile app that keeps a serious soccer player on a deliberate path to
going pro. It does two jobs:

1. **Performance OS** — turns daily effort, recovery, and fueling into one clear signal
   (train hard / hold back / rest) and manages injury risk with training-load math.
2. **Pathway tracker** — a personal CRM for the hunt: clubs, agents, leagues, trials, offers.

Built with **Expo (React Native) + TypeScript**. No backend, no auth, no accounts — all data lives
on-device (single JSON blob via AsyncStorage).

## Run it

```bash
npm install
npm start          # then scan the QR code with Expo Go on your iPhone/Android
# or
npm run ios        # iOS simulator (macOS)
npm run android    # Android emulator
npm run web        # browser (react-native-web)
```

## Develop / verify

```bash
npm test           # Jest unit tests for the scoring engine (PRD §5)
npm run typecheck  # tsc --noEmit
```

## Architecture

| Path | What |
|---|---|
| `lib/engine.ts` | The core IP — pure, framework-agnostic scoring engine: sRPE session load, weighted readiness (0–100), ACWR injury-risk ratio with a baseline gate, transparent traffic-light recommendation, protein target, fueling streak. The UI imports from here and never recomputes inline. |
| `lib/dates.ts` | Local `YYYY-MM-DD` helpers (deliberately not `toISOString`, which drifts a day in PT). |
| `lib/types.ts` | The persisted data model (PRD §7). |
| `lib/storage.ts` | AsyncStorage load/save of the single `polaris_v1` blob. |
| `lib/seed.ts` | First-run data + seeded career context. |
| `theme/` | Colors, fonts (Barlow / Barlow Condensed), shared styles. |
| `components/` | `Ring` (SVG readiness dial), `BarChart`, `Scale`, `Chip`, `CheckinForm`, `Header`, `BottomNav`. |
| `screens/` | `Today`, `Train`, `Fuel`, `Path`, `Settings`. |
| `App.tsx` | Font loading, safe-area, load-on-launch / save-on-change, tab navigation. |

## Health guardrails

This is a personal tracking tool, **not medical advice**. Readiness and the workload ratio are
sports-science heuristics for managing training load — no app prevents injury on its own. There is
deliberately **no calorie/deficit/restriction tooling**; nutrition is framed as fueling *enough*.
Anything sharp, localized, or persistent → see a sports-medicine professional.
