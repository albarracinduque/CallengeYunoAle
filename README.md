# AeroSur Checkout Health Monitor

## Overview

AeroSur is a fictional airline facing a silent revenue crisis: payment processor failures during checkout are causing elevated cart abandonment, but without real-time visibility, the engineering team can't tell which processor is degrading, when it started, or how severe the impact is.

This dashboard provides **live, client-side simulated visibility** into payment processor health across AeroSur's four payment methods — Cards (two processors), PIX (Brazil), and OXXO (Mexico). Engineers can instantly identify the worst-performing processor, track its degradation over time, and drill down into individual transactions — all without a backend.

---

## Quick Start

```bash
git clone https://github.com/albarracinduque/CallengeYunoAle.git
cd CallengeYunoAle
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

---

## Features

### Core
- Real-time transaction simulation across 4 payment processors
- Authorization rate, average latency, and transaction volume metrics
- Rolling 5-minute window for all metric calculations
- Automatic metric refresh every 2.5 seconds — no page reload needed
- Trend chart showing auth rate evolution over time for all processors simultaneously
- Threshold reference lines on the chart (degraded / critical)

### Stretch Goals — All Implemented
- **Alert Banner**: Prominent red gradient banner when any processor falls below threshold. Shows count of active alerts and affected processors. Animated pulse effect.
- **Settings Panel**: Toggle from header. Allows configuring critical and degraded percentage thresholds live.
- **Drill-Down Panel**: Click any processor card to open a detailed panel with status breakdown boxes (approved/declined/failed/pending) and a scrollable transaction table (last 50 transactions, most recent first, colored status badges, latency color coding).
- **Export Snapshot**: JSON download from header button with timestamp, elapsed time, total transactions, per-processor metrics, and active alerts.

---

## Architecture & Design Decisions

### Vite + React
Fast dev server with HMR, modern ES module support, and minimal configuration overhead. React's component model maps cleanly onto the card-based dashboard layout.

### Inline CSS Styles
Chosen for rapid prototyping without build complexity. No Tailwind purge config, no CSS module naming collisions — each component owns its styles directly, making visual adjustments fast and predictable.

### Client-Side Simulation
No backend required. The entire data layer runs in-browser via `setInterval`. This keeps the demo self-contained and instantly deployable — ideal for a challenge environment.

### Component Architecture
Each UI piece is isolated in its own file (`ProcessorCard`, `TrendChart`, `DrillDownPanel`, etc.), making the codebase easy to navigate and extend. The simulation logic is fully decoupled from the UI via the `useSimulation` hook.

### Rolling Window Metrics
Metrics are calculated over a 5-minute rolling window using `Date.now()` timestamps. This gives realistic behavior: old transactions age out, and metrics reflect current processor health rather than all-time averages.

### Scripted Degradation
Processor B follows a deterministic degradation timeline rather than pure randomness. This guarantees the demo tells a compelling story every single time — the processor degrades visibly within 60–90 seconds, hits a critical floor, and then recovers.

---

## Simulation Details

### Degradation Timeline — Processor B

| Time Window  | Auth Rate | Avg Latency | Status            |
|-------------|-----------|-------------|-------------------|
| 0:00 – 1:00 | 81%       | 290ms       | Normal            |
| 1:00 – 2:00 | 65%       | 800ms       | Degrading         |
| 2:00 – 3:30 | 42%       | 1,800ms     | **Critical**      |
| 3:30 – 4:30 | 55%       | 1,100ms     | Recovering        |
| 4:30 – 5:30 | 72%       | 500ms       | Almost Recovered  |
| 5:30+       | 81%       | 290ms       | Back to Normal    |

All other processors maintain their base rates with ±3% random noise.

### Transaction Generation
- 1–3 transactions per processor every 2.5 seconds
- Latency jitter: ±40% of base latency
- Status distribution: ~83% approved / ~12% declined / ~3% failed / ~4% pending (PIX/OXXO have higher pending rates ~8%)
- Last 500 transactions per processor kept in memory

---

## How the Operations Team Uses This Dashboard During an Incident

When AeroSur's checkout abandonment rate spikes unexpectedly, the operations team opens this dashboard as their first line of investigation. The workflow is designed for high-stress, time-sensitive scenarios where every second of confusion translates directly into lost revenue.

**First 10 seconds — triage:** The four processor cards are the immediate focal point. Large authorization rate numbers color-coded in green, orange, or red let an operator determine which processor is struggling before reading a single label. If any processor is below threshold, a red alert banner at the top of the screen surfaces the issue proactively — the operator doesn't need to scan every card. In a real incident at 2 AM, this matters.

**Next 60 seconds — scope assessment:** The operator clicks the affected processor card to open the drill-down panel. The status breakdown boxes (Approved / Declined / Failed / Pending) immediately reveal the failure mode: a spike in Failed suggests a connectivity or timeout issue; a spike in Declined suggests a processor-side rule change or fraud filter misconfiguration; a spike in Pending suggests a slow response queue. The live transaction table shows individual latency values — if Processor B is showing 1,800ms per transaction, that confirms a latency crisis, not just a rate anomaly.

**Next 2 minutes — timeline correlation:** The trend chart answers the critical question: *when did this start?* The operator can see whether the degradation began 30 seconds ago (likely a transient blip) or 3 minutes ago (a sustained incident requiring escalation). The elapsed-time X-axis labels make it straightforward to correlate the dashboard timeline with deployment logs or external incident reports.

**Decision point — escalation or watch:** If the trend line shows recovery already beginning, the operator may choose to monitor. If auth rate is still falling, they escalate to the payment processor's support line and consider routing traffic to a backup processor — a capability this prototype intentionally flags as a future addition.

## Trade-offs & What I'd Do With More Time

- **Real transaction stream**: Replace the simulator with a WebSocket connection to a real payment processor event bus
- **Persistent storage**: Store historical data in IndexedDB or a time-series backend so the dashboard survives page refreshes
- **Routing rule controls**: Add a UI to manually shift traffic away from a failing processor (e.g., "Route 50% of Processor B traffic to Processor A")
- **Finer time window controls**: Let operators switch between 1-min, 5-min, 15-min, and 1-hour rolling windows
- **Push notifications / sound alerts**: Notify on-call engineers when a processor crosses a critical threshold, even if the tab is in the background
- **Unit tests**: The `metrics.js` rolling window calculations and `engine.js` degradation logic are prime candidates for deterministic unit tests

---

## Tech Stack

| Tool       | Version | Purpose                          |
|-----------|---------|----------------------------------|
| Vite      | ^5.4    | Build tooling & dev server       |
| React     | ^18.3   | UI component framework           |
| Recharts  | ^2.13   | Line charts for trend data       |
| JavaScript | ES2022 | No TypeScript — plain JS/JSX     |
