import { getSingletonHighlighter, type BundledLanguage } from "shiki/bundle/web";

export const CODE_LANGS = ["tsx", "ts", "bash", "css", "json"] as const;
export type CodeLang = (typeof CODE_LANGS)[number];

const LANG: Record<CodeLang, BundledLanguage> = {
  tsx: "tsx",
  ts: "typescript",
  bash: "bash",
  css: "css",
  json: "json",
};

export async function highlight(code: string, lang: CodeLang): Promise<string> {
  const highlighter = await getSingletonHighlighter({
    themes: ["vitesse-dark"],
    langs: ["tsx", "typescript", "bash", "css", "json"],
  });
  return highlighter.codeToHtml(code, {
    lang: LANG[lang],
    theme: "vitesse-dark",
  });
}
