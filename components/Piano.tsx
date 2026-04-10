"use client";

import * as React from "react";

type Note = {
  id: string;
  label: string;
  freq: number;
  isBlack: boolean;
  whiteIndex?: number;
};

const WHITE_NOTES: Note[] = [
  { id: "C4", label: "C", freq: 261.63, isBlack: false, whiteIndex: 0 },
  { id: "D4", label: "D", freq: 293.66, isBlack: false, whiteIndex: 1 },
  { id: "E4", label: "E", freq: 329.63, isBlack: false, whiteIndex: 2 },
  { id: "F4", label: "F", freq: 349.23, isBlack: false, whiteIndex: 3 },
  { id: "G4", label: "G", freq: 392.0, isBlack: false, whiteIndex: 4 },
  { id: "A4", label: "A", freq: 440.0, isBlack: false, whiteIndex: 5 },
  { id: "B4", label: "B", freq: 493.88, isBlack: false, whiteIndex: 6 },
  { id: "C5", label: "C", freq: 523.25, isBlack: false, whiteIndex: 7 }
];

// Black keys exist between: C-D, D-E, (skip E-F), F-G, G-A, A-B, (skip B-C)
const BLACK_NOTES: Note[] = [
  { id: "C#4", label: "C#", freq: 277.18, isBlack: true, whiteIndex: 0 },
  { id: "D#4", label: "D#", freq: 311.13, isBlack: true, whiteIndex: 1 },
  { id: "F#4", label: "F#", freq: 369.99, isBlack: true, whiteIndex: 3 },
  { id: "G#4", label: "G#", freq: 415.3, isBlack: true, whiteIndex: 4 },
  { id: "A#4", label: "A#", freq: 466.16, isBlack: true, whiteIndex: 5 }
];

function createSynth(ctx: AudioContext, freq: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.85);
}

export default function Piano() {
  const audioRef = React.useRef<AudioContext | null>(null);
  const activeIdRef = React.useRef<string | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const ensureAudio = React.useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new (window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext)();
    }
    if (audioRef.current.state === "suspended") {
      void audioRef.current.resume();
    }
    return audioRef.current;
  }, []);

  const play = React.useCallback(
    (freq: number, id: string) => {
      const ctx = ensureAudio();
      createSynth(ctx, freq);
      activeIdRef.current = id;
      setActiveId(id);
      window.setTimeout(() => {
        if (activeIdRef.current === id) {
          activeIdRef.current = null;
          setActiveId(null);
        }
      }, 140);
    },
    [ensureAudio]
  );

  const stopVisual = React.useCallback((id: string) => {
    if (activeIdRef.current === id) {
      activeIdRef.current = null;
      setActiveId(null);
    }
  }, []);

  return (
    <div className="piano" aria-label="Interactive piano">
      <div className="piano-white-row">
        {WHITE_NOTES.map((n) => (
          <div
            key={n.id}
            className="piano-white-key"
            role="button"
            tabIndex={0}
            aria-label={`${n.id} key`}
            data-active={activeId === n.id}
            onPointerDown={(e) => {
              (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
              play(n.freq, n.id);
            }}
            onPointerUp={() => stopVisual(n.id)}
            onPointerCancel={() => stopVisual(n.id)}
            onPointerLeave={() => stopVisual(n.id)}
          >
            <span className="piano-key-label">{n.label}</span>
          </div>
        ))}
      </div>

      {/* Black keys overlay */}
      <div className="pointer-events-none absolute inset-0">
        {BLACK_NOTES.map((n) => {
          const leftPct =
            n.whiteIndex === undefined ? 0 : ((n.whiteIndex + 1) / 8) * 100;
          return (
            <div
              key={n.id}
              className="piano-black-key pointer-events-auto"
              role="button"
              tabIndex={0}
              aria-label={`${n.id} key`}
              data-active={activeId === n.id}
              style={{
                left: `${leftPct}%`,
                transform: `translateX(-55%)`
              }}
              onPointerDown={(e) => {
                (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
                play(n.freq, n.id);
              }}
              onPointerUp={() => stopVisual(n.id)}
              onPointerCancel={() => stopVisual(n.id)}
              onPointerLeave={() => stopVisual(n.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

