import fs from "fs";
import path from "path";

/** Default Kaja news/blog illustration style reference (repo root). */
export function newsIllustrationStyleReferencePath(): string {
  const env = process.env.NEWS_ILLUSTRATION_STYLE_REF?.trim();
  if (env) {
    return path.isAbsolute(env) ? env : path.join(process.cwd(), env);
  }
  return path.join(process.cwd(), "refrefref.png");
}

export function newsIllustrationStyleReferenceExists(): boolean {
  return fs.existsSync(newsIllustrationStyleReferencePath());
}

/** @deprecated use newsIllustrationStyleReferencePath */
export function newsParagraphStyleReferencePath(): string {
  return newsIllustrationStyleReferencePath();
}
