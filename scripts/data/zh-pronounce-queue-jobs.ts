/** Starter queue for getpronounce.net (Chinese pronunciation charts). */

export type ZhWordJob = {
  id: string;
  format: "zh_word";
  topicSlug: string;
  slug: string;
  english: string;
  chinese: string;
  pinyin: string;
  scene: string;
  targetColor?: string;
};

export const ZH_PRONOUNCE_QUEUE_JOBS: ZhWordJob[] = [
  {
    id: "zh_word__ni-hao",
    format: "zh_word",
    topicSlug: "greetings",
    slug: "ni-hao",
    english: "Hello",
    chinese: "你好",
    pinyin: "nǐ hǎo",
    scene:
      "Beige doodle CAPYBARA waving one stubby paw, friendly smile, cream backdrop — medium hero chibi",
    targetColor: "#b91c1c",
  },
  {
    id: "zh_word__xie-xie",
    format: "zh_word",
    topicSlug: "greetings",
    slug: "xie-xie",
    english: "Thank you",
    chinese: "谢谢",
    pinyin: "xiè xie",
    scene:
      "Beige doodle CAPYBARA holding a small heart sticker, grateful expression, cream background",
    targetColor: "#c2410c",
  },
  {
    id: "zh_word__xue-xi",
    format: "zh_word",
    topicSlug: "study",
    slug: "xue-xi",
    english: "To study / learn",
    chinese: "学习",
    pinyin: "xué xí",
    scene:
      "Beige doodle CAPYBARA at tiny desk with open book and pencil, focused cute face, cream backdrop",
    targetColor: "#7c3aed",
  },
  {
    id: "zh_word__dui-bu-qi",
    format: "zh_word",
    topicSlug: "greetings",
    slug: "dui-bu-qi",
    english: "Sorry",
    chinese: "对不起",
    pinyin: "duì bu qǐ",
    scene:
      "Beige doodle CAPYBARA with small apologetic bow, soft eyes, cream background",
    targetColor: "#0369a1",
  },
  {
    id: "zh_word__zai-jian",
    format: "zh_word",
    topicSlug: "greetings",
    slug: "zai-jian",
    english: "Goodbye",
    chinese: "再见",
    pinyin: "zài jiàn",
    scene:
      "Beige doodle CAPYBARA walking away with tiny wave, sunset doodle hint, cream backdrop",
    targetColor: "#0f766e",
  },
  {
    id: "zh_word__duo-shao-qian",
    format: "zh_word",
    topicSlug: "travel",
    slug: "duo-shao-qian",
    english: "How much?",
    chinese: "多少钱",
    pinyin: "duō shao qián",
    scene:
      "Beige doodle CAPYBARA holding coin and price tag sticker, curious face, cream background",
    targetColor: "#ca8a04",
  },
  {
    id: "zh_word__ni-hao-ma",
    format: "zh_word",
    topicSlug: "greetings",
    slug: "ni-hao-ma",
    english: "How are you?",
    chinese: "你好吗",
    pinyin: "nǐ hǎo ma",
    scene:
      "Beige doodle CAPYBARA with speech bubble dots, warm smile, cream backdrop",
    targetColor: "#be123c",
  },
  {
    id: "zh_word__wo-ai-ni",
    format: "zh_word",
    topicSlug: "feelings",
    slug: "wo-ai-ni",
    english: "I love you",
    chinese: "我爱你",
    pinyin: "wǒ ài nǐ",
    scene:
      "Beige doodle CAPYBARA hugging a heart pillow, blushing cute face, cream background",
    targetColor: "#db2777",
  },
];
