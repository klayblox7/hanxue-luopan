import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const universitySource = readFileSync(new URL("src/data/universities.ts", root), "utf8");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function field(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*"([^"]*)"`));
  return match?.[1] ?? "";
}

function numberField(block, name) {
  const match = block.match(new RegExp(`${name}:\\s*(\\d+)`));
  return match ? Number(match[1]) : 0;
}

const universities = [...universitySource.matchAll(/\{\s*no:[\s\S]*?\n\s*\}/g)].map((match) => {
  const block = match[0];
  return {
    no: numberField(block, "no"),
    nameCn: field(block, "nameCn"),
    nameKr: field(block, "nameKr"),
    nameEn: field(block, "nameEn"),
    city: field(block, "city"),
    type: field(block, "type"),
    focus: field(block, "focus"),
    updatedAt: field(block, "updatedAt")
  };
}).filter((university) => university.no > 0);

function shell({ title, body, extraStyle = "" }) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}｜韩学罗盘</title>
    <style>
      :root {
        --paper: #fbfbf8;
        --ink: #0a0a0a;
        --muted: #66645d;
        --panel: #f0eee6;
        --yellow: #ffe07a;
        --mint: #a4d4c5;
        --pink: #ffd0d8;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        background: var(--paper);
        color: var(--ink);
        font-family:
          "Microsoft YaHei UI", "Microsoft YaHei", "微软雅黑", "PingFang SC", "Noto Sans CJK SC",
          "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, "MS Gothic", "Malgun Gothic", Inter,
          system-ui, -apple-system, sans-serif;
      }

      a { color: inherit; text-decoration: none; }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        min-height: 7rem;
        padding: 1rem 2rem;
        border-bottom: 1px solid var(--ink);
      }

      .logo {
        width: 5rem;
        height: 5rem;
        object-fit: contain;
      }

      .nav {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      .pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--ink);
        border-radius: 999px;
        padding: 0.5rem 1rem;
        font-size: 1.25rem;
        font-weight: 700;
        line-height: 1;
      }

      .yellow { background: var(--yellow); }
      .mint { background: var(--mint); }
      .pink { background: var(--pink); }

      .wrap {
        width: min(1120px, calc(100% - 2rem));
        margin: 0 auto;
        padding: 2.5rem 0 4rem;
      }

      .back {
        display: inline-flex;
        border: 1px solid var(--ink);
        border-radius: 999px;
        padding: 0.55rem 0.9rem;
        font-weight: 700;
      }

      h1 {
        margin: 2rem 0 0;
        font-size: clamp(2.5rem, 7vw, 5.5rem);
        line-height: 0.95;
        letter-spacing: 0;
      }

      .lead {
        max-width: 46rem;
        margin: 1rem 0 0;
        color: var(--muted);
        font-size: 1.05rem;
        line-height: 1.8;
      }

      ${extraStyle}

      @media (max-width: 720px) {
        .header { min-height: auto; padding: 0.75rem 1rem; }
        .logo { width: 4rem; height: 4rem; }
        .nav { gap: 0.35rem; }
        .pill { padding: 0.5rem 0.65rem; font-size: 0.9rem; }
      }
    </style>
  </head>
  <body>
    <header class="header">
      <a href="./hanxue-luopan-home.html" aria-label="韩学罗盘">
        <img class="logo" src="./public/hanxue-luopan-logo.png" alt="韩学罗盘" />
      </a>
      <nav class="nav" aria-label="主导航">
        <a class="pill yellow" href="./exchange-rate.html">汇率</a>
        <a class="pill mint" href="./korea-overview.html">韩国概况</a>
        <a class="pill pink" href="./about.html">关于我们</a>
      </nav>
    </header>
    ${body}
  </body>
</html>`;
}

const universityRows = universities
  .map(
    (university) => `<tr>
              <td>${university.no}</td>
              <td>
                <strong>${escapeHtml(university.nameCn)}</strong>
                <span>${escapeHtml(university.nameKr)} · ${escapeHtml(university.nameEn)}</span>
              </td>
              <td>${escapeHtml(university.city)}</td>
              <td>${escapeHtml(university.type)}</td>
              <td>${escapeHtml(university.focus)}</td>
              <td><span class="badge">待核验 · ${escapeHtml(university.updatedAt)}</span></td>
            </tr>`
  )
  .join("\n");

const universitiesHtml = shell({
  title: "韩国大学库",
  extraStyle: `
      table {
        width: 100%;
        margin-top: 2rem;
        border-collapse: collapse;
        background: #fffefb;
        border: 1px solid var(--ink);
      }

      th,
      td {
        border-bottom: 1px solid var(--ink);
        padding: 0.8rem 0.9rem;
        text-align: left;
        vertical-align: top;
      }

      th {
        background: var(--panel);
        font-size: 0.82rem;
      }

      td span {
        display: block;
        margin-top: 0.25rem;
        color: var(--muted);
        font-size: 0.82rem;
      }

      .badge {
        display: inline-flex;
        border: 1px solid #d8ceb5;
        border-radius: 999px;
        background: #f5f0e0;
        padding: 0.3rem 0.55rem;
        color: var(--muted);
        font-size: 0.78rem;
        font-weight: 700;
        white-space: nowrap;
      }

      @media (max-width: 880px) {
        table { font-size: 0.85rem; }
        th:nth-child(3), td:nth-child(3),
        th:nth-child(6), td:nth-child(6) { display: none; }
      }
  `,
  body: `<main class="wrap">
      <a class="back" href="./hanxue-luopan-home.html">返回首页</a>
      <h1>韩国大学库</h1>
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>学校</th>
            <th>城市</th>
            <th>类型</th>
            <th>方向参考</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
            ${universityRows}
        </tbody>
      </table>
    </main>`
});

const placeholderPages = [
  ["exchange-rate.html", "汇率", "人民币与韩元汇率入口后续会接入实时或定期更新的参考数据。"],
  ["korea-overview.html", "韩国概况", "这里将整理韩国城市、学制、签证、住宿和生活信息。"],
  ["about.html", "关于我们", "韩学罗盘会把官方信息、学校信息、人民币估算和学生经验分层展示。"],
  ["topik.html", "TOPIK考试", "TOPIK等级、费用、考点、备考路线和大学申请关系将在这里扩展。"],
  ["cost.html", "留学费用", "首尔/非首尔、国立/私立、宿舍/租房预算将在这里扩展。"],
  ["korean-learning.html", "韩语学习", "从零基础到TOPIK 6级的学习路线将在这里扩展。"],
  ["scholarships.html", "奖学金", "政府奖学金、学校奖学金和TOPIK等级奖学金将在这里扩展。"],
  ["application.html", "申请路线", "本科、插班、研究生、语学院、艺术类申请路径将在这里扩展。"],
  ["agency-check.html", "自申 vs 中介", "判断自己是否适合自己申请的工具将在这里扩展。"]
];

mkdirSync(root, { recursive: true });
writeFileSync(new URL("universities.html", root), universitiesHtml, "utf8");

for (const [fileName, title, description] of placeholderPages) {
  writeFileSync(
    new URL(fileName, root),
    shell({
      title,
      body: `<main class="wrap">
      <a class="back" href="./hanxue-luopan-home.html">返回首页</a>
      <h1>${escapeHtml(title)}</h1>
      <p class="lead">${escapeHtml(description)}</p>
    </main>`
    }),
    "utf8"
  );
}
