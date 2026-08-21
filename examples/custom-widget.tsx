import { defineWidget, useQuery, WidgetFrame } from "@analytics-kit/react";

/**
 * Future UI components are just registry entries.
 * Dashboard layouts refer to them by `id`.
 */
export const SignupsCard = defineWidget({
  id: "signups",
  title: "Signups",
  required: { metrics: ["events"] },
  component: function SignupsCard({ span }: { span?: number }) {
    const { data, status, missing, error } = useQuery({
      metrics: ["events"],
      filters: [{ dimension: "eventName", op: "eq", value: "signup" }],
    });

    return (
      <WidgetFrame title="Signups" status={status} missing={missing} error={error} span={span}>
        <div className="ak-metric-value">{data?.totals.events ?? 0}</div>
      </WidgetFrame>
    );
  },
});
