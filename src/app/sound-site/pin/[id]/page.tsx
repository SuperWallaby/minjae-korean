import { notFound, permanentRedirect } from "next/navigation";
import { getSoundPin, soundPinPath } from "@/lib/soundSite/catalog";
import { pinStaticParamsOrEmpty } from "@/lib/buildScope";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = true;

export async function generateStaticParams() {
  return pinStaticParamsOrEmpty([] as { id: string }[]);
}

/** Legacy /pin/{id} → canonical /sound-of/{slug} */
export default async function SoundPinIdRedirect({ params }: Props) {
  const { id } = await params;
  const pin = await getSoundPin(id);
  if (!pin) notFound();
  permanentRedirect(soundPinPath(pin));
}
