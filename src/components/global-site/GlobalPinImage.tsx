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

  return (
    <picture>
      <source type="image/webp" srcSet={webp} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imagePath}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
    </picture>
  );
}
