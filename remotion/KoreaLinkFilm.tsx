import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from "remotion";

import {
  assetPaths,
  decisionSignals,
  palette,
  proofStats,
  recommendationCards,
  timings,
  type FilmFormat,
  type SceneTiming
} from "./film-data";

type KoreaLinkFilmProps = {
  format: FilmFormat;
};

const fontFamily =
  "'Microsoft YaHei UI', 'Microsoft YaHei', 'PingFang SC', 'Inter', system-ui, sans-serif";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
const easeInOut = Easing.bezier(0.45, 0, 0.55, 1);

function norm(frame: number, start: number, end: number, easing = easeOut) {
  return interpolate(frame, [start, end], [0, 1], {
    ...clamp,
    easing
  });
}

function sceneOpacity(frame: number, timing: SceneTiming, fade = 28) {
  const fadeIn = norm(frame, timing.start, timing.start + fade, easeInOut);
  const fadeOut = interpolate(frame, [timing.end - fade, timing.end], [1, 0], clamp);
  return Math.min(fadeIn, fadeOut);
}

function localFrame(frame: number, timing: SceneTiming) {
  return Math.max(0, frame - timing.start);
}

function imageSrc(path: string) {
  return staticFile(path);
}

function SceneLayer({
  children,
  frame,
  timing,
  fade = 28
}: {
  children: ReactNode;
  frame: number;
  timing: SceneTiming;
  fade?: number;
}) {
  const opacity = sceneOpacity(frame, timing, fade);
  return (
    <AbsoluteFill
      style={{
        opacity,
        pointerEvents: "none"
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

function Grain() {
  return (
    <AbsoluteFill
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0 1px, transparent 1px), radial-gradient(circle at 80% 30%, rgba(10,10,10,0.10) 0 1px, transparent 1px)",
        backgroundSize: "24px 24px, 31px 31px",
        mixBlendMode: "overlay",
        opacity: 0.18
      }}
    />
  );
}

function RouteSvg({
  progress,
  color = palette.yellow,
  vertical = false
}: {
  progress: number;
  color?: string;
  vertical?: boolean;
}) {
  const path = vertical
    ? "M120 70 C250 140 185 310 370 390 C520 455 430 650 620 735"
    : "M130 500 C390 230 610 740 880 430 C1110 180 1290 650 1640 300";
  const length = vertical ? 930 : 1740;
  return (
    <svg
      viewBox={vertical ? "0 0 720 820" : "0 0 1800 900"}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "visible"
      }}
    >
      <path
        d={path}
        fill="none"
        stroke="rgba(248,248,245,0.22)"
        strokeWidth={vertical ? 9 : 8}
        strokeLinecap="round"
      />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeDasharray={length}
        strokeDashoffset={length * (1 - progress)}
        strokeWidth={vertical ? 10 : 9}
        strokeLinecap="round"
      />
    </svg>
  );
}

function CampusTile({
  path,
  style,
  progress
}: {
  path: string;
  style: CSSProperties;
  progress: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        overflow: "hidden",
        border: `2px solid ${palette.ink}`,
        borderRadius: 22,
        background: palette.surface,
        boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
        transform: `translateY(${interpolate(progress, [0, 1], [80, 0])}px) scale(${interpolate(progress, [0, 1], [0.92, 1])})`,
        ...style
      }}
    >
      <Img
        src={imageSrc(path)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover"
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, transparent 45%, rgba(0,0,0,0.34))"
        }}
      />
    </div>
  );
}

function PhoneFrame({
  children,
  style,
  dark = false
}: {
  children: ReactNode;
  style?: CSSProperties;
  dark?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        width: 350,
        height: 710,
        borderRadius: 52,
        padding: 16,
        background: dark ? palette.ink : palette.surface,
        border: `3px solid ${palette.ink}`,
        boxShadow: "0 34px 100px rgba(0,0,0,0.24)",
        ...style
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: 38,
          overflow: "hidden",
          background: dark ? palette.greenDark : palette.warmPaper,
          position: "relative"
        }}
      >
        {children}
      </div>
    </div>
  );
}

