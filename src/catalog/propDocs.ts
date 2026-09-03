import type { PropRow } from "../site/PropsTable";

/** Cross-cutting treatments, shared by the time-series charts. */
const SERIES_TREATMENTS: PropRow[] = [
  {
    name: "emphasizeLast",
    type: "boolean",
    default: "false",
    notes:
      "Terminal dot plus a value pill on the final point. Drawn on its own layer, so it composes with any variant.",
  },
  {
    name: "previous",
    type: "ChartDatum[]",
    notes:
      "Previous-period rows, drawn dashed underneath and aligned by index rather than by date. Adds a Previous row to the tooltip.",
  },
  {
    name: "annotations",
    type: "Annotation[]",
    notes:
      '{ at, label, kind? } per marker, where at matches a labelKey value. kind is "deploy" | "release" | "incident" | "note" and only sets the colour.',
  },
  {
    name: "brush",
    type: "boolean",
    default: "false",
    notes: "Drag-to-zoom strip under the chart.",
  },
  {
    name: "scale",
    type: '"linear" | "log" | "symlog"',
    default: '"linear"',
    notes:
      "Y-axis scale. log is pinned to 1 because it cannot represent zero. symlog uses a custom d3 scale and remains defined for negative values and zero.",
  },
  {
    name: "gaps",
    type: '"bridge" | "break"',
    default: '"bridge"',
    notes:
      "How a null is drawn: joined across, or left open. Neither coerces the missing point to zero, which would draw a cliff that reads as a traffic collapse.",
  },
];

const CHART_SHARED: PropRow[] = [
  {
    name: "data",
    type: "ChartDatum[]",
    notes: "Rows to draw. Each object is a point or category.",
  },
  {
    name: "dataKey",
    type: "string",
    default: '"value"',
    notes: "Numeric field on each row.",
  },
  {
    name: "config",
    type: "ChartConfig",
    notes: "Map of dataKey → { label?, color? }. Colors fall back to --chart-1.",
  },
  {
    name: "className",
    type: "string",
    notes: "Chart container. Default height is 220px; spark looks better around 88px.",
  },
];

