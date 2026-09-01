import { SITE_DESCRIPTION, SITE_HOME_TITLE, SITE_NAME } from "@/lib/siteBrand";
import type { Metadata } from "next";

import { AboutMeHomeSection } from "@/components/site/AboutMeHomeSection";
import { BookHomeSection } from "@/components/site/BookHomeSection";
import { HomeRenewalSections } from "@/components/site/HomeRenewalSections";
import homeStyles from "@/components/site/home-blog.module.css";
import { listBlogPosts } from "@/data/blogPosts";
import { SITE_ORIGIN, siteUrl } from "@/lib/siteUrl";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const title = SITE_HOME_TITLE;
  const description = SITE_DESCRIPTION;
  const url = SITE_ORIGIN;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/brand/og.png"],
    },
  };
}

export default async function Home() {
  let blog: Awaited<ReturnType<typeof listBlogPosts>> = [];
  try {
    blog = await listBlogPosts(3);
  } catch {
    blog = [];
  }

  const organizationId = siteUrl("/#organization");
  const teacherId = siteUrl("/#teacher");
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": siteUrl("/#website"),
      url: SITE_ORIGIN,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": organizationId },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": organizationId,
      url: SITE_ORIGIN,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      logo: siteUrl("/brand/icon.png"),
      founder: { "@id": teacherId },
    },
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": teacherId,
      name: "Minjae",
      jobTitle: "Writer on how to study Korean",
      description: SITE_DESCRIPTION,
      worksFor: { "@id": organizationId },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className={homeStyles.page}>
        <AboutMeHomeSection />
        <HomeRenewalSections blog={blog} />
        <BookHomeSection />
      </div>
    </>
  );
}
