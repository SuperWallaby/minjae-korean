/** Shared Chinese voice matrix for getpronounce.net (ElevenLabs → SoVITS bootstrap). */

export const CURATED_ZH_VOICES = [
  {
    slot: "cn-female",
    voice_id: "4AfodMgwXps9oZFhHzoj",
    name: "Yun - Prime Mandarin Broadcast Anchor",
    locale: "cmn-CN",
    accent: "beijing mandarin",
    gender: "female",
    region: "cn",
  },
  {
    slot: "cn-male",
    voice_id: "nss5M23ZSzhG3Tn0b7wN",
    name: "Rippel - Mandarin male",
    locale: "cmn-CN",
    accent: "beijing mandarin",
    gender: "male",
    region: "cn",
  },
  {
    slot: "tw-female",
    voice_id: "1AKkSX7KMPHIWuz76m0n",
    name: "Tiffy - Taiwanese Bilingual Narrator",
    locale: "cmn-TW",
    accent: "taiwan mandarin",
    gender: "female",
    region: "tw",
  },
  {
    slot: "tw-male",
    voice_id: "A3T1GnLHdn0WL5w4TMtq",
    name: "Xu Ming",
    locale: "cmn-TW",
    accent: "taiwan mandarin",
    gender: "male",
    region: "tw",
  },
  {
    slot: "hk-female",
    voice_id: "7qtJVw7zgHfL86X7sndX",
    name: "Coco Lau",
    locale: "yue-HK",
    accent: "hong kong cantonese",
    gender: "female",
    region: "hk",
  },
  {
    slot: "hk-male",
    voice_id: "KuIqDaMc7NB5yIasXZ0d",
    name: "Felix Chung",
    locale: "yue-HK",
    accent: "hong kong cantonese",
    gender: "male",
    region: "hk",
  },
];

/** Bootstrap corpus for GPU training (~5–8 min per slot). */
export const ZH_SOVITS_BOOTSTRAP_LINES = [
  { text: "你好。", pinyin: "nǐ hǎo", english: "Hello" },
  { text: "谢谢。", pinyin: "xiè xie", english: "Thank you" },
  { text: "对不起。", pinyin: "duì bu qǐ", english: "Sorry" },
  { text: "没关系。", pinyin: "méi guān xi", english: "No problem" },
  { text: "请。", pinyin: "qǐng", english: "Please" },
  { text: "是的。", pinyin: "shì de", english: "Yes" },
  { text: "不是。", pinyin: "bú shì", english: "No" },
  { text: "学习中文。", pinyin: "xué xí zhōng wén", english: "Study Chinese" },
  { text: "我会说一点中文。", pinyin: "wǒ huì shuō yì diǎn zhōng wén", english: "I speak a little Chinese" },
  { text: "这个怎么说？", pinyin: "zhè ge zěn me shuō", english: "How do you say this?" },
  { text: "请再说一遍。", pinyin: "qǐng zài shuō yí biàn", english: "Please say it again" },
  { text: "慢一点。", pinyin: "màn yì diǎn", english: "A little slower" },
  { text: "今天天气很好。", pinyin: "jīn tiān tiān qì hěn hǎo", english: "The weather is nice today" },
  { text: "我想喝咖啡。", pinyin: "wǒ xiǎng hē kā fēi", english: "I want coffee" },
  { text: "多少钱？", pinyin: "duō shao qián", english: "How much?" },
  { text: "在哪里？", pinyin: "zài nǎ lǐ", english: "Where is it?" },
  { text: "我明白了。", pinyin: "wǒ míng bai le", english: "I understand" },
  { text: "很高兴认识你。", pinyin: "hěn gāo xìng rèn shi nǐ", english: "Nice to meet you" },
  { text: "再见。", pinyin: "zài jiàn", english: "Goodbye" },
  { text: "晚安。", pinyin: "wǎn ān", english: "Good night" },
];

/** Cantonese lines for hk-* slots (same English gloss, yue text). */
export const YUE_SOVITS_BOOTSTRAP_LINES = [
  { text: "你好。", pinyin: "neih hóu", english: "Hello" },
  { text: "多谢。", pinyin: "doh jeh", english: "Thank you" },
  { text: "唔好意思。", pinyin: "m4 hou2 ji3 si1", english: "Sorry" },
  { text: "冇問題。", pinyin: "mou5 man6 tai4", english: "No problem" },
  { text: "係。", pinyin: "hai6", english: "Yes" },
  { text: "唔係。", pinyin: "m4 hai6", english: "No" },
  { text: "我想学广东话。", pinyin: "ngo5 soeng2 hok6 gwong2 dung1 waa2", english: "I want to learn Cantonese" },
  { text: "请再说一次。", pinyin: "cing2 zoi3 syut3 jat1 ci3", english: "Please say it again" },
  { text: "慢啲。", pinyin: "maan6 di1", english: "A little slower" },
  { text: "再见。", pinyin: "joi3 gin3", english: "Goodbye" },
];

export function bootstrapLinesForSlot(slot) {
  if (String(slot || "").startsWith("hk-")) return YUE_SOVITS_BOOTSTRAP_LINES;
  return ZH_SOVITS_BOOTSTRAP_LINES;
}

export function voiceBySlot(slot) {
  return CURATED_ZH_VOICES.find((v) => v.slot === slot) || null;
}
