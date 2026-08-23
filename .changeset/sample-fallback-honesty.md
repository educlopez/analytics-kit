---
"@analytics-kit/core": minor
---

Stop `withSampleFallback` from misrepresenting live data, and stop it from
losing capabilities the primary connector has.

A breakdown or series result is now judged empty only when it has no rows or
points at all. Previously a metric value of `0` counted as "no signal", so a
site with genuinely zero visitors had its honest zero replaced by invented
numbers and labelled as sample data. A totals-only query still falls back on
all-zero, because `emptyResult` fills every requested metric with `0` and the
two cases are indistinguishable there — pass your own `isEmpty` if your
connector can tell them apart.

Realtime no longer returns a fabricated `{ visitors: 0 }` when the primary
stream fails and no sample stream exists; it rethrows, so a UI shows an error
instead of presenting an invented count as live.

Adds `unionCapabilities`, and uses it for the wrapper's reported capabilities.
`mergeCapabilities` is override semantics, so a sample connector declaring
`realtime: false` used to cancel a primary that supports it — and the widget
was then rejected before the live source was ever reached.

Note for anyone theming the widgets: `--ak-surface-2` falls back to `--muted`,
which shadcn uses for a surface but plenty of palettes use for muted _text_. If
yours does, map `--ak-*` explicitly — the demo site had to, after the active
range pill rendered at 2:1 contrast. The package's own light-theme block is
`.ak-root[data-ak-theme="light"]`, so an override needs at least that
specificity to win.
