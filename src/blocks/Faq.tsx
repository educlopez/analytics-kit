"use client";

/** Adapted from AlignUI Pro "FAQ 01". */

import * as Accordion from "@/components/ui/accordion";
import * as Badge from "@/components/ui/badge";

const faqData = [
  {
    id: "faq1",
    question: "Is this tied to Vercel?",
    answer:
      "No. This landing uses the Vercel connector as the example. Plausible, GA4, Umami, and PostHog ship in the same release. The widgets do not change.",
  },
  {
    id: "faq2",
    question: "Where do API tokens live?",
    answer:
      "On the server. Use @analytics-kit/next (or createHttpConnector against your own route). Do not put vendor keys in the browser bundle.",
  },
  {
    id: "faq3",
    question: "What if a provider cannot answer a metric?",
    answer:
      "Connectors declare capabilities. Widgets that need bounceRate on Vercel render an unsupported state instead of failing the page.",
  },
  {
    id: "faq4",
    question: "Can I add my own provider or widget?",
    answer:
      "Yes. defineConnector and defineWidget are the extension points. See examples/ in the repo.",
  },
  {
    id: "faq5",
    question: "How do I change how a chart looks?",
    answer:
      "Pass variant on the chart — gradient, tape, overlay, arc, ping, hero. Colors come from your CSS variables (--chart-1, --primary, --card), so the chart follows the host site.",
  },
];

export function Faq() {
  return (
    <div className="bg-bg-white-0 w-full px-6 py-10 lg:px-0 lg:py-20">
      <div className="mx-auto flex flex-col lg:max-w-[540px]">
        <Badge.Root
          variant="filled"
          className="text-label-sm bg-bg-weak-50 text-text-sub-600 mb-3 h-7 w-fit rounded-[9px] px-2.5 normal-case lg:mx-auto"
        >
          Frequently asked questions
        </Badge.Root>
        <h2 className="text-title-h4 xl:text-title-h3 text-text-strong-950 mb-6 !font-[550] lg:text-center xl:mb-10">
          The usual questions
        </h2>
        <Accordion.Root type="single" collapsible defaultValue="faq1" className="mb-6 space-y-2">
          {faqData.map((faq) => (
            <Accordion.Item
              key={faq.id}
              value={faq.id}
              className="bg-bg-weak-50 cursor-pointer !rounded-xl px-5 py-4 pr-4 ring-0 ring-transparent duration-300 lg:!rounded-2xl"
            >
              <Accordion.Trigger className="text-text-sub-600 text-label-sm lg:text-label-md group-hover/accordion:text-text-strong-950 group-data-[state=open]/accordion:text-text-strong-950 cursor-pointer duration-300">
                {faq.question}
                <Accordion.Arrow className="text-text-soft-400 group-[&[data-state=open]]/accordion:text-text-sub-600 group-hover/accordion:text-text-strong-950 ml-auto size-6 duration-300" />
              </Accordion.Trigger>
              <Accordion.Content className="flex flex-col gap-5 pt-3 lg:pt-4">
                <div className="text-label-sm text-text-sub-600">{faq.answer}</div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
        <div className="text-text-soft-400 text-paragraph-sm lg:text-center">
          Still have questions? Open an issue at{" "}
          <a
            href="https://github.com/educlopez/analytics-kit/issues"
            className="text-label-sm text-text-sub-600 hover:text-text-strong-950 transition-all duration-300"
          >
            educlopez/analytics-kit
          </a>
        </div>
      </div>
    </div>
  );
}
