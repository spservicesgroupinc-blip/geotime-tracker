# UI Overhaul Design — 2026-03-11

## Context
GeoTime Tracker is a time tracking PWA for field workers / hourly employees. Core functions: clock in/out with GPS, project management, earnings tracking, pay report PDF.

## Problems Addressed
- Clock in/out button was buried and lacked prominence
- Project selector was a bare dropdown with no inline add capability
- Colors were flat and unappealing (navy + dull gold)
- No live elapsed timer when clocked in
- No earnings summary
- No delete entry capability
- Layout was not well-structured

## Design Direction
**Dark luxury/industrial** — warm near-monochrome palette, no greens or bright colors.

### Color Palette
- Backgrounds: `void-*` scale (#050505 → #555555)
- Accent: `gold-*` (#c9a03a warm amber)
- Danger/Clock-out: `crimson-*` (#b84f4f muted red)
- Text: `cream-*` (#e8e4d8 warm white)

### Typography
- `Bebas Neue` — display headers, clock button labels
- `Outfit` — all body/UI text
- `JetBrains Mono` — time values, earnings, elapsed counter

## Layout
```
[Header: Logo | Profile name · Switch Profile]
──────────────────────────────────────────────
[Left Panel 320px]  |  [Time Log (flex-1)]
  Clock status/time |    Sticky day headers
  Elapsed timer     |    Entry cards w/ delete
  Project pills     |    Day totals
  + Add pill        |
  CLOCK IN/OUT btn  |
  ─────────────────  |
  Earnings summary  |
  Pay Report btn    |
```

## Key Features Added
1. **Live clock display** — current time when idle
2. **Live elapsed timer** — HH:MM:SS counting up when clocked in
3. **Project pills** — chips with inline "× delete" on hover, "+ Add" expands to input
4. **Earnings summary** — today hours/pay + all-time totals
5. **Delete entries** — two-click confirmation (click once, "Confirm?" appears for 3s)
6. **Date-grouped time log** — sticky day headers with day totals
7. **2-step onboarding** — cleaner ProfileSetup with progress bar

## Animations
- `.clock-out-pulse` — crimson ripple ring on Clock Out button
- `.clock-in-pulse` — gold ripple ring on Clock In button
- `.elapsed-tick` — subtle opacity flicker on running timer
- `.fade-up` — entry appear animation with staggered delay

## Files Modified
- `index.html` — new fonts, new tailwind config colors
- `index.css` — complete rewrite with CSS vars + animations
- `App.tsx` — complete overhaul
- `components/TimeLog.tsx` — complete overhaul (new `onDeleteEntry` prop)
- `components/ProfileSetup.tsx` — complete overhaul (2-step flow)
