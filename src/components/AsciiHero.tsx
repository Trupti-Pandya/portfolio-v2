"use client";

import { useEffect, useRef, useState } from "react";

const ASCII_CHARS = "@%#*+=-:. ";

function getBrightness(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function imageToAscii(
  img: HTMLImageElement,
  cols: number,
  rows: number
): string {
  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, cols, rows);
  const data = ctx.getImageData(0, 0, cols, rows).data;

  let result = "";
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const brightness = getBrightness(data[i], data[i + 1], data[i + 2]);
      const charIndex = Math.floor(
        (brightness / 255) * (ASCII_CHARS.length - 1)
      );
      result += ASCII_CHARS[charIndex];
    }
    result += "\n";
  }
  return result;
}

const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#@$%&";

function useGlitchTypewriter(text: string, startDelay = 400) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let index = 0;

    const type = () => {
      if (index < text.length) {
        let glitchCount = 0;
        const maxGlitch = 4;

        const glitch = () => {
          if (glitchCount < maxGlitch) {
            const fake =
              GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
            setDisplayed(text.slice(0, index) + fake);
            glitchCount++;
            timeout = setTimeout(glitch, 40);
          } else {
            index++;
            setDisplayed(text.slice(0, index));
            timeout = setTimeout(type, 80 + Math.random() * 60);
          }
        };

        timeout = setTimeout(glitch, 0);
      } else {
        setDone(true);
      }
    };

    timeout = setTimeout(type, startDelay);
    return () => clearTimeout(timeout);
  }, [text, startDelay]);

  return { displayed, done };
}

export default function AsciiHero() {
  const [asciiArt, setAsciiArt] = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { displayed: heroText, done: heroDone } = useGlitchTypewriter(
    "Hey there,",
    800
  );
  const { displayed: subText } = useGlitchTypewriter(
    heroDone ? "I'm Trupti." : "",
    200
  );
  const { displayed: bodyText } = useGlitchTypewriter(
    subText.length > 5 ? "designer & developer\ncrafting interfaces\nthat feel alive." : "",
    300
  );

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/image.jpeg";
    img.onload = () => {
      const art = imageToAscii(img, 60, 55);
      setAsciiArt(art);
      setLoaded(true);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden px-6 py-16"
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
        }}
      />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div
          className="absolute left-1/4 top-1/3 w-96 h-96 rounded-full opacity-10 blur-[120px]"
          style={{ background: "#00ff88" }}
        />
        <div
          className="absolute right-1/4 bottom-1/3 w-64 h-64 rounded-full opacity-8 blur-[100px]"
          style={{ background: "#00ccff" }}
        />
      </div>

      <div className="relative z-20 flex flex-col md:flex-row items-start gap-10 md:gap-16 max-w-5xl w-full">
        {/* ASCII Image */}
        <div className="flex-shrink-0">
          <div
            className="relative"
            style={{
              opacity: loaded ? 1 : 0,
              transition: "opacity 1.2s ease",
            }}
          >
            {/* Corner brackets */}
            <span className="absolute -top-3 -left-3 text-[#00ff88] text-lg font-mono opacity-60">┌</span>
            <span className="absolute -top-3 -right-3 text-[#00ff88] text-lg font-mono opacity-60">┐</span>
            <span className="absolute -bottom-3 -left-3 text-[#00ff88] text-lg font-mono opacity-60">└</span>
            <span className="absolute -bottom-3 -right-3 text-[#00ff88] text-lg font-mono opacity-60">┘</span>

            <pre
              className="font-mono leading-[1.15] select-none"
              style={{
                fontSize: "7px",
                color: "#00ff88",
                textShadow: "0 0 6px rgba(0,255,136,0.5)",
                letterSpacing: "0.05em",
                whiteSpace: "pre",
              }}
            >
              {asciiArt}
            </pre>
          </div>
        </div>

        {/* Text Side */}
        <div className="flex flex-col justify-center gap-6 pt-4 md:pt-12">
          {/* Prompt line */}
          <div
            className="font-mono text-xs text-[#00ff88] opacity-50 tracking-widest uppercase"
            style={{ letterSpacing: "0.25em" }}
          >
            <span>~/portfolio</span>
            <span className="ml-2 text-[#00ccff]">$</span>
          </div>

          {/* Main heading */}
          <div>
            <h1
              className="font-mono font-bold leading-none tracking-tight"
              style={{
                fontSize: "clamp(2.5rem, 6vw, 5rem)",
                color: "#e8ffe8",
                textShadow:
                  "0 0 20px rgba(0,255,136,0.3), 0 0 60px rgba(0,255,136,0.1)",
              }}
            >
              {heroText}
              {!heroDone && (
                <span
                  className="inline-block w-[3px] ml-1 align-middle"
                  style={{
                    height: "0.85em",
                    background: "#00ff88",
                    animation: "blink 0.8s step-end infinite",
                  }}
                />
              )}
            </h1>

            {subText && (
              <h2
                className="font-mono font-bold leading-none tracking-tight mt-1"
                style={{
                  fontSize: "clamp(2rem, 5vw, 4rem)",
                  color: "#00ff88",
                  textShadow: "0 0 20px rgba(0,255,136,0.6)",
                }}
              >
                {subText}
              </h2>
            )}
          </div>

          {/* Body text */}
          {bodyText && (
            <pre
              className="font-mono text-sm md:text-base leading-relaxed"
              style={{
                color: "#7fff7f",
                opacity: 0.75,
                whiteSpace: "pre-wrap",
              }}
            >
              {bodyText}
            </pre>
          )}

          {/* Status line */}
          {heroDone && (
            <div
              className="font-mono text-xs flex items-center gap-3 mt-2"
              style={{ color: "#00ff88", opacity: 0.45 }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  background: "#00ff88",
                  boxShadow: "0 0 6px #00ff88",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              <span>open to work</span>
              <span className="opacity-40">·</span>
              <span>available now</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>
    </div>
  );
}