function MiniAppHome({ progress }: { progress: number }) {
  const heroLift = interpolate(progress, [0, 1], [34, 0]);
  return (
    <AbsoluteFill style={{ background: palette.warmPaper }}>
      <div
        style={{
          height: 215,
          position: "relative",
          overflow: "hidden",
          background: palette.greenDark
        }}
      >
        <Img
          src={imageSrc(assetPaths.hero)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.74,
            transform: `scale(${1.08 + progress * 0.04})`
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(7,63,45,1), rgba(7,63,45,0.55), rgba(245,243,237,0))"
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 26,
            top: 34,
            color: "#fbfbf8",
            fontWeight: 900,
            fontSize: 16,
            letterSpacing: 1.2
          }}
        >
          KOREA UNIVERSITY LINK
        </div>
        <div
          style={{
            position: "absolute",
            left: 26,
            bottom: 36,
            color: "#e9fff5",
            fontWeight: 800,
            fontSize: 24
          }}
        >
          Hi, future student
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 178 + heroLift,
          borderRadius: 24,
          background: palette.surface,
          boxShadow: "0 18px 50px rgba(10,10,10,0.15)",
          padding: 18
        }}
      >
        <div
          style={{
            height: 54,
            borderRadius: 16,
            background: "#fffaf0",
            border: "1px solid rgba(10,10,10,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            fontWeight: 900,
            fontSize: 15
          }}
        >
          <span>Filter first</span>
          <span
            style={{
              color: palette.surface,
              background: palette.ink,
              borderRadius: 999,
              padding: "6px 16px",
              fontSize: 12
            }}
          >
            Start
          </span>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 13,
            marginTop: 20
          }}
        >
          {assetPaths.categoryIcons.slice(0, 6).map((path, index) => {
            const itemProgress = norm(progress, index * 0.09, 0.45 + index * 0.08);
            return (
              <div
                key={path}
                style={{
                  display: "grid",
                  justifyItems: "center",
                  gap: 7,
                  opacity: itemProgress,
                  transform: `translateY(${interpolate(itemProgress, [0, 1], [20, 0])}px)`
                }}
              >
                <Img
                  src={imageSrc(path)}
                  style={{
                    width: 58,
                    height: 58,
                    objectFit: "contain"
                  }}
                />
                <div
                  style={{
                    width: 56,
                    height: 7,
                    borderRadius: 999,
                    background: "rgba(10,10,10,0.22)"
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function OpeningScene({ frame, format }: { frame: number; format: FilmFormat }) {
  const { width, height } = useVideoConfig();
  const vertical = format === "vertical";
  const route = norm(frame, 24, vertical ? 126 : 210, easeInOut);
  const title = norm(frame, 10, vertical ? 66 : 92);
  const imagesIn = norm(frame, 54, vertical ? 128 : 190);
  const phoneIn = norm(frame, 78, vertical ? 150 : 230);
  const mapScale = interpolate(frame, [0, vertical ? 170 : 300], [1.12, 1.02], clamp);

  return (
    <AbsoluteFill style={{ background: palette.greenDark, color: palette.paper, overflow: "hidden" }}>
      <Img
        src={imageSrc(assetPaths.koreaMap)}
        style={{
          position: "absolute",
          right: vertical ? -360 : -120,
          top: vertical ? 480 : -120,
          width: vertical ? 980 : 1060,
          height: vertical ? 980 : 1060,
          objectFit: "contain",
          opacity: 0.12,
          filter: "invert(1)",
          transform: `scale(${mapScale}) rotate(${vertical ? -7 : -5}deg)`
        }}
      />
      <Grain />
      <RouteSvg progress={route} color={palette.yellow} vertical={vertical} />

      <div
        style={{
          position: "absolute",
          left: vertical ? 70 : 96,
          top: vertical ? 96 : 72,
          fontSize: vertical ? 28 : 24,
          letterSpacing: 4,
          fontWeight: 900,
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [34, 0])}px)`
        }}
      >
        KOREA UNIVERSITY LINK
      </div>
      <div
        style={{
          position: "absolute",
          left: vertical ? 66 : 96,
          top: vertical ? 200 : 160,
          width: vertical ? 840 : 1040,
          fontSize: vertical ? 104 : 130,
          lineHeight: 0.88,
          fontWeight: 950,
          letterSpacing: 0,
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [72, 0])}px)`
        }}
      >
        Study Korea decisions, mapped.
      </div>
      <div
        style={{
          position: "absolute",
          left: vertical ? 72 : 104,
          top: vertical ? 585 : 540,
          width: vertical ? 670 : 650,
          fontSize: vertical ? 32 : 30,
          lineHeight: 1.24,
          fontWeight: 700,
          color: "#d8efe4",
          opacity: norm(frame, vertical ? 64 : 80, vertical ? 122 : 154)
        }}
      >
        A premium decision platform for Korean universities, TOPIK planning, costs, and applications.
      </div>

      <CampusTile
        path={assetPaths.campus[0]}
        progress={imagesIn}
        style={{
          right: vertical ? 130 : 560,
          bottom: vertical ? 470 : 120,
          width: vertical ? 300 : 430,
          height: vertical ? 220 : 300,
          transform: `rotate(-6deg) translateY(${interpolate(imagesIn, [0, 1], [90, 0])}px)`
        }}
      />
      <CampusTile
        path={assetPaths.campus[1]}
        progress={imagesIn}
        style={{
          right: vertical ? -40 : 260,
          top: vertical ? 1110 : 210,
          width: vertical ? 330 : 400,
          height: vertical ? 240 : 285,
          transform: `rotate(5deg) translateY(${interpolate(imagesIn, [0, 1], [80, 0])}px)`
        }}
      />
      <PhoneFrame
        style={{
          right: vertical ? 365 : 120,
          bottom: vertical ? 125 : 90,
          width: vertical ? 310 : 350,
          height: vertical ? 630 : 710,
          opacity: phoneIn,
          transform: `rotate(${vertical ? -2 : 4}deg) translateY(${interpolate(phoneIn, [0, 1], [120, 0])}px)`
        }}
      >
        <MiniAppHome progress={phoneIn} />
      </PhoneFrame>

      <div
        style={{
          position: "absolute",
          left: vertical ? 70 : width - 580,
          bottom: vertical ? 64 : 58,
          display: "flex",
          gap: 14,
          opacity: norm(frame, vertical ? 118 : 180, vertical ? 166 : 260)
        }}
      >
        {["GPA", "TOPIK", "Cost", "Cases"].map((label, index) => (
          <div
            key={label}
            style={{
              border: `2px solid ${palette.ink}`,
              background: [palette.yellow, palette.mint, palette.pink, palette.lavender][index],
              color: palette.ink,
              borderRadius: 999,
              padding: vertical ? "12px 18px" : "12px 22px",
              fontWeight: 950,
              fontSize: vertical ? 23 : 20
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          border: `${vertical ? 26 : 20}px solid rgba(248,248,245,0.06)`
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: height * 0.06, background: palette.paper, opacity: 0.04 }} />
    </AbsoluteFill>
  );
}

function SignalChip({
  label,
  index,
  frame,
  vertical
}: {
  label: string;
  index: number;
  frame: number;
  vertical: boolean;
}) {
  const p = norm(frame, 8 + index * 8, 50 + index * 8);
  const settle = norm(frame, vertical ? 98 : 130, vertical ? 145 : 220);
  const colors = [palette.yellow, palette.pink, palette.mint, palette.lavender, palette.peach, palette.softGreen];
  const xStart = vertical ? (index % 2 === 0 ? -310 : 310) : (index % 2 === 0 ? -420 : 420);
  const yStart = (index % 5) * (vertical ? 90 : 78) - (vertical ? 220 : 160);
  const x = interpolate(p, [0, 1], [xStart, 0]) + interpolate(settle, [0, 1], [0, (index % 2 === 0 ? -1 : 1) * (vertical ? 210 : 265)]);
  const y = interpolate(p, [0, 1], [yStart, (index - 4.5) * (vertical ? 32 : 22)]) + interpolate(settle, [0, 1], [0, (index % 3 - 1) * (vertical ? 70 : 60)]);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${interpolate(p, [0, 1], [0.9, 1])})`,
        opacity: p,
        padding: vertical ? "16px 22px" : "14px 22px",
        borderRadius: 999,
        background: colors[index % colors.length],
        border: `2px solid ${palette.ink}`,
        boxShadow: "0 12px 26px rgba(10,10,10,0.10)",
        color: palette.ink,
        fontSize: vertical ? 27 : 22,
        fontWeight: 950
      }}
    >
      {label}
    </div>
  );
}

function ProblemScene({ frame, format }: { frame: number; format: FilmFormat }) {
  const vertical = format === "vertical";
  const sweep = norm(frame, vertical ? 106 : 146, vertical ? 166 : 260, easeInOut);
  const headline = norm(frame, 4, 56);

  return (
    <AbsoluteFill style={{ background: palette.paper, color: palette.ink, overflow: "hidden" }}>
      <Grain />
      <div
        style={{
          position: "absolute",
          left: vertical ? 64 : 90,
          top: vertical ? 82 : 72,
          right: vertical ? 64 : undefined,
          width: vertical ? undefined : 760,
          fontWeight: 950,
          fontSize: vertical ? 82 : 86,
          lineHeight: 0.94,
          opacity: headline,
          transform: `translateY(${interpolate(headline, [0, 1], [50, 0])}px)`
        }}
      >
        Too many signals. Not enough clarity.
      </div>
      <div
        style={{
          position: "absolute",
          left: vertical ? 70 : 100,
          top: vertical ? 340 : 285,
          width: vertical ? 620 : 530,
          fontSize: vertical ? 30 : 28,
          lineHeight: 1.3,
          fontWeight: 700,
          color: palette.muted,
          opacity: norm(frame, 36, 82)
        }}
      >
        Applicants compare scores, language level, budget, cities, school tiers, and evidence all at once.
      </div>

      {decisionSignals.map((label, index) => (
        <SignalChip key={label} label={label} index={index} frame={frame} vertical={vertical} />
      ))}

      <div
        style={{
          position: "absolute",
          left: vertical ? 124 : 760,
          top: vertical ? 780 : 300,
          width: vertical ? 840 : 760,
          height: vertical ? 520 : 420,
          border: `3px solid ${palette.ink}`,
          borderRadius: vertical ? 46 : 34,
          background: palette.surface,
          boxShadow: "0 24px 70px rgba(10,10,10,0.13)",
          opacity: norm(frame, vertical ? 92 : 112, vertical ? 142 : 185),
          overflow: "hidden"
        }}
      >
        <div style={{ padding: vertical ? 40 : 34, fontWeight: 950, fontSize: vertical ? 38 : 34 }}>Decision engine</div>
        <div style={{ position: "absolute", left: vertical ? 40 : 34, right: vertical ? 40 : 34, top: vertical ? 118 : 105, display: "grid", gap: vertical ? 26 : 20 }}>
          {["Academic fit", "Language readiness", "Budget range", "Evidence strength"].map((label, index) => {
            const bar = norm(frame, (vertical ? 120 : 145) + index * 10, (vertical ? 174 : 230) + index * 10);
            return (
              <div key={label} style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: vertical ? 24 : 20, fontWeight: 850 }}>
                  <span>{label}</span>
                  <span>{Math.round(interpolate(bar, [0, 1], [0, [92, 76, 81, 88][index]]))}%</span>
                </div>
                <div style={{ height: vertical ? 22 : 18, borderRadius: 999, background: "#ece9e1", overflow: "hidden", border: "1px solid rgba(10,10,10,0.18)" }}>
                  <div style={{ height: "100%", width: `${bar * [92, 76, 81, 88][index]}%`, background: [palette.yellow, palette.mint, palette.pink, palette.lavender][index] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: vertical ? 160 : 88,
          height: vertical ? 28 : 22,
          background: palette.green,
          transform: `scaleX(${sweep})`,
          transformOrigin: "left center"
        }}
      />
    </AbsoluteFill>
  );
}

function RecommendationCard({
  card,
  index,
  frame,
  compact = false
}: {
  card: (typeof recommendationCards)[number];
  index: number;
  frame: number;
  compact?: boolean;
}) {
  const p = norm(frame, 112 + index * 13, 164 + index * 13);
  const score = Math.round(interpolate(p, [0, 1], [0, card.score]));
  return (
    <div
      style={{
        height: compact ? 112 : 118,
        borderRadius: compact ? 22 : 20,
        border: `2px solid ${palette.ink}`,
        background: index === 0 ? card.color : palette.surface,
        boxShadow: index === 0 ? "0 18px 46px rgba(10,10,10,0.16)" : "0 10px 24px rgba(10,10,10,0.08)",
        display: "grid",
        gridTemplateColumns: compact ? "78px 1fr 76px" : "78px 1fr 82px",
        alignItems: "center",
        gap: 14,
        padding: compact ? "14px 16px" : "14px 18px",
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [38, 0])}px) scale(${interpolate(p, [0, 1], [0.96, 1])})`
      }}
    >
      <div
        style={{
          width: compact ? 64 : 68,
          height: compact ? 64 : 68,
          borderRadius: 18,
          border: "1px solid rgba(10,10,10,0.16)",
          background: palette.surface,
          display: "grid",
          placeItems: "center",
          overflow: "hidden"
        }}
      >
        <Img src={imageSrc(card.logo)} style={{ width: "78%", height: "78%", objectFit: "contain" }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 950, fontSize: compact ? 23 : 21, lineHeight: 1.03 }}>{card.name}</div>
        <div style={{ fontWeight: 800, color: palette.muted, fontSize: compact ? 17 : 15, marginTop: 8 }}>{card.city} / {card.tag}</div>
      </div>
      <div style={{ textAlign: "right", fontWeight: 950, fontSize: compact ? 27 : 26 }}>{score}</div>
    </div>
  );
}

function ProductScene({ frame, format }: { frame: number; format: FilmFormat }) {
  const vertical = format === "vertical";
  const phone = norm(frame, 0, 62);
  const text = norm(frame, vertical ? 16 : 35, vertical ? 78 : 95);
  const loading = norm(frame, 74, 136, easeInOut);
  const cardFrame = Math.max(0, frame - 70);

  return (
    <AbsoluteFill style={{ background: palette.warmPaper, color: palette.ink, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(120deg, rgba(255,224,122,0.45), transparent 36%), linear-gradient(250deg, rgba(164,212,197,0.52), transparent 38%)"
        }}
      />
      <Grain />
      <PhoneFrame
        style={{
          left: vertical ? 94 : 116,
          top: vertical ? 350 : 122,
          width: vertical ? 650 : 410,
          height: vertical ? 1180 : 835,
          borderRadius: vertical ? 78 : 56,
          padding: vertical ? 22 : 18,
          opacity: phone,
          transform: `translateY(${interpolate(phone, [0, 1], [120, 0])}px) rotate(${vertical ? 0 : -3}deg)`
        }}
      >
        <AbsoluteFill style={{ background: palette.warmPaper, padding: vertical ? 38 : 24 }}>
          <div
            style={{
              height: vertical ? 300 : 210,
              borderRadius: vertical ? 38 : 26,
              background: palette.greenDark,
              overflow: "hidden",
              position: "relative",
              color: palette.surface,
              padding: vertical ? 34 : 24
            }}
          >
            <Img
              src={imageSrc(assetPaths.hero)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.55,
                transform: `scale(${1.08 + loading * 0.04})`
              }}
            />
            <div style={{ position: "relative", fontWeight: 950, letterSpacing: 1, fontSize: vertical ? 25 : 15 }}>AI MATCH</div>
            <div style={{ position: "relative", marginTop: vertical ? 38 : 36, fontWeight: 950, fontSize: vertical ? 42 : 32, lineHeight: 0.94 }}>Find your best route.</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: vertical ? 16 : 10, marginTop: vertical ? 28 : 18 }}>
            {["GPA 82", "TOPIK 3", "Business", "Seoul"].map((label, index) => (
              <div key={label} style={{ border: `2px solid ${palette.ink}`, borderRadius: vertical ? 20 : 14, padding: vertical ? "20px 20px" : "13px 14px", fontWeight: 950, fontSize: vertical ? 24 : 16, background: index % 2 ? palette.surface : "#fffaf0" }}>
                {label}
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: vertical ? 24 : 18,
              height: vertical ? 72 : 54,
              borderRadius: vertical ? 22 : 16,
              background: palette.softGreen,
              border: `2px solid ${palette.green}`,
              display: "grid",
              placeItems: "center",
              fontWeight: 950,
              color: "#004c3f",
              fontSize: vertical ? 26 : 18,
              transform: `scale(${interpolate(norm(frame, 64, 100), [0, 1], [0.98, 1])})`
            }}
          >
            {loading < 0.95 ? "Calculating fit..." : "Top 5 recommendations"}
          </div>

          <div style={{ display: "grid", gap: vertical ? 18 : 12, marginTop: vertical ? 26 : 20 }}>
            {recommendationCards.map((card, index) => (
              <RecommendationCard key={card.name} card={card} index={index} frame={cardFrame} compact={vertical} />
            ))}
          </div>
        </AbsoluteFill>
      </PhoneFrame>

      <div
        style={{
          position: "absolute",
          right: vertical ? 66 : 116,
          top: vertical ? 78 : 132,
          width: vertical ? 940 : 1050,
          opacity: text,
          transform: `translateY(${interpolate(text, [0, 1], [50, 0])}px)`
        }}
      >
        <div style={{ fontSize: vertical ? 70 : 96, lineHeight: 0.9, fontWeight: 950, width: vertical ? 880 : 760 }}>
          The app becomes the story.
        </div>
        <div style={{ marginTop: 28, fontSize: vertical ? 29 : 31, lineHeight: 1.28, color: palette.muted, fontWeight: 700, width: vertical ? 850 : 620 }}>
          Conditions turn into ranked schools, evidence, cost context, and next-step routes.
        </div>
      </div>

      {!vertical ? (
        <div
          style={{
            position: "absolute",
            right: 120,
            bottom: 118,
            width: 560,
            height: 290,
            borderRadius: 32,
            border: `2px solid ${palette.ink}`,
            background: palette.surface,
            boxShadow: "0 22px 70px rgba(10,10,10,0.12)",
            padding: 30,
            opacity: norm(frame, 160, 235)
          }}
        >
          <div style={{ fontWeight: 950, fontSize: 34 }}>Admission evidence</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 22 }}>
            {["Cases", "Scores", "TOPIK", "Budget"].map((label, index) => (
              <div key={label} style={{ borderRadius: 18, border: "1px solid rgba(10,10,10,0.17)", background: ["#fffaf0", palette.softGreen, palette.pink, "#eee8ff"][index], padding: 16 }}>
                <div style={{ fontWeight: 950, fontSize: 28 }}>{["42", "82", "3+", "RMB"][index]}</div>
                <div style={{ marginTop: 6, color: palette.muted, fontWeight: 800 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
}

function ProofScene({ frame, format }: { frame: number; format: FilmFormat }) {
  const vertical = format === "vertical";
  const title = norm(frame, 0, 54);
  const map = norm(frame, 44, vertical ? 94 : 130);
  const grid = norm(frame, vertical ? 78 : 110, vertical ? 148 : 220);

  return (
    <AbsoluteFill style={{ background: palette.ink, color: palette.paper, overflow: "hidden" }}>
      <Grain />
      <div
        style={{
          position: "absolute",
          left: vertical ? 64 : 92,
          top: vertical ? 82 : 70,
          fontSize: vertical ? 74 : 82,
          lineHeight: 0.94,
          fontWeight: 950,
          width: vertical ? 850 : 790,
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [54, 0])}px)`
        }}
      >
        Proof that feels designed, not dumped.
      </div>
      <div
        style={{
          position: "absolute",
          left: vertical ? 66 : 96,
          top: vertical ? 310 : 270,
          width: vertical ? 760 : 550,
          color: "#d8efe4",
          fontSize: vertical ? 30 : 28,
          lineHeight: 1.28,
          fontWeight: 700,
          opacity: norm(frame, 28, 80)
        }}
      >
        Source badges, campus assets, map pins, and application context move as one visual system.
      </div>

      <div
        style={{
          position: "absolute",
          right: vertical ? -120 : 90,
          top: vertical ? 450 : 80,
          width: vertical ? 900 : 850,
          height: vertical ? 860 : 730,
          borderRadius: vertical ? 64 : 44,
          background: palette.paper,
          border: `3px solid ${palette.paper}`,
          overflow: "hidden",
          opacity: map,
          transform: `translateY(${interpolate(map, [0, 1], [82, 0])}px) scale(${interpolate(map, [0, 1], [0.96, 1])})`
        }}
      >
        <Img
          src={imageSrc(assetPaths.koreaMap)}
          style={{
            position: "absolute",
            inset: vertical ? "-20% -25%" : "-12% -9%",
            width: vertical ? "140%" : "118%",
            height: vertical ? "140%" : "118%",
            objectFit: "contain",
            opacity: 0.82
          }}
        />
        {[
          [62, 30, palette.coral],
          [54, 42, palette.yellow],
          [69, 58, palette.mint],
          [42, 62, palette.lavender],
          [57, 73, palette.pink]
        ].map(([left, top, color], index) => {
          const pin = norm(frame, 86 + index * 9, 120 + index * 9);
          return (
            <div
              key={`${left}-${top}`}
              style={{
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                width: vertical ? 34 : 28,
                height: vertical ? 34 : 28,
                borderRadius: 999,
                background: color as string,
                border: `3px solid ${palette.ink}`,
                transform: `translate(-50%, -50%) scale(${pin})`,
                boxShadow: "0 0 0 10px rgba(10,10,10,0.08)"
              }}
            />
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          left: vertical ? 66 : 98,
          bottom: vertical ? 128 : 104,
          display: "grid",
          gridTemplateColumns: vertical ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: vertical ? 18 : 16,
          width: vertical ? 860 : 980,
          opacity: grid
        }}
      >
        {proofStats.map((stat, index) => (
          <div
            key={stat.label}
            style={{
              borderRadius: vertical ? 30 : 24,
              background: stat.color,
              color: palette.ink,
              border: `2px solid ${palette.paper}`,
              padding: vertical ? 26 : 24,
              transform: `translateY(${interpolate(norm(frame, 98 + index * 12, 150 + index * 12), [0, 1], [50, 0])}px)`
            }}
          >
            <div style={{ fontWeight: 950, fontSize: vertical ? 46 : 42, lineHeight: 0.92 }}>{stat.value}</div>
            <div style={{ marginTop: 12, fontWeight: 850, fontSize: vertical ? 22 : 18 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {!vertical ? (
        <div
          style={{
            position: "absolute",
            right: 110,
            bottom: 84,
            display: "flex",
            gap: 14,
            opacity: norm(frame, 174, 250)
          }}
        >
          {assetPaths.logos.map((path, index) => (
            <div key={path} style={{ width: 82, height: 82, borderRadius: 18, background: palette.surface, display: "grid", placeItems: "center", transform: `translateY(${Math.sin((frame + index * 7) / 18) * 4}px)` }}>
              <Img src={imageSrc(path)} style={{ width: "72%", height: "72%", objectFit: "contain" }} />
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
}

function FinaleScene({ frame, format }: { frame: number; format: FilmFormat }) {
  const vertical = format === "vertical";
  const reveal = norm(frame, 0, vertical ? 52 : 74);
  const route = norm(frame, 20, vertical ? 96 : 150, easeInOut);
  const mosaic = norm(frame, vertical ? 32 : 52, vertical ? 96 : 160);

  return (
    <AbsoluteFill style={{ background: palette.paper, color: palette.ink, overflow: "hidden" }}>
      <RouteSvg progress={route} color={palette.green} vertical={vertical} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(150deg, rgba(255,208,216,0.45), transparent 38%), linear-gradient(300deg, rgba(255,224,122,0.42), transparent 40%)"
        }}
      />
      <div
        style={{
          position: "absolute",
          right: vertical ? -140 : 80,
          top: vertical ? 650 : 120,
          width: vertical ? 760 : 720,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          opacity: mosaic,
          transform: `rotate(${vertical ? -5 : 4}deg) translateY(${interpolate(mosaic, [0, 1], [80, 0])}px)`
        }}
      >
        {assetPaths.campus.slice(0, 4).map((path) => (
          <div
            key={path}
            style={{
              height: vertical ? 230 : 205,
              borderRadius: 28,
              border: `2px solid ${palette.ink}`,
              overflow: "hidden",
              background: palette.surface
            }}
          >
            <Img src={imageSrc(path)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: vertical ? 66 : 96,
          top: vertical ? 130 : 120,
          width: vertical ? 880 : 980,
          opacity: reveal,
          transform: `translateY(${interpolate(reveal, [0, 1], [66, 0])}px)`
        }}
      >
        <div style={{ fontSize: vertical ? 34 : 28, letterSpacing: 4, fontWeight: 950, color: palette.green }}>KOREA UNIVERSITY LINK</div>
        <div style={{ marginTop: vertical ? 46 : 38, fontSize: vertical ? 116 : 132, lineHeight: 0.86, fontWeight: 950, maxWidth: vertical ? 820 : 900 }}>
          Pick Korea with evidence.
        </div>
        <div style={{ marginTop: 34, fontSize: vertical ? 31 : 31, lineHeight: 1.25, color: palette.muted, fontWeight: 750, maxWidth: vertical ? 760 : 680 }}>
          Universities, TOPIK, costs, applications, and cases in one clear decision flow.
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: vertical ? 66 : 100,
          bottom: vertical ? 126 : 110,
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          width: vertical ? 880 : 980,
          opacity: norm(frame, vertical ? 80 : 116, vertical ? 122 : 178)
        }}
      >
        {["University shortlist", "TOPIK path", "RMB cost context", "Application route"].map((label, index) => (
          <div
            key={label}
            style={{
              border: `2px solid ${palette.ink}`,
              background: [palette.yellow, palette.mint, palette.pink, palette.lavender][index],
              borderRadius: 999,
              padding: vertical ? "16px 24px" : "14px 24px",
              fontSize: vertical ? 26 : 22,
              fontWeight: 950,
              transform: `translateY(${Math.sin((frame + index * 5) / 20) * 4}px)`
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          left: vertical ? 66 : undefined,
          right: vertical ? undefined : 104,
          bottom: vertical ? 56 : 64,
          fontSize: vertical ? 20 : 18,
          fontWeight: 900,
          color: palette.green,
          letterSpacing: 2,
          opacity: norm(frame, vertical ? 106 : 160, vertical ? 138 : 220)
        }}
      >
        DATA PRODUCT FOR STUDY-ABROAD DECISIONS
      </div>
    </AbsoluteFill>
  );
}

export const KoreaLinkFilm = ({ format }: KoreaLinkFilmProps) => {
  const frame = useCurrentFrame();
  const sceneTimings = timings[format];

  return (
    <AbsoluteFill style={{ fontFamily, background: palette.paper }}>
      <SceneLayer frame={frame} timing={sceneTimings.opening}>
        <OpeningScene frame={localFrame(frame, sceneTimings.opening)} format={format} />
      </SceneLayer>
      <SceneLayer frame={frame} timing={sceneTimings.problem}>
        <ProblemScene frame={localFrame(frame, sceneTimings.problem)} format={format} />
      </SceneLayer>
      <SceneLayer frame={frame} timing={sceneTimings.product}>
        <ProductScene frame={localFrame(frame, sceneTimings.product)} format={format} />
      </SceneLayer>
      <SceneLayer frame={frame} timing={sceneTimings.proof}>
        <ProofScene frame={localFrame(frame, sceneTimings.proof)} format={format} />
      </SceneLayer>
      <SceneLayer frame={frame} timing={sceneTimings.finale} fade={34}>
        <FinaleScene frame={localFrame(frame, sceneTimings.finale)} format={format} />
      </SceneLayer>
    </AbsoluteFill>
  );
};
