import type { ReactNode } from "react";

/**
 * Shared shell for the pages that are prose rather than product: about,
 * contact, privacy. One place for the measure and the heading rhythm, so the
 * three cannot drift apart.
 */
export function ProsePage({
  title,
  lede,
  children,
}: {
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[68ch] px-5 pb-24 md:px-8">
      <header className="pt-10 lg:pt-14">
        <h1 className="text-title-h4 lg:text-title-h3 text-text-strong-950 !font-[550]">{title}</h1>
        <p className="text-paragraph-md lg:text-paragraph-lg text-text-sub-600 mt-3">{lede}</p>
      </header>
      <div className="text-paragraph-sm lg:text-paragraph-md text-text-sub-600 mt-10 grid gap-8 [&_a]:text-primary-base [&_a]:hover:underline [&_code]:font-mono [&_code]:text-[0.9em] [&_h2]:text-title-h6 [&_h2]:lg:text-title-h5 [&_h2]:text-text-strong-950 [&_h2]:!font-[550] [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:grid [&_ul]:gap-1">
        {children}
      </div>
    </div>
  );
}
