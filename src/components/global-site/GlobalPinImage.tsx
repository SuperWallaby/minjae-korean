import {
  globalPinCardImagePath,
  globalPinPageImagePath,
} from "@/lib/globalSite/catalog";

type Props = {
  imagePath: string;
  alt: string;
  variant: "card" | "page";
  priority?: boolean;
  width: number;
  height: number;
};

export function GlobalPinImage({
  imagePath,
  alt,
  variant,
  priority = false,
  width,
  height,
}: Props) {
  const webp =
    variant === "card"
      ? globalPinCardImagePath(imagePath)
      : globalPinPageImagePath(imagePath);
  // Local PNG remains a rare fallback if CDN miss; prefer CDN webp as src too.
  const src = webp;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
