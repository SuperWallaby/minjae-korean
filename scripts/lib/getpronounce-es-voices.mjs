/** Spanish SoVITS voice slots (Edge bootstrap → GPU train → free TTS). */

export const CURATED_ES_VOICES = [
  {
    slot: "es-latam-female",
    edgeVoice: "es-MX-DaliaNeural",
    accent: "latam",
    gender: "female",
    locale: "es-MX",
    label: "LatAm female (Mexico)",
  },
  {
    slot: "es-latam-male",
    edgeVoice: "es-MX-JorgeNeural",
    accent: "latam",
    gender: "male",
    locale: "es-MX",
    label: "LatAm male (Mexico)",
  },
  {
    slot: "es-es-female",
    edgeVoice: "es-ES-ElviraNeural",
    accent: "es",
    gender: "female",
    locale: "es-ES",
    label: "Spain female",
  },
  {
    slot: "es-es-male",
    edgeVoice: "es-ES-AlvaroNeural",
    accent: "es",
    gender: "male",
    locale: "es-ES",
    label: "Spain male",
  },
];

/** Short, clean lines for GPT-SoVITS bootstrap (~free via Edge TTS). */
export const ES_SOVITS_BOOTSTRAP_LINES = [
  { text: "Hola.", english: "Hello" },
  { text: "Gracias.", english: "Thank you" },
  { text: "Por favor.", english: "Please" },
  { text: "Sí.", english: "Yes" },
  { text: "No.", english: "No" },
  { text: "Buenos días.", english: "Good morning" },
  { text: "Buenas noches.", english: "Good night" },
  { text: "¿Cómo estás?", english: "How are you?" },
  { text: "Estoy bien.", english: "I'm fine" },
  { text: "Mucho gusto.", english: "Nice to meet you" },
  { text: "Hasta luego.", english: "See you later" },
  { text: "Perdón.", english: "Sorry" },
  { text: "No entiendo.", english: "I don't understand" },
  { text: "¿Cuánto cuesta?", english: "How much is it?" },
  { text: "¿Dónde está?", english: "Where is it?" },
  { text: "Quiero café.", english: "I want coffee" },
  { text: "Un momento, por favor.", english: "One moment, please" },
  { text: "Hablo un poco de español.", english: "I speak a little Spanish" },
  { text: "¿Puedes repetir?", english: "Can you repeat?" },
  { text: "Más despacio, por favor.", english: "More slowly, please" },
];

export function esVoiceBySlot(slot) {
  return CURATED_ES_VOICES.find((v) => v.slot === slot) || null;
}
