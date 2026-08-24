"use client";

import type { CatalogItem } from "./items";
import {
  PREVIEW_GAPS,
  PREVIEW_METRICS,
  itemControls,
  type PreviewGaps,
  type PreviewKnobs,
  type PreviewMetric,
} from "./knobs";

function ControlHead({ title, value }: { title: string; value?: string }) {
  return (
    <div className="preview-control-head">
      <span>{title}</span>
      {value != null ? <code>{value}</code> : null}
    </div>
  );
}

function PreviewSlider({
  title,
  min,
  max,
  step,
  value,
  suffix,
  onChange,
}: {
  title: string;
  min: number;
  max: number;
  step: number;
  value: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="preview-slider">
      <ControlHead title={title} value={`${value}${suffix ?? ""}`} />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function PreviewSwitch({
  title,
  checked,
  onChange,
}: {
  title: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="preview-switch">
      <span>{title}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

function PreviewEnum({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="preview-enum">
      <ControlHead title={title} value={value || undefined} />
      <div className="variant-switch" role="group" aria-label={title}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={option === value ? "is-active" : ""}
            onClick={() => onChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Customize({
  item,
  knobs,
  dirty,
  onChange,
  onReset,
}: {
  item: CatalogItem;
  knobs: PreviewKnobs;
  dirty: boolean;
  onChange: <K extends keyof PreviewKnobs>(key: K, value: PreviewKnobs[K]) => void;
  onReset: () => void;
}) {
  const controls = itemControls(item.slug);
  if (
    !controls.variant &&
    !controls.metric &&
    !controls.height &&
    !controls.columns &&
    !controls.showRange &&
    !controls.treatments
  ) {
    return null;
  }

  return (
    <section className="customize">
      <div className="customize-head">
        <h2>Customize</h2>
        {dirty ? (
          <button type="button" className="customize-reset" onClick={onReset}>
            Reset
          </button>
        ) : null}
      </div>
      <div className="preview-controls">
        {controls.showRange ? (
          <PreviewSwitch
            title="showRange"
            checked={knobs.showRange}
            onChange={(value) => onChange("showRange", value)}
          />
        ) : null}
        {controls.variant && item.variants.length ? (
          <PreviewEnum
            title="variant"
            options={item.variants}
            value={knobs.variant}
            onChange={(value) => onChange("variant", value)}
          />
        ) : null}
        {controls.metric ? (
          <PreviewEnum
            title="metric"
            options={PREVIEW_METRICS}
            value={knobs.metric}
            onChange={(value) => onChange("metric", value as PreviewMetric)}
          />
        ) : null}
        {controls.height ? (
          <PreviewSlider
            title="height"
            min={72}
            max={360}
            step={8}
            value={knobs.height}
            suffix="px"
            onChange={(value) => onChange("height", value)}
          />
        ) : null}
        {controls.treatments ? (
          <>
            <PreviewSwitch
              title="emphasizeLast"
              checked={knobs.emphasizeLast}
              onChange={(value) => onChange("emphasizeLast", value)}
            />
            <PreviewSwitch
              title="previous"
              checked={knobs.compare}
              onChange={(value) => onChange("compare", value)}
            />
            <PreviewEnum
              title="gaps"
              options={PREVIEW_GAPS}
              value={knobs.gaps}
              onChange={(value) => onChange("gaps", value as PreviewGaps)}
            />
          </>
        ) : null}
        {controls.columns ? (
          <PreviewSlider
            title="columns"
            min={2}
            max={6}
            step={1}
            value={knobs.columns}
            onChange={(value) => onChange("columns", value)}
          />
        ) : null}
      </div>
    </section>
  );
}
