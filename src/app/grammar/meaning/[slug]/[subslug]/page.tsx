import {
  createGuideMetadata,
  createGuidePage,
  createGuideStaticParams,
} from "@/lib/grammarGuidePage";

export const runtime = "nodejs";
export const dynamicParams = true;
export const revalidate = 86400;

export const generateStaticParams = createGuideStaticParams("meaning");
export const generateMetadata = createGuideMetadata("meaning");
export default createGuidePage("meaning");
