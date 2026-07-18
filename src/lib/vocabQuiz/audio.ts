"use client";

type PlayOptions = {
  playbackRate?: number;
  volume?: number;
};

type SfxThenUrlOptions = {
  sfx?: PlayOptions;
  tail?: PlayOptions;
  /** Start tail this many ms before SFX ends (slight overlap). */
  overlapMs?: number;
};

export class VocabQuizAudio {
  private enabled = true;
  private unlocked = false;
  private active: HTMLAudioElement[] = [];
  private paused = false;
  private pendingSkips: Array<() => void> = [];

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) void this.stopAll();
  }

  isEnabled() {
    return this.enabled;
  }

  isUnlocked() {
    return this.unlocked;
  }

  isPaused() {
    return this.paused;
  }

  /** Call from a user gesture (tap) to satisfy browser autoplay policy. */
  async unlock(): Promise<void> {
    if (this.unlocked) return;
    const probe = new Audio();
    probe.volume = 0.001;
    probe.src =
      "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";
    try {
      await probe.play();
      probe.pause();
      this.unlocked = true;
    } catch {
      this.unlocked = true;
    }
  }

  pauseAll() {
    this.paused = true;
    for (const audio of this.active) {
      audio.pause();
    }
  }

  resumeAll() {
    this.paused = false;
    for (const audio of this.active) {
      void audio.play().catch(() => undefined);
    }
  }

  skipPending() {
    for (const resolve of this.pendingSkips) resolve();
    this.pendingSkips = [];
    void this.stopAll();
  }

  async stopAll() {
    for (const audio of this.active) {
      audio.pause();
      audio.currentTime = 0;
    }
    this.active = [];
    for (const resolve of this.pendingSkips) resolve();
    this.pendingSkips = [];
  }

  prefetch(url: string) {
    if (!url) return;
    const audio = new Audio(url);
    audio.preload = "auto";
  }

  async playSfx(url: string, options?: PlayOptions) {
    await this.playOne(url, options);
  }

  async playUrl(url: string, options?: PlayOptions) {
    await this.playOne(url, options);
  }

  /** Example / modal TTS — user gesture; works while quiz stage is paused. */
  async playSpeechUrl(url: string, options?: PlayOptions) {
    if (!this.enabled || !url?.trim()) {
      throw new Error("Audio is off or URL is empty.");
    }
    await this.unlock();
    await this.stopAll();
    const wasPaused = this.paused;
    this.paused = false;
    try {
      await this.playOneOrThrow(url, options);
    } finally {
      this.paused = wasPaused;
    }
  }

  /**
   * Play SFX, then start `tailUrl` just before SFX ends (overlap).
   * Non-blocking — safe to fire without await.
   */
  playSfxThenUrl(sfxUrl: string, tailUrl: string, options?: SfxThenUrlOptions): void {
    if (!this.enabled || !this.unlocked) return;
    if (!tailUrl?.trim()) {
      void this.playSfx(sfxUrl, options?.sfx);
      return;
    }
    void this.runSfxThenUrl(sfxUrl, tailUrl, options);
  }

  private async runSfxThenUrl(
    sfxUrl: string,
    tailUrl: string,
    options?: SfxThenUrlOptions,
  ): Promise<void> {
    if (!this.enabled || !this.unlocked) return;

    const overlapMs = options?.overlapMs ?? 140;
    const audio = new Audio(sfxUrl);
    audio.volume = options?.sfx?.volume ?? 1;
    audio.playbackRate = options?.sfx?.playbackRate ?? 1;
    this.active.push(audio);

    let tailStarted = false;
    let tailTimer = 0;

    const startTail = () => {
      if (tailStarted) return;
      tailStarted = true;
      void this.playUrl(tailUrl, options?.tail);
    };

    const cancelTail = () => {
      if (tailTimer) window.clearTimeout(tailTimer);
      tailTimer = 0;
    };

    const scheduleTail = () => {
      if (tailStarted) return;
      const durationSec = audio.duration;
      if (!Number.isFinite(durationSec) || durationSec <= 0) {
        startTail();
        return;
      }
      const effectiveMs = (durationSec / audio.playbackRate) * 1000;
      const waitMs = Math.max(0, effectiveMs - overlapMs);
      tailTimer = window.setTimeout(startTail, waitMs);
      this.pendingSkips.push(cancelTail);
    };

    let scheduled = false;
    const planOnce = () => {
      if (scheduled) return;
      scheduled = true;
      scheduleTail();
    };

    audio.addEventListener("loadedmetadata", planOnce, { once: true });
    if (audio.readyState >= 1) planOnce();

    await new Promise<void>((resolve) => {
      const finish = () => {
        audio.removeEventListener("ended", onEnd);
        audio.removeEventListener("error", onErr);
        cancelTail();
        this.active = this.active.filter((a) => a !== audio);
        this.pendingSkips = this.pendingSkips.filter((r) => r !== finish && r !== cancelTail);
        if (!tailStarted) startTail();
        resolve();
      };
      this.pendingSkips.push(finish);
      const onEnd = () => finish();
      const onErr = () => finish();
      audio.addEventListener("ended", onEnd);
      audio.addEventListener("error", onErr);
      void audio.play().catch(() => finish());
    });
  }

  private async playOne(url: string, options?: PlayOptions) {
    if (!this.enabled || !url || !this.unlocked) return;

    const audio = new Audio(url);
    audio.volume = options?.volume ?? 1;
    audio.playbackRate = options?.playbackRate ?? 1;
    this.active.push(audio);

    await new Promise<void>((resolve) => {
      const finish = () => {
        audio.removeEventListener("ended", onEnd);
        audio.removeEventListener("error", onErr);
        this.active = this.active.filter((a) => a !== audio);
        this.pendingSkips = this.pendingSkips.filter((r) => r !== finish);
        resolve();
      };
      this.pendingSkips.push(finish);
      const onEnd = () => finish();
      const onErr = () => finish();
      audio.addEventListener("ended", onEnd);
      audio.addEventListener("error", onErr);
      void audio.play().catch(() => finish());
    });
  }

  private async playOneOrThrow(url: string, options?: PlayOptions) {
    if (!this.enabled) throw new Error("Sound is turned off.");
    if (!url) throw new Error("Audio URL is empty.");
    if (!this.unlocked) await this.unlock();

    const audio = new Audio(url);
    // Do not set crossOrigin — quiz-media CDN may not always send CORS headers,
    // and simple <audio> playback does not need a CORS fetch.
    audio.volume = options?.volume ?? 1;
    audio.playbackRate = options?.playbackRate ?? 1;
    this.active.push(audio);

    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        audio.removeEventListener("ended", onEnd);
        audio.removeEventListener("error", onErr);
        this.active = this.active.filter((a) => a !== audio);
        this.pendingSkips = this.pendingSkips.filter((r) => r !== finish);
      };
      const finish = () => {
        cleanup();
        resolve();
      };
      const fail = (reason: string) => {
        cleanup();
        reject(new Error(reason));
      };
      this.pendingSkips.push(finish);
      const onEnd = () => finish();
      const onErr = () => fail("Could not play example audio.");
      audio.addEventListener("ended", onEnd);
      audio.addEventListener("error", onErr);
      void audio.play().catch(() => fail("Could not play example audio."));
    });
  }

  async delay(ms: number, signal?: AbortSignal) {
    if (ms <= 0) return;
    const step = 40;
    let remaining = ms;
    while (remaining > 0) {
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      while (this.paused) {
        await this.skippableSleep(50);
      }
      const chunk = Math.min(step, remaining);
      await this.skippableSleep(chunk);
      remaining -= chunk;
    }
  }

  private skippableSleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      let timer = 0;
      const finish = () => {
        if (timer) window.clearTimeout(timer);
        this.pendingSkips = this.pendingSkips.filter((r) => r !== finish);
        resolve();
      };
      this.pendingSkips.push(finish);
      timer = window.setTimeout(finish, ms);
    });
  }
}
