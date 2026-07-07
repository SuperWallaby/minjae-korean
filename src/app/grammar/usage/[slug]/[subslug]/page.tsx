import {
  createGuideMetadata,
  createGuidePage,
  createGuideStaticParams,
} from "@/lib/grammarGuidePage";

export const runtime = "nodejs";
export const dynamicParams = true;
export const revalidate = 86400;

export const generateStaticParams = createGuideStaticParams("usage");
export const generateMetadata = createGuideMetadata("usage");
export default createGuidePage("usage");
