import {
  createGuideMetadata,
  createGuidePage,
  createGuideStaticParams,
} from "@/lib/grammarGuidePage";

export const runtime = "nodejs";
export const dynamicParams = true;
export const revalidate = 86400;

export const generateStaticParams = createGuideStaticParams("how-to-say");
export const generateMetadata = createGuideMetadata("how-to-say");
export default createGuidePage("how-to-say");
