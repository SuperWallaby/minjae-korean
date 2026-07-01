#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public/audio/quiz");
const SAMPLE_RATE = 22050;

function envelope(t, duration, attack = 0.012, decayPower = 1.6) {
  const attackGain = Math.min(1, t / attack);
  const decayGain = Math.pow(Math.max(0, 1 - t / duration), decayPower);
  return attackGain * decayGain;
}

function toneSample(localT, frequency, duration, volume) {
  const env = envelope(localT, duration);
  const fundamental = Math.sin(2 * Math.PI * frequency * localT);
  const shimmer = 0.18 * Math.sin(2 * Math.PI * frequency * 2 * localT);
  return (fundamental + shimmer) * volume * env;
}

function wavFromMix(mixFn, durationSec, sampleRate = SAMPLE_RATE) {
  const sampleCount = Math.floor(sampleRate * durationSec);
  const dataSize = sampleCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleRate;
    const sample = Math.max(-1, Math.min(1, mixFn(t))) * 32767;
    buffer.writeInt16LE(Math.round(sample), 44 + i * 2);
  }

  return buffer;
}

function wavTone(frequency, durationSec, volume = 0.25) {
  return wavFromMix(
    (t) => toneSample(t, frequency, durationSec, volume),
    durationSec,
  );
}

/** Soft countdown beeps — ascending pitch on last beat. */
function wavCountdownStep(step) {
  const freqs = [440, 494, 587];
  const freq = freqs[Math.min(step, freqs.length - 1)] ?? 587;
  const volume = step === 2 ? 0.28 : 0.2;
  return wavTone(freq, 0.22, volume);
}

await mkdir(outDir, { recursive: true });
for (let i = 0; i < 3; i += 1) {
  const path = join(outDir, `countdown-${i + 1}.wav`);
  await writeFile(path, wavCountdownStep(i));
  console.log("wrote", path);
}