export const PROP_DOCS: Record<string, PropRow[]> = {
  "breakdown-card": [
    {
      name: "rows",
      type: "BreakdownCardRow[]",
      notes:
        "{ key, label?, value, secondary?, icon? }. secondary feeds the second value column; icon is any node — a flag, a favicon, a provider glyph.",
    },
    {
      name: "title",
      type: "string",
      notes: "Header text. Ignored when tabs is given — the tabs are the header.",
    },
    {
      name: "tabs",
      type: "BreakdownCardTab[]",
      notes: "{ id, label } per dimension, rendered as a tablist. The host owns the state.",
    },
    { name: "activeTab", type: "string", notes: "Selected tab id. Defaults to the first tab." },
    { name: "onTabChange", type: "(id: string) => void", notes: "Fired on tab selection." },
    {
      name: "valueLabel",
      type: "string",
      default: '"Visitors"',
      notes: "Right-aligned heading for the value column.",
    },
    {
      name: "secondaryLabel",
      type: "string",
      notes: "Heading for the second value column. Omit to hide the column entirely.",
    },
    {
      name: "display",
      type: '"value" | "share" | "both"',
      default: '"value"',
      notes:
        "value prints the number, share its percentage, both prints each — a percentage alone is the classic dashboard ambiguity.",
    },
    {
      name: "variant",
      type: '"bars" | "split" | "plain" | "heat"',
      default: '"bars"',
      notes:
        "bars puts the magnitude behind the label. split moves it to its own track underneath. plain drops it. heat tints the whole row instead of measuring it, which survives a narrow column that a bar cannot.",
    },
    {
      name: "fadeLast",
      type: "boolean",
      default: "false",
      notes:
        "Fades the last row — the honest signal that the list is truncated, rather than a hard cut that reads as the end of the data.",
    },
    { name: "onExpand", type: "() => void", notes: "Adds the expand affordance under the rows." },
    {
      name: "expandLabel",
      type: "string",
      default: '"Show all"',
      notes: "Text on the expand control.",
    },
    {
      name: "actions",
      type: "ReactNode",
      notes:
        "Toolbar revealed on hover or keyboard focus, so row actions do not compete with the data while you read it.",
    },
    {
      name: "emptyLabel",
      type: "string",
      default: '"No breakdown data."',
      notes: "Shown when rows is empty.",
    },
    { name: "className", type: "string", notes: "Outer wrapper." },
  ],
  "globe-chart": [
    {
      name: "locations",
      type: "GlobeLocation[]",
      notes:
        "{ code?, label?, value, lat?, lon? }. code is an ISO 3166-1 alpha-2 country code, resolved to that country's centroid — which is what providers return. Pass lat/lon to place anything else. Rows that cannot be placed are dropped from the drawing and counted in the note under it.",
    },
    {
      name: "variant",
      type: '"spin" | "drag" | "focus" | "arcs" | "still"',
      default: '"spin"',
      notes:
        "spin rotates continuously. drag hands rotation to the pointer and the arrow keys. focus swings to each of the busiest locations in turn. arcs draws every location's route into hub. still holds one framing — which is also what the moving variants degrade to under prefers-reduced-motion.",
    },
    {
      name: "dark",
      type: "boolean",
      notes:
        "Defaults to the nearest [data-ak-theme], so an in-dashboard globe follows the dashboard, then to the OS preference.",
    },
    {
      name: "markerColor",
      type: "string",
      default: '"var(--ak-chart-1)"',
      notes:
        "Any CSS colour. Resolved through a probe node, so a var() chain or a token works and not just a hex.",
    },
    {
      name: "size",
      type: "number",
      notes:
        "Square edge in CSS pixels. Omit to fill the container, which is measured with a ResizeObserver so a column change resizes it even when the window does not.",
    },
    { name: "speed", type: "number", default: "1", notes: "Multiplier on the spin rate." },
    {
      name: "hub",
      type: "[number, number]",
      notes: "Arc destination as [lat, lon]. Defaults to the busiest location.",
    },
    {
      name: "focusDwellMs",
      type: "number",
      default: "3200",
      notes: 'How long variant="focus" holds on each location.',
    },
    {
      name: "ariaLabel",
      type: "string",
      notes:
        "Overrides the generated summary. The default names the count and the three busiest locations, since the canvas itself reads as nothing.",
    },
    {
      name: "emptyLabel",
      type: "string",
      default: '"No location data."',
      notes: "Shown for an empty locations array.",
    },
    { name: "className", type: "string", notes: "Outer wrapper." },
  ],
  "metric-tabs": [
    {
      name: "metrics",
      type: "MetricTabItem[]",
      notes:
        "{ id, label, value, delta?, spark?, hint?, trailing? }. value is preformatted so the host keeps units and locale; spark takes raw numbers and is drawn as an inline polyline, no chart library.",
    },
    {
      name: "activeId",
      type: "string",
      notes:
        "Selected metric. Defaults to the first. The host owns it, so the strip composes with any chart.",
    },
    { name: "onChange", type: "(id: string) => void", notes: "Fired on selection." },
    {
      name: "variant",
      type: '"cards" | "strip" | "segmented" | "stacked"',
      default: '"cards"',
      notes:
        "cards is the bordered row. strip drops the boxes for a rule under the active metric. segmented compacts it to a pill group for a toolbar. stacked runs vertically, for a sidebar beside a tall chart.",
    },
    {
      name: "showSpark",
      type: "boolean",
      default: "true",
      notes: "Draws the inline spark where the variant has room for one.",
    },
    { name: "ariaLabel", type: "string", default: '"Metric"', notes: "Names the tablist." },
    { name: "className", type: "string", notes: "Outer wrapper." },
  ],
  "empty-state": [
    { name: "title", type: "string", notes: "What is missing. One line." },
    {
      name: "description",
      type: "string",
      notes: "Why it is empty and what would fill it.",
    },
    {
      name: "icon",
      type: "ReactNode | null",
      notes: "Defaults to a neutral mark so the state reads as deliberate. Pass null to drop it.",
    },
    { name: "action", type: "ReactNode", notes: "The way out — a button, a link, a range reset." },
    {
      name: "variant",
      type: '"panel" | "dashed" | "inline" | "compact"',
      default: '"panel"',
      notes:
        "panel centres it in a bordered card for a whole widget body. dashed does the same with a dashed edge, which reads as a slot waiting to be filled rather than a failure. inline is one left-aligned row for a table body. compact is the smallest form, for a metric tile.",
    },
    { name: "className", type: "string", notes: "Outer wrapper." },
  ],
  "quota-bar": [
    { name: "used", type: "number", notes: "Consumed amount. May exceed the limit." },
    {
      name: "limit",
      type: "number",
      notes:
        "The ceiling. Must be positive; the track scales to whichever of used/limit/projected is largest, so going over stays visible.",
    },
    { name: "label", type: "string", default: '"Usage"', notes: "Heading above the track." },
    {
      name: "projected",
      type: "number",
      notes:
        "Expected usage by the end of the period, drawn as a ghost extension. Ignored when below used.",
    },
    { name: "resetsIn", type: "string", notes: 'Free-text countdown, e.g. "26 days".' },
    {
      name: "variant",
      type: '"bar" | "segments" | "steps" | "compact"',
      default: '"bar"',
      notes:
        "bar is one continuous track. segments meters it into 20 blocks. steps marks the quarters. compact drops the header for use inside a metric card.",
    },
    { name: "className", type: "string", notes: "Outer wrapper." },
  ],
  "marimekko-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "One row per column. Rows totalling zero are dropped.",
    },
    {
      name: "dataKeys",
      type: "string[]",
      notes: "Segment keys, stacked in order within each column.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"label"',
      notes: "Column name, printed on the axis.",
    },
    {
      name: "variant",
      type: '"mosaic" | "labels" | "outline" | "heat"',
      default: '"mosaic"',
      notes:
        "mosaic is solid fills. labels prints each share where it fits. outline keeps only hairlines. heat drops the categorical palette for one hue tinted by each cell's share, comparing cells across columns instead of naming the series.",
    },
    { name: "height", type: "number", default: "260", notes: "Height in px. Width is fluid." },
    { name: "className", type: "string", notes: "Outer wrapper." },
  ],
  "spark-table": [
    {
      name: "data",
      type: "SparkRow[]",
      notes:
        "Rows carry a series alongside the scalars, which ChartDatum cannot express — hence its own row type.",
    },
    { name: "labelKey", type: "string", default: '"label"', notes: "First column." },
    { name: "dataKey", type: "string", default: '"value"', notes: "Numeric column." },
    {
      name: "trendKey",
      type: "string",
      default: '"trend"',
      notes: "Field holding the row's series. Rows without one omit the spark.",
    },
    {
      name: "deltaKey",
      type: "string",
      default: '"delta"',
      notes: "Signed change, coloured by sign.",
    },
    { name: "label", type: "string", default: '"Name"', notes: "Header for the first column." },
    {
      name: "variant",
      type: '"sparkline" | "bars" | "area" | "plain"',
      default: '"sparkline"',
      notes:
        "How the trend column draws: a stroke, one bar per point, or a filled stroke. plain drops the column for a dense provider-style list.",
    },
    { name: "className", type: "string", notes: "Outer wrapper." },
  ],
  "timeline-chart": [
    {
      name: "items",
      type: "Annotation[]",
      notes:
        "{ at, label, kind? } — the same shape the annotations layer takes, so a release history can sit under a dashboard without restating it.",
    },
    {
      name: "variant",
      type: '"rail" | "alternating" | "stacked" | "dots"',
      default: '"alternating"',
      notes:
        "alternating pins above and below. rail keeps one side. dots drops labels to markers. stacked abandons the time axis for one row per item, the only form that survives items clustered on one day.",
    },
    {
      name: "height",
      type: "number",
      default: "150",
      notes: "Rail height in px. Ignored by stacked.",
    },
    { name: "className", type: "string", notes: "Outer wrapper." },
  ],
  "strip-chart": [
    {
      name: "lanes",
      type: "StripLane[]",
      notes:
        "{ label, at[] } per lane. Timestamps are anything Date can parse; unparseable ones are dropped.",
    },
    {
      name: "variant",
      type: '"ticks" | "barcode" | "dots" | "density"',
      default: '"ticks"',
      notes:
        "ticks is one mark per event. barcode runs them full height. dots lets overlap build as opacity. density buckets the lane into 48 slots, the only form that survives thousands of events.",
    },
    { name: "laneHeight", type: "number", default: "26", notes: "Track height per lane, in px." },
    { name: "className", type: "string", notes: "Outer wrapper." },
  ],
  "radial-time-chart": [
    {
      name: "data",
      type: "RadialTimeCell[]",
      notes:
        "{ hour: 0–23, day: 0=Monday, value }. Hour-of-day is cyclical, so 23:00 and 00:00 are neighbours here rather than opposite edges.",
    },
    {
      name: "variant",
      type: '"rings" | "dots" | "bands"',
      default: '"rings"',
      notes:
        "rings fills each cell by opacity. dots moves the value into the dot radius, which survives print. bands closes the cell gaps so each weekday reads as one continuous ring.",
    },
    { name: "size", type: "number", default: "260", notes: "Diameter in px; the chart is square." },
    { name: "className", type: "string", notes: "Outer wrapper." },
  ],
  "treemap-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Category rows. Sorted by value and squarified, so tile order is derived, not given.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Numeric field that sets tile area. Rows at or below zero are dropped.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"label"',
      notes: "Tile name. Hidden on tiles too small to read it.",
    },
    {
      name: "deltaKey",
      type: "string",
      default: '"delta"',
      notes: "Signed change per row. Only read by the diverging variant.",
    },
    {
      name: "variant",
      type: '"heat" | "diverging"',
      default: '"heat"',
      notes:
        "heat tints by share of the largest tile. diverging colours by the sign of delta and tints by its size.",
    },
    {
      name: "height",
      type: "number",
      default: "260",
      notes: "Height in px. Width is fluid.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
  ],
  "cohort-grid": [
    {
      name: "data",
      type: "CohortRow[]",
      notes:
        "{ label, size, values[] } per cohort. Rows may be ragged — a young cohort has fewer periods, and padding it out would invent data.",
    },
    {
      name: "variant",
      type: '"triangle" | "counts"',
      default: '"triangle"',
      notes: "Cells show retained share, or the raw retained count.",
    },
    {
      name: "periodLabel",
      type: "string",
      default: '"Period"',
      notes: 'Column header prefix. "Week" gives Week 0, Week 1, and so on.',
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper. The table scrolls horizontally inside it.",
    },
  ],
  "horizon-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Shared time rows. Every lane reads its own key off the same rows.",
    },
    {
      name: "dataKeys",
      type: "string[]",
      notes: "One lane per key, in order. This is the point of the chart — pass many.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"date"',
      notes: "Field used for the first and last axis labels.",
    },
    {
      name: "variant",
      type: '"bands" | "mirror"',
      default: '"bands"',
      notes: "mirror folds negative values back up, so a drop reads as depth rather than as zero.",
    },
    {
      name: "bands",
      type: "number",
      default: "3",
      notes: "How many times each lane's range is folded. More bands, more resolution per pixel.",
    },
    {
      name: "laneHeight",
      type: "number",
      default: "26",
      notes: "Height of one lane in px. The whole chart is this times the number of keys.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
  ],
  "area-chart": [
    ...CHART_SHARED,
    {
      name: "labelKey",
      type: "string",
      default: '"date"',
      notes: "X-axis field. Usually an ISO date.",
    },
    {
      name: "variant",
      type: '"gradient" | "linear" | "natural" | "step" | "dots" | "spark" | "dither" | "glow" | "hatched" | "bars" | "solid" | "stacked" | "stream" | "band" | "ridge" | "riso" | "screentone" | "grain"',
      default: '"gradient"',
      notes:
        "How the fill and curve are drawn. hatched and bars are SVG textures. Not a color theme.",
    },
    {
      name: "dataKeys",
      type: "string[]",
      default: "[dataKey]",
      notes:
        "Series to compose. Pass two or more for the stacked and stream variants; ignored by the others.",
    },
    ...SERIES_TREATMENTS,
  ],
  "line-chart": [
    ...CHART_SHARED,
    {
      name: "labelKey",
      type: "string",
      default: '"date"',
      notes: "X-axis field. Usually an ISO date.",
    },
    {
      name: "variant",
      type: '"monotone" | "linear" | "step" | "dashed" | "dots" | "dither" | "glow" | "ping" | "rainbow" | "values" | "focus" | "anomaly" | "riso" | "forecast" | "dual"',
      default: '"monotone"',
      notes:
        "Stroke interpolation and decoration. ping pulses the last point; rainbow strokes --chart-1…5; values labels dots. forecast extends a dotted trend past the last measured point over a tinted span. dual gives each of two keys its own y-axis, tinted to its series.",
    },
    {
      name: "dataKeys",
      type: "string[]",
      default: "[dataKey]",
      notes:
        'Series to draw. Pass several for variant="focus", and exactly two for variant="dual" (first key left axis, second right); ignored by the other variants.',
    },
    {
      name: "forecastPeriods",
      type: "number",
      default: "7",
      notes:
        'How many periods variant="forecast" projects past the last real point. Labels continue the series\' own cadence when they parse as dates, and fall back to +1…+n when they do not.',
    },
    {
      name: "forecastWindow",
      type: "number",
      default: "14",
      notes:
        "How much of the tail the least-squares trend is fitted to. Client-side, no model and no service — a straight line is the weakest claim still worth drawing, and looking like one is why it reads as a projection.",
    },
    {
      name: "anomalyThreshold",
      type: "number",
      default: "3.5",
      notes:
        'How far from the rolling median a point must sit to be ringed by variant="anomaly", in MAD-derived standard deviations. Strict by default: ringing every wobble trains people to ignore the rings.',
    },
    ...SERIES_TREATMENTS,
  ],
  "bar-chart": [
    ...CHART_SHARED,
    {
      name: "labelKey",
      type: "string",
      default: '"label"',
      notes: "Category field on each row.",
    },
    {
      name: "variant",
      type: '"vertical" | "horizontal" | "rounded" | "hatched" | "dither" | "glow" | "gradient" | "duotone" | "grouped" | "stacked" | "stacked-100" | "diverging" | "editorial" | "bullet"',
      default: '"vertical"',
      notes:
        "Orientation and bar fill. horizontal flips the axes. duotone is a hard two-band fill.",
    },
    {
      name: "dataKeys",
      type: "string[]",
      default: "[dataKey]",
      notes:
        "Series to compare. Pass two or more for grouped, stacked and stacked-100 to have anything to compare. stacked-100 rebases the drawing to share; the tooltip still reports real counts.",
    },
  ],
  "pie-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Category rows. One slice per row.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Numeric field used for slice size.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"label"',
      notes: "Slice name. Also used for the legend.",
    },
    {
      name: "variant",
      type: '"donut" | "pie" | "legend" | "dither" | "rounded" | "radial" | "glow" | "half" | "callout"',
      default: '"donut"',
      notes: "Ring vs full pie, rounded gaps, radial bars, or a bloom on the slices.",
    },
    {
      name: "className",
      type: "string",
      notes: "Chart container. Default height is 220px.",
    },
  ],
  "funnel-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Stages in order. The first value is 100%.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Numeric field on each stage.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"label"',
      notes: "Stage name.",
    },
    {
      name: "variant",
      type: '"tape" | "steps" | "vertical" | "flow"',
      default: '"tape"',
      notes: "Tapering ribbon, discrete blocks, or stacked drop-off bars.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
  ],
  "radar-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "One row per axis.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Numeric field plotted on each axis.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"label"',
      notes: "Axis name.",
    },
    {
      name: "variant",
      type: '"stroke" | "fill" | "glow" | "dither" | "polygon"',
      default: '"fill"',
      notes: "Outline only, translucent fill, bloom, or a stipple fill.",
    },
    {
      name: "config",
      type: "ChartConfig",
      notes: "Map of dataKey → { label?, color? }.",
    },
    {
      name: "className",
      type: "string",
      notes: "Chart container. Default height is 220px.",
    },
  ],
  "composed-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Shared category rows. Needs both barKey and lineKey.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"date"',
      notes: "X-axis field.",
    },
    {
      name: "barKey",
      type: "string",
      default: '"bar"',
      notes: "Numeric field for the bars (or the dashed overlay line).",
    },
    {
      name: "lineKey",
      type: "string",
      default: '"line"',
      notes: "Numeric field for the line or highlight area.",
    },
    {
      name: "variant",
      type: '"combo" | "highlight" | "overlay"',
      default: '"combo"',
      notes: "Bars + line, muted bars + glow, or dashed line over a glowing area.",
    },
    {
      name: "config",
      type: "ChartConfig",
      notes: "Colors and labels for barKey and lineKey.",
    },
    {
      name: "className",
      type: "string",
      notes: "Chart container. Default height is 220px.",
    },
  ],
  "scatter-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Points with numeric x and y. Optional z for bubble size.",
    },
    {
      name: "xKey",
      type: "string",
      default: '"x"',
      notes: "Horizontal numeric field.",
    },
    {
      name: "yKey",
      type: "string",
      default: '"y"',
      notes: "Vertical numeric field.",
    },
    {
      name: "zKey",
      type: "string",
      default: '"z"',
      notes: "Used only by the bubble variant.",
    },
    {
      name: "variant",
      type: '"dots" | "bubble" | "glow" | "field"',
      default: '"dots"',
      notes: "Equal dots, sized bubbles, or a bloom on each point.",
    },
    {
      name: "config",
      type: "ChartConfig",
      notes: "Color and label for yKey.",
    },
    {
      name: "className",
      type: "string",
      notes: "Chart container. Default height is 220px.",
    },
  ],
  "sankey-chart": [
    {
      name: "nodes",
      type: "SankeyNode[]",
      notes: "{ name }[]. Ignored when data is passed.",
    },
    {
      name: "links",
      type: "SankeyLink[]",
      notes: "{ source, target, value }[] using node indexes.",
    },
    {
      name: "data",
      type: "{ nodes, links }",
      notes: "Alternate payload. Wins over nodes and links.",
    },
    {
      name: "variant",
      type: '"flow" | "gradient" | "dither"',
      default: '"flow"',
      notes: "Link curvature and opacity. The drawing, not a palette.",
    },
    {
      name: "className",
      type: "string",
      notes: "Chart container. Default height is 220px.",
    },
  ],
  "candlestick-chart": [
    {
      name: "data",
      type: "CandleDatum[]",
      notes:
        "{ date, open, high, low, close, volume? }[] in order. volume drives the volume pane; legacy rows without it fall back to candle range.",
    },
    {
      name: "variant",
      type: '"ohlc" | "hollow" | "wick" | "volume"',
      default: '"ohlc"',
      notes: "Solid bodies, hollow up-days, a thin wick, or OHLC with a volume pane.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
  ],
  "choropleth-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Regions. Pass code for a two-letter tile label.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Numeric field used for intensity.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"label"',
      notes: "Region name. code falls back to the first two letters.",
    },
    {
      name: "variant",
      type: '"tiles" | "heat" | "dither"',
      default: '"tiles"',
      notes: "Labeled tiles, a tighter heat field, or a wash. Not a geoJSON map.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
  ],
  "live-line-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Full series. The chart windows the last N points and steps forward.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Numeric field.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"date"',
      notes: "X-axis field.",
    },
    {
      name: "windowSize",
      type: "number",
      default: "14",
      notes: "How many points stay on screen.",
    },
    {
      name: "intervalMs",
      type: "number",
      default: "700",
      notes: "Advance interval. No-op when data.length ≤ windowSize.",
    },
    {
      name: "variant",
      type: '"stream" | "glow" | "dashed"',
      default: '"stream"',
      notes: "Ping on the last point, a bloom, or a dashed pulse.",
    },
    {
      name: "className",
      type: "string",
      notes: "Chart container. Default height is 220px.",
    },
  ],
  "ring-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Up to five categories. One ring each when nested.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Numeric field.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"label"',
      notes: "Legend name.",
    },
    {
      name: "variant",
      type: '"stack" | "nested" | "track"',
      default: '"stack"',
      notes: "Shared ring, concentric rings, or a thick track.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
  ],
  "heatmap-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "One cell per row. Dates read well as a week grid.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Numeric field used for intensity.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"date"',
      notes: "Cell title.",
    },
    {
      name: "variant",
      type: '"calendar" | "matrix" | "dither" | "month"',
      default: '"calendar"',
      notes: "Seven-column week, a 10-column matrix, or a wash.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
  ],
  "sunburst-chart": [
    {
      name: "data",
      type: "SunburstNode[]",
      notes: "{ label, value, children? }[]. Two rings: parents then children.",
    },
    {
      name: "variant",
      type: '"nest" | "burst"',
      default: '"nest"',
      notes: "Tight rings or a more open burst.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
  ],
  "profit-loss-chart": [
    {
      name: "data",
      type: "ChartDatum[]",
      notes: "Signed values. Positive is up, negative is down.",
    },
    {
      name: "dataKey",
      type: "string",
      default: '"value"',
      notes: "Signed numeric field.",
    },
    {
      name: "labelKey",
      type: "string",
      default: '"date"',
      notes: "X-axis field.",
    },
    {
      name: "variant",
      type: '"fill" | "stroke" | "bars"',
      default: '"fill"',
      notes: "Split area, a single stroke, or opposing bars.",
    },
    {
      name: "config",
      type: "ChartConfig",
      notes: "Colors for up and down. Defaults to --ak-up / --ak-down.",
    },
    {
      name: "className",
      type: "string",
      notes: "Chart container. Default height is 220px.",
    },
  ],
  "gauge-chart": [
    {
      name: "value",
      type: "number",
      notes: "Current reading.",
    },
    {
      name: "max",
      type: "number",
      default: "100",
      notes: "Full-scale value. 100 prints as a percent.",
    },
    {
      name: "label",
      type: "string",
      notes: "Caption under the number.",
    },
    {
      name: "variant",
      type: '"arc" | "ring" | "tick" | "score"',
      default: '"arc"',
      notes: "Semicircle, full ring, or tick marks with a needle.",
    },
    {
      name: "className",
      type: "string",
      notes: "Outer wrapper.",
    },
    {
      name: "bands",
      type: "{ label, color }[]",
      default: "Low / Medium / High",
      notes:
        "Qualitative bands for the score variant, low to high. The arc is split into these and the value's band is named under it.",
    },
  ],
  "metric-card": [
    {
      name: "metric",
      type: "MetricId",
      notes: "Canonical metric queried through the provider.",
    },
    {
      name: "title",
      type: "string",
      notes: "Header label. Defaults to the metric catalog name.",
    },
    {
      name: "variant",
      type: '"default" | "spark" | "compact" | "hero" | "bleed" | "histogram"',
      default: '"default"',
      notes: "Size and whether a sparkline trails the number.",
    },
    {
      name: "range",
      type: "DateRangeInput",
      notes: "Overrides the provider range for this card only.",
    },
    {
      name: "span",
      type: "number",
      notes: "Dashboard grid column span.",
    },
  ],
  "ranked-list": [
    {
      name: "rows",
      type: "BreakdownRow[]",
      notes: "Dimension rows from a query. Each row has key, label, values.",
    },
    {
      name: "metric",
      type: "string",
      notes: "Which values[metric] to rank and format.",
    },
    {
      name: "variant",
      type: '"bar" | "compact" | "table" | "inset" | "dual"',
      default: '"bar"',
      notes: "Bars, a tight list, or a share table.",
    },
  ],
  dashboard: [
    {
      name: "widgets",
      type: "DashboardItem[]",
      default: "defaultDashboard",
      notes: "{ widget, span?, props? }[]. Use catalogDashboard to preview every built-in.",
    },
    {
      name: "columns",
      type: "number",
      default: "4",
      notes: "CSS grid column count.",
    },
    {
      name: "showRange",
      type: "boolean",
      default: "true",
      notes: "Toolbar with 24h / 7d / 30d / 90d / 12mo presets.",
    },
  ],
};
