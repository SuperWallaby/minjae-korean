/**
 * Email-safe image sizes: prefer ~2x the CSS display width, progressive JPEG.
 * Gmail / Apple Mail load full assets; huge PNGs stall or get clipped.
 */
export const NEWSLETTER_EMAIL_IMAGE = {
  /** Grammar / photo-trial composed card shown ~520px wide */
  grammarQuiz: {
    maxWidth: 720,
    quality: 72,
  },
  /** Welcome PDF book cover shown ~200px wide */
  bookCover: {
    maxWidth: 420,
    quality: 78,
  },
} as const;
