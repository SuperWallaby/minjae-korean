import homeStyles from "@/components/site/home-blog.module.css";

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={homeStyles.page}>{children}</div>;
}
