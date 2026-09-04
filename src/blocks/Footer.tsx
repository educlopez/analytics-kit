"use client";

/**
 * Adapted from AlignUI Pro "Footer 01". The upstream block ends with a large
 * wordmark image; this one has no such asset, so the column stops at the
 * social links.
 */

import { RiArrowRightUpLongLine, RiGithubFill, RiNpmjsFill } from "@remixicon/react";
import Link from "next/link";
import * as Button from "@/components/ui/button";
import * as LinkButton from "@/components/ui/link-button";
import { BrandMark } from "@/site/BrandMark";

const socialLinksData = [
  { id: "github", href: "https://github.com/educlopez/wingtics", icon: RiGithubFill },
  { id: "npm", href: "https://www.npmjs.com/org/wingtics", icon: RiNpmjsFill },
];

const footerLinksData = {
  packages: [
    {
      id: "pkg1",
      href: "https://www.npmjs.com/package/@wingtics/react",
      text: "@wingtics/react",
    },
    {
      id: "pkg2",
      href: "https://www.npmjs.com/package/@wingtics/core",
      text: "@wingtics/core",
    },
    {
      id: "pkg3",
      href: "https://www.npmjs.com/package/@wingtics/next",
      text: "@wingtics/next",
    },
    { id: "pkg4", href: "https://www.npmjs.com/org/wingtics", text: "All connectors" },
  ],
  docs: [
    { id: "doc1", href: "/docs#install", text: "Install" },
    { id: "doc2", href: "/docs#connectors", text: "Connectors" },
    { id: "doc3", href: "/docs#query", text: "Query model" },
    { id: "doc4", href: "/docs#registry", text: "shadcn registry" },
  ],
  resources: [
    { id: "res1", href: "/components", text: "Components" },
    { id: "res5", href: "/demo", text: "Demo platform" },
    { id: "res2", href: "/llms.txt", text: "llms.txt" },
    { id: "res6", href: "/openapi.json", text: "OpenAPI spec" },
    { id: "res3", href: "https://github.com/educlopez/wingtics/issues", text: "Issues" },
    {
      id: "res4",
      href: "https://github.com/educlopez/wingtics/blob/main/LICENSE",
      text: "MIT license",
    },
  ],
  // Sitemap and llms.txt listed these, but nothing on the site pointed at them,
  // so a crawler starting at the homepage never reached them — which is how
  // pages that exist still read as missing.
  project: [
    { id: "prj1", href: "/about", text: "About" },
    { id: "prj2", href: "/contact", text: "Contact" },
    { id: "prj3", href: "/privacy", text: "Privacy" },
  ],
};

export function Footer() {
  return (
    <footer className="border-stroke-soft-200 mt-10 w-full border-t lg:mt-20">
      <div className="mx-auto flex w-full max-w-7xl flex-col justify-center px-6 pt-10 pb-10 md:px-7 lg:flex-row lg:gap-20 lg:pt-20">
        <div className="flex w-full flex-1 flex-col lg:w-auto">
          <div className="border-stroke-soft-200 mb-8 flex flex-col gap-6 border-b pb-8 lg:mb-0 lg:gap-8 lg:border-b-0 lg:pb-0">
            <Link href="/" className="flex items-center gap-2.5">
              <BrandMark className="text-primary-base h-7 w-auto" />
              <div className="text-title-h5 text-text-strong-950">Wingtics</div>
            </Link>
            <div className="flex flex-col gap-5">
              <div className="text-label-sm text-text-soft-400">
                MIT — provider-agnostic analytics widgets
              </div>
              <Button.Root
                variant="neutral"
                mode="stroke"
                size="xsmall"
                asChild
                className="rounded-10 shadow-regular-xs w-fit cursor-pointer pl-3.5 focus:bg-transparent"
              >
                <Link href="/docs">
                  Get started
                  <Button.Icon
                    as={RiArrowRightUpLongLine}
                    className="text-text-sub-600/[0.64] group-hover:text-text-strong-950/[0.64] size-5 transition-all duration-300"
                  />
                </Link>
              </Button.Root>
            </div>
            <div className="flex items-center gap-4">
              {socialLinksData.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  className="border-stroke-soft-200 group hover:border-text-strong-950/[0.64] flex size-8 items-center justify-center rounded-full border duration-300"
                >
                  <span className="sr-only">{social.id}</span>
                  <social.icon className="text-text-soft-400 group-hover:text-text-strong-950/[0.64] size-5 transition-all duration-300" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row lg:gap-20">
          <div className="border-stroke-soft-200 mb-8 flex flex-col items-start gap-5 border-b pb-8 lg:mb-0 lg:border-b-0 lg:pb-0">
            <div className="text-label-sm text-text-soft-400">Packages</div>
            {footerLinksData.packages.map((link) => (
              <LinkButton.Root
                key={link.id}
                className="text-text-sub-600 text-label-sm h-auto cursor-pointer whitespace-break-spaces"
                asChild
              >
                <a href={link.href}>{link.text}</a>
              </LinkButton.Root>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-10 gap-y-8 lg:flex lg:gap-20">
            <div className="border-stroke-soft-200 flex min-w-0 flex-col items-start gap-5 lg:w-auto lg:border-r-0 lg:pr-0">
              <div className="text-label-sm text-text-soft-400">Docs</div>
              {footerLinksData.docs.map((link) => (
                <LinkButton.Root
                  key={link.id}
                  className="text-text-sub-600 text-label-sm h-auto cursor-pointer whitespace-break-spaces"
                  asChild
                >
                  <Link href={link.href}>{link.text}</Link>
                </LinkButton.Root>
              ))}
            </div>
            <div className="border-stroke-soft-200 flex min-w-0 flex-col items-start gap-5 lg:w-auto lg:border-r-0 lg:pr-0 lg:pl-0">
              <div className="text-label-sm text-text-soft-400">Resources</div>
              {footerLinksData.resources.map((link) => (
                <LinkButton.Root
                  key={link.id}
                  className="text-text-sub-600 text-label-sm h-auto cursor-pointer whitespace-break-spaces"
                  asChild
                >
                  <a href={link.href}>{link.text}</a>
                </LinkButton.Root>
              ))}
            </div>
            <div className="flex min-w-0 flex-col items-start gap-5 lg:w-auto lg:pl-0">
              <div className="text-label-sm text-text-soft-400">Project</div>
              {footerLinksData.project.map((link) => (
                <LinkButton.Root
                  key={link.id}
                  className="text-text-sub-600 text-label-sm h-auto cursor-pointer whitespace-break-spaces"
                  asChild
                >
                  <Link href={link.href}>{link.text}</Link>
                </LinkButton.Root>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
