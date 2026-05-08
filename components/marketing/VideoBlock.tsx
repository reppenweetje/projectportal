"use client";

import { useRef, useState } from "react";
import type { Project } from "@/lib/types";

export function VideoBlock({ project }: { project: Project }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);

  if (!project.videoSrc) return null;

  const toggleMute = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const togglePlay = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="px-5 py-20 md:py-24 bg-white">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-repp-navy/50 font-semibold">
            In beeld
          </p>
          <h2 className="mt-3 text-3xl md:text-5xl font-extrabold text-repp-navy tracking-tight">
            Zie {project.name} bewegen.
          </h2>
        </div>
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-repp-gray group">
          <video
            ref={ref}
            src={project.videoSrc}
            poster={project.videoPoster ?? project.heroImage.src}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-90 group-hover:opacity-100 transition">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pauzeer" : "Speel"}
              className="w-10 h-10 grid place-items-center rounded-full bg-black/60 backdrop-blur text-white hover:bg-black/80 transition"
            >
              {playing ? "❚❚" : "▶"}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Geluid aan" : "Geluid uit"}
              className="px-3 h-10 rounded-full bg-black/60 backdrop-blur text-white text-xs font-semibold hover:bg-black/80 transition inline-flex items-center gap-1.5"
            >
              {muted ? "🔇 Geluid aan" : "🔈 Geluid uit"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
