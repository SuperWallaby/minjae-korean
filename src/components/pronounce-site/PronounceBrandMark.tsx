/** Speaker mark for GetPronounce — no 音 glyph. */
export function PronounceBrandMark({
  className = "sound-brand-mark pronounce-brand-mark",
}: {
  className?: string;
}) {
  return (
    <span className={className} aria-hidden>
      <svg
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4.5 9.25v5.5h3.1L12.2 18.5V5.5L7.6 9.25H4.5Z"
          fill="currentColor"
        />
        <path
          d="M15.1 9.2a3.2 3.2 0 0 1 0 5.6"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <path
          d="M17.35 7.15a5.6 5.6 0 0 1 0 9.7"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
