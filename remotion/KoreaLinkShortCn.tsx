import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from "remotion";

import { assetPaths, chineseDecisionSignals, chineseRecommendationCards, palette } from "./film-data";

const fontFamily =
  "'Microsoft YaHei UI', 'Microsoft YaHei', 'PingFang SC', 'Noto Sans CJK SC', 'Inter', system-ui, sans-serif";

const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const
};

const out = Easing.bezier(0.16, 1, 0.3, 1);
const inOut = Easing.bezier(0.45, 0, 0.55, 1);

function progress(frame: number, start: number, end: number, easing = out) {
  return interpolate(frame, [start, end], [0, 1], {
    ...clamp,
    easing
  });
}

function fade(frame: number, start: number, end: number, fadeFrames = 18) {
  const enter = progress(frame, start, start + fadeFrames, inOut);
  const exit = interpolate(frame, [end - fadeFrames, end], [1, 0], clamp);
  return Math.min(enter, exit);
}

function src(path: string) {
  return staticFile(path);
}

function Texture() {
  return (
    <AbsoluteFill
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12) 0 1px, transparent 1px), radial-gradient(circle at 75% 30%, rgba(10,10,10,0.10) 0 1px, transparent 1px)",
        backgroundSize: "24px 24px, 31px 31px",
        mixBlendMode: "overlay",
        opacity: 0.18
      }}
    />
  );
}

function RouteLine({ frame }: { frame: number }) {
  const draw = progress(frame, 18, 132, inOut);
  const length = 1050;
  return (
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <path
        d="M90 1320 C250 1060 430 1260 560 900 C680 565 850 510 1035 265"
        fill="none"
        stroke="rgba(255,224,122,0.22)"
        strokeLinecap="round"
        strokeWidth={16}
      />
      <path
        d="M90 1320 C250 1060 430 1260 560 900 C680 565 850 510 1035 265"
        fill="none"
        stroke={palette.yellow}
        strokeDasharray={length}
        strokeDashoffset={length * (1 - draw)}
        strokeLinecap="round"
        strokeWidth={18}
      />
    </svg>
  );
}

