import type { ComponentType } from "react";
import type { DimensionId, MetricId } from "@analytics-kit/core";

export interface WidgetRequirements {
  metrics?: MetricId[];
  dimensions?: DimensionId[];
  realtime?: boolean;
}

export interface WidgetDefinition<P extends object = Record<string, unknown>> {
  id: string;
  title: string;
  description?: string;
  required: WidgetRequirements;
  component: ComponentType<P>;
}

type RegisteredWidget = WidgetDefinition<Record<string, unknown>>;

const registry = new Map<string, RegisteredWidget>();

export function registerWidget<P extends object>(
  definition: WidgetDefinition<P>,
): WidgetDefinition<P> {
  registry.set(definition.id, definition as RegisteredWidget);
  return definition;
}

export function getWidget(id: string): RegisteredWidget | undefined {
  return registry.get(id);
}

export function listWidgets(): RegisteredWidget[] {
  return [...registry.values()];
}

export function unregisterWidget(id: string): void {
  registry.delete(id);
}

export function clearWidgets(): void {
  registry.clear();
}

/** Register a widget and return its component so it can be used directly. */
export function defineWidget<P extends object>(definition: WidgetDefinition<P>): ComponentType<P> {
  registerWidget(definition);
  return definition.component;
}
