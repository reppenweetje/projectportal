"use client";

import { useEffect, useRef, useState } from "react";

/**
 * XxlTourVideo — de YouTube-rondleiding op de XXL-pagina die pas gaat spelen
 * wanneer de video daadwerkelijk in beeld komt (IntersectionObserver), niet
 * al bij het openen van de pagina.
 *
 * - Start gedempt: browsers blokkeren autoplay-met-geluid zonder klik. De
 *   bezoeker kan zelf ontdempen met de YouTube-controls.
 * - Tot de video in beeld is laden we 'm zonder autoplay; zodra 'ie ≥50%
 *   zichtbaar wordt zetten we autoplay aan (src-swap = betrouwbare gedempte
 *   autoplay). Daarna pauzeren/hervatten we via de YouTube-iframe-API
 *   (postMessage) als de bezoeker weg- en terugscrollt.
 * - enablejsapi=1 is nodig voor die play/pause-commando's; playsinline=1
 *   voorkomt fullscreen-hijack op iOS.
 */

const VIDEO_ID = "IRB3hLXi2l0";
const BASE = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}`;
const COMMON = "enablejsapi=1&mute=1&playsinline=1&rel=0";

export function XxlTourVideo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activated, setActivated] = useState(false);

  const src = activated
    ? `${BASE}?autoplay=1&${COMMON}`
    : `${BASE}?${COMMON}`;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const command = (func: "playVideo" | "pauseVideo") => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func, args: [] }),
        "*",
      );
    };

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (e.isIntersecting) {
          // Eerste keer in beeld: autoplay aanzetten via src-swap. Bij een
          // latere terugkeer in beeld: gewoon hervatten via de API.
          setActivated((was) => {
            if (was) command("playVideo");
            return true;
          });
        } else {
          command("pauseVideo");
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={wrapRef}
      className="mt-8 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
    >
      <iframe
        ref={iframeRef}
        src={src}
        title="Digitale rondleiding XXL-unit — De Hofman"
        className="h-full w-full"
        loading="lazy"
        allow="autoplay; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