function CampusStack({ frame }: { frame: number }) {
  const show = progress(frame, 16, 78);
  const paths = [assetPaths.campus[0], assetPaths.campus[1], assetPaths.campus[3]];
  return (
    <>
      {paths.map((path, index) => {
        const item = progress(frame, 22 + index * 8, 78 + index * 8);
        return (
          <div
            key={path}
            style={{
              position: "absolute",
              right: [-78, 48, -12][index],
              top: [595, 760, 925][index],
              width: [400, 430, 390][index],
              height: [260, 270, 250][index],
              border: `3px solid ${palette.ink}`,
              borderRadius: 34,
              overflow: "hidden",
              background: palette.surface,
              boxShadow: "0 28px 80px rgba(0,0,0,0.24)",
              opacity: show,
              transform: `rotate(${[-8, 6, -4][index]}deg) translateY(${interpolate(item, [0, 1], [96, 0])}px)`
            }}
          >
            <Img src={src(path)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        );
      })}
    </>
  );
}

function ChinesePhone({ frame }: { frame: number }) {
  const phone = progress(frame, 76, 140);
  const cardsStart = 220;
  return (
    <div
      style={{
        position: "absolute",
        left: 74,
        top: 555,
        width: 760,
        height: 1235,
        borderRadius: 82,
        padding: 24,
        border: `4px solid ${palette.ink}`,
        background: palette.surface,
        boxShadow: "0 44px 120px rgba(0,0,0,0.25)",
        opacity: phone,
        transform: `translateY(${interpolate(phone, [0, 1], [140, 0])}px) scale(${interpolate(phone, [0, 1], [0.95, 1])})`
      }}
    >
      <div
        style={{
          position: "relative",
          height: "100%",
          overflow: "hidden",
          borderRadius: 58,
          background: palette.warmPaper,
          padding: 44
        }}
      >
        <div style={{ height: 252, position: "relative", overflow: "hidden", borderRadius: 38, background: palette.greenDark }}>
          <Img
            src={src(assetPaths.hero)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.64,
              transform: `scale(${1.08 + progress(frame, 90, 260) * 0.05})`
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(7,63,45,0.95), rgba(7,63,45,0.28))" }} />
          <div style={{ position: "absolute", left: 28, top: 32, color: palette.surface, fontSize: 27, fontWeight: 950, letterSpacing: 1.4 }}>
            KOREA UNIVERSITY LINK
          </div>
          <div style={{ position: "absolute", left: 28, bottom: 30, color: palette.surface, fontSize: 54, lineHeight: 0.92, fontWeight: 950 }}>
            先按条件
            <br />
            再看学校
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 28 }}>
          {["均分 82", "TOPIK 3", "商科", "预算可控"].map((label, index) => {
            const item = progress(frame, 118 + index * 8, 170 + index * 8);
            return (
              <div
                key={label}
                style={{
                  border: `3px solid ${palette.ink}`,
                  borderRadius: 22,
                  background: index % 2 === 0 ? "#fffaf0" : palette.surface,
                  padding: "18px 22px",
                  fontSize: 30,
                  fontWeight: 950,
                  opacity: item,
                  transform: `translateY(${interpolate(item, [0, 1], [26, 0])}px)`
                }}
              >
                {label}
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 24,
            height: 70,
            borderRadius: 22,
            background: palette.softGreen,
            border: `3px solid ${palette.green}`,
            color: "#004c3f",
            display: "grid",
            placeItems: "center",
            fontSize: 32,
            fontWeight: 950
          }}
        >
          AI生成5所候选大学
        </div>

        <div style={{ display: "grid", gap: 16, marginTop: 28 }}>
          {chineseRecommendationCards.map((card, index) => {
            const item = progress(frame, cardsStart + index * 9, cardsStart + 48 + index * 9);
            const score = Math.round(interpolate(item, [0, 1], [0, card.score]));
            return (
              <div
                key={card.name}
                style={{
                  height: 120,
                  display: "grid",
                  gridTemplateColumns: "82px 1fr 72px",
                  alignItems: "center",
                  gap: 18,
                  padding: "16px 18px",
                  border: `3px solid ${palette.ink}`,
                  borderRadius: 25,
                  background: index === 0 ? card.color : palette.surface,
                  boxShadow: index === 0 ? "0 18px 40px rgba(10,10,10,0.16)" : "0 8px 18px rgba(10,10,10,0.07)",
                  opacity: item,
                  transform: `translateY(${interpolate(item, [0, 1], [42, 0])}px) scale(${interpolate(item, [0, 1], [0.97, 1])})`
                }}
              >
                <div style={{ width: 70, height: 70, borderRadius: 20, background: palette.surface, display: "grid", placeItems: "center", overflow: "hidden", border: "1px solid rgba(10,10,10,0.16)" }}>
                  <Img src={src(card.logo)} style={{ width: "76%", height: "76%", objectFit: "contain" }} />
                </div>
                <div>
                  <div style={{ fontSize: 33, fontWeight: 950, lineHeight: 1 }}>{card.name}</div>
                  <div style={{ marginTop: 8, fontSize: 20, color: palette.muted, fontWeight: 850 }}>
                    {card.city} / {card.tag}
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: 34, fontWeight: 950 }}>{score}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Opening({ frame }: { frame: number }) {
  const title = progress(frame, 0, 54);
  const punch = progress(frame, 44, 92);
  return (
    <AbsoluteFill style={{ opacity: fade(frame, 0, 148), background: palette.greenDark, color: palette.paper }}>
      <Img
        src={src(assetPaths.koreaMap)}
        style={{
          position: "absolute",
          right: -420,
          top: 210,
          width: 1180,
          height: 1180,
          objectFit: "contain",
          opacity: 0.14,
          filter: "invert(1)",
          transform: `rotate(-8deg) scale(${1.12 - progress(frame, 0, 148) * 0.05})`
        }}
      />
      <Texture />
      <RouteLine frame={frame} />
      <CampusStack frame={frame} />
      <div
        style={{
          position: "absolute",
          left: 66,
          top: 95,
          fontSize: 30,
          fontWeight: 950,
          letterSpacing: 3,
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [36, 0])}px)`
        }}
      >
        KOREA UNIVERSITY LINK
      </div>
      <div
        style={{
          position: "absolute",
          left: 62,
          top: 225,
          width: 890,
          fontSize: 130,
          lineHeight: 0.86,
          fontWeight: 950,
          opacity: title,
          transform: `translateY(${interpolate(title, [0, 1], [90, 0])}px)`
        }}
      >
        韩国留学
        <br />
        不要盲选
      </div>
      <div
        style={{
          position: "absolute",
          left: 68,
          top: 510,
          display: "inline-grid",
          placeItems: "center",
          borderRadius: 999,
          border: `3px solid ${palette.ink}`,
          background: palette.yellow,
          color: palette.ink,
          padding: "18px 28px",
          fontSize: 40,
          fontWeight: 950,
          opacity: punch,
          transform: `translateY(${interpolate(punch, [0, 1], [44, 0])}px) rotate(-2deg)`
        }}
      >
        先看条件，再看学校
      </div>
    </AbsoluteFill>
  );
}

function SignalBurst({ frame }: { frame: number }) {
  return (
    <AbsoluteFill style={{ opacity: fade(frame, 92, 260), background: palette.paper, color: palette.ink }}>
      <Texture />
      <div style={{ position: "absolute", left: 64, top: 88, fontSize: 88, lineHeight: 0.94, fontWeight: 950, width: 850 }}>
        6个信号
        <br />
        变成一张名单
      </div>
      <div style={{ position: "absolute", left: 70, top: 310, width: 720, color: palette.muted, fontSize: 31, lineHeight: 1.25, fontWeight: 800 }}>
        均分、TOPIK、专业、预算、城市、案例，直接进入推荐逻辑。
      </div>
      {chineseDecisionSignals.map((label, index) => {
        const item = progress(frame, 112 + index * 9, 166 + index * 9);
        const left = [76, 450, 160, 560, 88, 482][index];
        const top = [545, 610, 760, 820, 985, 1048][index];
        const colors = [palette.yellow, palette.pink, palette.mint, palette.lavender, palette.peach, palette.softGreen];
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left,
              top,
              border: `3px solid ${palette.ink}`,
              borderRadius: 999,
              background: colors[index],
              padding: "20px 28px",
              fontSize: 36,
              fontWeight: 950,
              boxShadow: "0 18px 42px rgba(10,10,10,0.12)",
              opacity: item,
              transform: `translateY(${interpolate(item, [0, 1], [76, 0])}px) rotate(${[-4, 3, -2, 5, 2, -3][index]}deg)`
            }}
          >
            {label}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 235,
          height: 32,
          background: palette.green,
          transform: `scaleX(${progress(frame, 182, 248, inOut)})`,
          transformOrigin: "left center"
        }}
      />
    </AbsoluteFill>
  );
}

function Product({ frame }: { frame: number }) {
  return (
    <AbsoluteFill style={{ opacity: fade(frame, 176, 390), background: palette.warmPaper, color: palette.ink }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,224,122,0.48), transparent 35%), linear-gradient(300deg, rgba(164,212,197,0.58), transparent 42%)" }} />
      <Texture />
      <div
        style={{
          position: "absolute",
          left: 66,
          top: 76,
          fontSize: 82,
          lineHeight: 0.92,
          fontWeight: 950,
          width: 900,
          opacity: progress(frame, 180, 228),
          transform: `translateY(${interpolate(progress(frame, 180, 228), [0, 1], [50, 0])}px)`
        }}
      >
        推荐结果
        <br />
        直接上屏
      </div>
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 285,
          border: `3px solid ${palette.ink}`,
          borderRadius: 999,
          background: palette.coral,
          color: palette.surface,
          padding: "15px 24px",
          fontSize: 31,
          fontWeight: 950,
          opacity: progress(frame, 212, 260)
        }}
      >
        15秒看清方向
      </div>
      <ChinesePhone frame={frame} />
    </AbsoluteFill>
  );
}

function Finale({ frame }: { frame: number }) {
  const reveal = progress(frame, 344, 404);
  const { height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ opacity: progress(frame, 330, 360), background: palette.greenDark, color: palette.paper }}>
      <Img
        src={src(assetPaths.hero)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.3,
          transform: `scale(${1.08 + progress(frame, 330, 450) * 0.05})`
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,63,45,0.98), rgba(7,63,45,0.72))" }} />
      <Texture />
      <div
        style={{
          position: "absolute",
          left: 68,
          top: 135,
          fontSize: 30,
          letterSpacing: 3,
          fontWeight: 950,
          color: "#d8efe4",
          opacity: reveal
        }}
      >
        KOREA UNIVERSITY LINK
      </div>
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 270,
          width: 880,
          fontSize: 132,
          lineHeight: 0.86,
          fontWeight: 950,
          opacity: reveal,
          transform: `translateY(${interpolate(reveal, [0, 1], [76, 0])}px)`
        }}
      >
        韩国大学
        <br />
        一屏做决定
      </div>
      <div style={{ position: "absolute", left: 70, top: 628, width: 780, color: "#d8efe4", fontSize: 34, lineHeight: 1.26, fontWeight: 850, opacity: progress(frame, 372, 420) }}>
        择校、TOPIK、费用、申请路径、案例参考，一次看清。
      </div>
      <div style={{ position: "absolute", left: 72, bottom: 152, display: "flex", flexWrap: "wrap", gap: 14, opacity: progress(frame, 388, 430) }}>
        {["大学推荐", "费用估算", "申请路径", "案例参考"].map((label, index) => (
          <div
            key={label}
            style={{
              border: `3px solid ${palette.ink}`,
              borderRadius: 999,
              background: [palette.yellow, palette.mint, palette.pink, palette.lavender][index],
              color: palette.ink,
              padding: "16px 24px",
              fontSize: 28,
              fontWeight: 950
            }}
          >
            {label}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: height * 0.055, background: "rgba(248,248,245,0.08)" }} />
    </AbsoluteFill>
  );
}

export const KoreaLinkShortCn = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ fontFamily, background: palette.paper }}>
      <Opening frame={frame} />
      <SignalBurst frame={frame} />
      <Product frame={frame} />
      <Finale frame={frame} />
    </AbsoluteFill>
  );
};
