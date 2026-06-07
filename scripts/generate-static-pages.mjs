import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

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
    totalStudents: field(block, "totalStudents") || "",
    foreignStudents: field(block, "foreignStudents") || "",
    dormitoryCapacity: field(block, "dormitoryCapacity") || "",
    dormitoryRate: field(block, "dormitoryRate") || "",
    updatedAt: field(block, "updatedAt")
  };
}).filter((university) => university.no > 0);

const regionFilters = [
  { key: "seoul", label: "首尔", cities: ["首尔"] },
  { key: "gyeonggi", label: "浜暱閬?", cities: ["姘村師", "城南", "榫欎粊", "安城", "瀵屽窛", "高阳", "ERICA"] },
  { key: "incheon", label: "浠佸窛", cities: ["浠佸窛"] },
  { key: "busan", label: "閲滃北", cities: ["閲滃北"] },
  { key: "daegu", label: "澶ч偙", cities: ["澶ч偙"] },
  { key: "gwangju", label: "鍏夊窞", cities: ["鍏夊窞"] },
  { key: "daejeon", label: "澶х敯", cities: ["澶х敯"] },
  { key: "ulsan", label: "钄氬北", cities: ["钄氬北"] },
  { key: "sejong", label: "涓栧畻", cities: ["涓栧畻"] },
  { key: "gangwon", label: "姹熷師閬?", cities: ["鏄ュ窛"] },
  { key: "chungbuk", label: "蹇犳竻鍖楅亾", cities: ["娓呭窞"] },
  { key: "chungnam", label: "蹇犳竻鍗楅亾", cities: ["澶╁畨", "鐗欏北"] },
  { key: "jeonbuk", label: "鍏ㄧ綏鍖楅亾", cities: ["鍏ㄥ窞", "鐩婂北"] },
  { key: "gyeongbuk", label: "搴嗗皻鍖楅亾", cities: ["搴嗗北", "浦项"] },
  { key: "jeju", label: "娴庡窞閬?", cities: ["娴庡窞"] }
];

function regionsForCity(city) {
  const regions = regionFilters
    .filter((region) => region.cities.some((cityName) => city.includes(cityName)))
    .map((region) => region.key);

  return [...new Set(regions.length > 0 ? regions : ["unknown"])];
}

const regionButtons = regionFilters
  .map(
    (region) =>
      `<button class="category-button region-filter" type="button" data-filter="region:${region.key}" aria-pressed="false">${region.label}</button>`
  )
  .join("\n          ");

const koreaRankingSourceUrl = "https://www.timeshighereducation.com/student/best-universities/best-universities-south-korea";

function koreaRank(sort, tableLabel = String(sort)) {
  const isTie = tableLabel.startsWith("=");
  const rankNumber = isTie ? tableLabel.slice(1) : tableLabel;

  return {
    sort,
    tableLabel,
    noteLabel: `${isTie ? "并列" : ""}第${rankNumber}名`
  };
}

const koreaRankings = new Map([
  ["棣栧皵澶у", koreaRank(1)],
  ["闊╁浗绉戝鎶€术院", koreaRank(2)],
  ["寤朵笘澶у", koreaRank(3)],
  ["鎴愬潎棣嗗ぇ瀛?", koreaRank(4)],
  ["楂樹附澶у", koreaRank(6)],
  ["姹夐槼澶у", koreaRank(8, "=8")],
  ["搴嗙啓澶у", koreaRank(8, "=8")],
  ["涓栧畻澶у", koreaRank(8, "=8")],
  ["浜氭床澶у", koreaRank(12, "=12")],
  ["涓ぎ澶у", koreaRank(12, "=12")],
  ["姊ㄨ姳濂冲瓙澶у", koreaRank(15, "=15")],
  ["鍢夋硥澶у", koreaRank(15, "=15")],
  ["寤哄浗澶у", koreaRank(15, "=15")],
  ["搴嗗寳澶у", koreaRank(15, "=15")],
  ["閲滃北澶у", koreaRank(15, "=15")],
  ["钄氬北澶у", koreaRank(15, "=15")],
  ["宀崡澶у", koreaRank(15, "=15")],
  ["鍔犲浘绔嬪ぇ瀛?", koreaRank(22)],
  ["鍏ㄥ崡澶у", koreaRank(23, "=23")],
  ["浠佽嵎澶у", koreaRank(23, "=23")],
  ["鍏ㄥ寳澶у", koreaRank(23, "=23")],
  ["瑗挎睙澶у", koreaRank(23, "=23")],
  ["蹇犲寳澶у", koreaRank(27, "=27")],
  ["蹇犲崡澶у", koreaRank(27, "=27")],
  ["棣栧皵甯傜珛澶у", koreaRank(27, "=27")],
  ["娴庡窞澶у", koreaRank(30, "=30")],
  ["姹熷師澶у", koreaRank(30, "=30")],
  ["鍥芥皯澶у", koreaRank(30, "=30")],
  ["閲滃簡澶у", koreaRank(30, "=30")],
  ["棣栧皵绉戝鎶€鏈ぇ瀛?", koreaRank(30, "=30")],
  ["椤哄ぉ涔″ぇ瀛?", koreaRank(30, "=30")],
  ["妾€鍥藉ぇ瀛?", koreaRank(40, "=40")]
]);

function rankingForUniversity(university) {
  const ranking = koreaRankings.get(university.nameCn);

  return (
    ranking ?? {
      sort: 9999,
      tableLabel: "*",
      noteLabel: "*"
    }
  );
}

const shellNavLinks = [
  { file: "universities.html", label: "&#38889;&#22269;&#22823;&#23398;&#24211; <span class=\"nav-suffix\">&#65288;&#30452;&#21319;&#65289;</span>", color: "pink" },
  { file: "application.html", label: "&#22269;&#20869;+&#38889;&#22269;&#39033;&#30446;", color: "mint" },
  { file: "topik.html", label: "&#38889;&#35821;(TOPIK)", color: "green", aliases: ["korean-learning.html"] },
  { file: "cost.html", label: "&#30041;&#23398;&#36153;&#29992; <span class=\"nav-suffix\">&#65288;&#22870;&#23398;&#37329;&#65289;</span>", color: "yellow" },
  { file: "exchange-rate.html", label: "&#27719;&#29575;", color: "yellow" }
];

function shellNav(activePath = "") {
  return shellNavLinks
    .map((link) => {
      const active = activePath === link.file || link.aliases?.includes(activePath);
      return `<a class="pill ${link.color}${active ? " active" : ""}" href="./${link.file}">${link.label}</a>`;
    })
    .join("\n        ");
}

function shell({ title, body, extraStyle = "", headerTitle = title, activePath = "" }) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title + "\uFF5C\u97E9\u5B66\u7F57\u76D8")}</title>
    <style>
      :root {
        --paper: #fbfbf8;
        --surface: #fffefb;
        --ink: #0a0a0a;
        --muted: #66645d;
        --panel: #f0eee6;
        --yellow: #ffe07a;
        --mint: #a4d4c5;
        --pink: #ffd0d8;
        --green: #71d39b;
        --peach: #ffb084;
        --coral: #ff6b5a;
      }

      * { box-sizing: border-box; }

      html {
        overflow-y: scroll;
        scrollbar-gutter: stable;
      }

      body {
        margin: 0;
        background: var(--paper);
        color: var(--ink);
        font-family:
          "Microsoft YaHei UI", "Microsoft YaHei", "寰蒋闆呴粦", "PingFang SC", "Noto Sans CJK SC",
          "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, "MS Gothic", "Malgun Gothic", Inter,
          system-ui, -apple-system, sans-serif;
      }

      a { color: inherit; text-decoration: none; }

      .header {
        position: sticky;
        top: 0;
        z-index: 50;
        padding: 1rem 4rem;
        background: var(--paper);
        border-bottom: 1px solid var(--ink);
      }

      .header-inner {
        display: grid;
        min-height: 5rem;
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
        gap: 1rem;
      }

      .logo {
        display: block;
        width: 6.5rem;
        height: 5rem;
        object-fit: contain;
      }

      .header-title {
        min-width: 12rem;
        overflow: hidden;
        padding-left: 1rem;
        font-size: clamp(1.11rem, 1.92vw, 2.1rem);
        font-weight: 900;
        line-height: 1;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .nav {
        display: flex;
        max-width: min(72rem, calc(100vw - 11rem));
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
        justify-content: flex-end;
      }

      .pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--ink);
        border-radius: 999px;
        padding: 0.45rem 0.72rem;
        font-size: 0.95rem;
        font-weight: 800;
        line-height: 1;
        background: #ffffff;
      }

      .yellow { background: var(--yellow); }
      .mint { background: var(--mint); }
      .pink { background: var(--pink); }
      .green { background: var(--green); }
      .peach { background: var(--peach); }

      .pill { background: #ffffff; }
      .pill.pink.active,
      .pill.pink:hover,
      .pill.pink:focus { background: var(--pink); }
      .pill.green.active,
      .pill.green:hover,
      .pill.green:focus { background: var(--green); }
      .pill.yellow.active,
      .pill.yellow:hover,
      .pill.yellow:focus { background: var(--yellow); }
      .pill.mint.active,
      .pill.mint:hover,
      .pill.mint:focus { background: var(--mint); }
      .pill.peach.active,
      .pill.peach:hover,
      .pill.peach:focus { background: var(--peach); }
      .nav-suffix { font-size: 0.85em; font-style: italic; font-weight: 400; }

      .wrap {
        width: calc(100% - 25rem);
        margin: 0 auto;
        padding: 1.25rem 0 4rem;
      }

      .back {
        display: inline-flex;
        background: var(--surface);
        border: 1px solid var(--ink);
        border-radius: 0;
        padding: 0.55rem 0.9rem;
        font-weight: 700;
      }

      .page-actionbar {
        display: flex;
        justify-content: flex-end;
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

      .nav .pill:not(.active) { background: #ffffff; }
      .nav .pill.pink.active,
      .nav .pill.pink:hover,
      .nav .pill.pink:focus { background: var(--pink); }
      .nav .pill.green.active,
      .nav .pill.green:hover,
      .nav .pill.green:focus { background: var(--green); }
      .nav .pill.yellow.active,
      .nav .pill.yellow:hover,
      .nav .pill.yellow:focus { background: var(--yellow); }
      .nav .pill.mint.active,
      .nav .pill.mint:hover,
      .nav .pill.mint:focus { background: var(--mint); }
      .nav .pill.peach.active,
      .nav .pill.peach:hover,
      .nav .pill.peach:focus { background: var(--peach); }
      .nav-suffix { font-size: 0.85em; font-style: italic; font-weight: 400; }

      /* Fixed desktop shortcut navigation */
      @media (min-width: 721px) {
        .header .header-inner {
          display: grid;
          grid-template-columns: 6.5rem minmax(0, 1fr) auto;
        }

        .nav {
          position: absolute;
          top: 2.3rem;
          right: 4rem;
          width: min(53rem, calc(100vw - 13rem));
          max-width: none;
          flex-wrap: nowrap;
          justify-content: flex-end;
          justify-self: end;
        }

        .nav > .pill {
          flex: 0 0 auto;
          height: 2.35rem;
          min-height: 0;
          padding: 0;
          white-space: nowrap;
        }

        .nav > .pill:nth-child(1) { width: 11.4rem; }
        .nav > .pill:nth-child(2) { width: 9.4rem; }
        .nav > .pill:nth-child(3) { width: 10.6rem; }
        .nav > .pill:nth-child(4) { width: 12.4rem; }
        .nav > .pill:nth-child(5) { width: 5.6rem; }
      }

      @media (max-width: 720px) {
        .header { padding: 0.75rem 1rem; }
        .header-inner { min-height: auto; grid-template-columns: auto 1fr; }
        .logo { width: 4.9rem; height: 3.75rem; }
        .header-title { min-width: 0; padding-left: 0; font-size: 0.69rem; }
        .nav {
          grid-column: 1 / -1;
          display: flex;
          max-width: none;
          margin: 0 -1rem;
          overflow-x: auto;
          flex-wrap: nowrap;
          gap: 0.4rem;
          justify-content: flex-start;
          padding: 0.25rem 1rem 0.2rem;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .nav::-webkit-scrollbar { display: none; }
        .pill {
          flex: 0 0 auto;
          min-height: 2.5rem;
          padding: 0.5rem 0.7rem;
          font-size: 0.86rem;
        }
        .wrap {
          width: calc(100% - 1.5rem);
          padding-top: 1rem;
          padding-bottom: calc(4rem + env(safe-area-inset-bottom));
        }
      }

      @media (max-width: 640px) {
        .table-wrap {
          overflow-x: visible;
        }
        .table-wrap table {
          display: block;
          min-width: 0 !important;
        }
        .table-wrap thead {
          display: none;
        }
        .table-wrap tbody,
        .table-wrap tr,
        .table-wrap td {
          display: block;
          width: 100%;
        }
        .table-wrap tr {
          border-bottom: 1px solid var(--ink);
        }
        .table-wrap tr:last-child {
          border-bottom: 0;
        }
        .table-wrap td {
          border-bottom: 0;
          padding: 0.75rem 0.9rem;
        }
        .table-wrap td:first-child {
          font-weight: 900;
        }
      }
      /* Image back-to-top control */
      .back-to-top-button {
        position: fixed;
        right: 4.25rem;
        bottom: 1.25rem;
        z-index: 90;
        display: block;
        width: 5.1rem;
        border: 0;
        background: transparent;
        padding: 0;
        cursor: pointer;
      }

      .back-to-top-button img {
        display: block;
        width: 100%;
        height: auto;
        object-fit: contain;
        pointer-events: none;
      }

      .back-to-top-button:hover,
      .back-to-top-button:focus,
      .back-to-top-button:active {
        background: transparent;
      }

      .back-to-top-button:focus {
        outline: none;
      }

      .back-to-top-button:focus-visible {
        border-radius: 0.75rem;
        outline: 2px solid var(--ink, #0a0a0a);
        outline-offset: 0.25rem;
      }

      @media (max-width: 720px) {
        .back-to-top-button {
          right: 0.75rem;
          bottom: calc(0.75rem + env(safe-area-inset-bottom));
          width: 4.08rem;
        }
      }

    
      /* header-lock: keep page headers aligned across every module */
      .nav-suffix {
        font-size: 0.85em;
        font-style: italic;
        font-weight: 400;
      }

      @media (min-width: 721px) {
        .header {
          padding: 1rem 4rem;
        }
        .header .header-inner {
          display: grid;
          min-height: 5rem;
          grid-template-columns: 6.5rem minmax(0, 1fr) auto;
          align-items: center;
          gap: 1rem;
        }
        .header .logo,
        .header img.logo {
          width: 6.5rem;
          height: 5rem;
          object-fit: contain;
        }
        .header .header-title {
          min-width: 12rem;
          overflow: hidden;
          padding-left: 1rem;
          font-size: clamp(1.11rem, 1.92vw, 2.1rem);
          font-weight: 900;
          line-height: 1;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .header .nav,
        .header .top-nav {
          position: absolute;
          top: 2.3rem;
          right: 4rem;
          width: min(53rem, calc(100vw - 13rem));
          max-width: none;
          flex-wrap: nowrap;
          justify-content: flex-end;
          justify-self: end;
        }
        .header .nav > .pill,
        .header .top-nav > .nav-pill {
          flex: 0 0 auto;
          height: 2.35rem;
          min-height: 0;
          padding: 0;
          white-space: nowrap;
        }
        .header .nav > .pill:nth-child(1),
        .header .top-nav > .nav-pill:nth-child(1) { width: 11.4rem; }
        .header .nav > .pill:nth-child(2),
        .header .top-nav > .nav-pill:nth-child(2) { width: 9.4rem; }
        .header .nav > .pill:nth-child(3),
        .header .top-nav > .nav-pill:nth-child(3) { width: 10.6rem; }
        .header .nav > .pill:nth-child(4),
        .header .top-nav > .nav-pill:nth-child(4) { width: 12.4rem; }
        .header .nav > .pill:nth-child(5),
        .header .top-nav > .nav-pill:nth-child(5) { width: 5.6rem; }
      }

      @media (max-width: 980px) {
        .header {
          padding: 0.85rem 1rem;
        }
        .header .header-inner {
          min-height: auto;
          grid-template-columns: auto 1fr;
        }
        .header .logo,
        .header img.logo {
          width: 4.9rem;
          height: 3.75rem;
        }
        .header .header-title {
          min-width: 0;
          padding-left: 0;
          font-size: 0.69rem;
        }
        .header .nav,
        .header .top-nav {
          grid-column: 1 / -1;
          position: static;
          width: auto;
          max-width: none;
          margin: 0 -1rem;
          padding: 0.25rem 1rem 0.15rem;
          flex-wrap: nowrap;
          justify-content: flex-start;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
      }

    
      /* header-lock-pill: normalize nav pill height across modules */
      .header .nav > .pill,
      .header .top-nav > .nav-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.15rem;
        font-size: 0.95rem;
        line-height: 1;
      }

      @media (max-width: 980px) {
        .header .nav > .pill,
        .header .top-nav > .nav-pill {
          flex: 0 0 auto;
          height: 2.35rem;
          min-height: 0;
          padding: 0 0.72rem;
          white-space: nowrap;
        }
      }

    
      /* final-header-lock: absolute header geometry, based on application/cost pages */
      .nav-suffix {
        font-size: 0.85em !important;
        font-style: italic !important;
        font-weight: 400 !important;
      }

      @media (min-width: 981px) {
        .header {
          position: sticky !important;
          top: 0 !important;
          height: 7.05rem !important;
          min-height: 7.05rem !important;
          padding: 1rem 4rem !important;
          box-sizing: border-box !important;
        }
        .header .header-inner {
          position: relative !important;
          display: block !important;
          width: 100% !important;
          max-width: none !important;
          height: 5rem !important;
          min-height: 5rem !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .header .logo,
        .header img.logo {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 6.5rem !important;
          height: 5rem !important;
          object-fit: contain !important;
        }
        .header .header-title {
          position: absolute !important;
          left: 8.5rem !important;
          top: 50% !important;
          width: calc(100vw - 18rem) !important;
          min-width: 0 !important;
          max-width: none !important;
          transform: translateY(-50%) !important;
          overflow: hidden !important;
          padding-left: 0 !important;
          font-size: clamp(1.11rem, 1.92vw, 2.1rem) !important;
          font-weight: 900 !important;
          line-height: 1 !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        .header .nav,
        .header .top-nav {
          position: absolute !important;
          top: 50% !important;
          right: 0 !important;
          width: 53rem !important;
          max-width: calc(100vw - 13rem) !important;
          height: 2.35rem !important;
          transform: translateY(-50%) !important;
          display: flex !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
          justify-content: flex-end !important;
          gap: 0.5rem !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
          scrollbar-width: auto !important;
        }
        .header .nav > .pill,
        .header .top-nav > .nav-pill {
          display: inline-flex !important;
          flex: 0 0 auto !important;
          box-sizing: border-box !important;
          align-items: center !important;
          justify-content: center !important;
          gap: normal !important;
          height: 2.35rem !important;
          min-height: 0 !important;
          padding: 0 !important;
          font-size: 0.95rem !important;
          line-height: 1 !important;
          white-space: nowrap !important;
        }
        .header .nav > .pill:nth-child(1),
        .header .top-nav > .nav-pill:nth-child(1) { width: 11.4rem !important; }
        .header .nav > .pill:nth-child(2),
        .header .top-nav > .nav-pill:nth-child(2) { width: 9.4rem !important; }
        .header .nav > .pill:nth-child(3),
        .header .top-nav > .nav-pill:nth-child(3) { width: 10.6rem !important; }
        .header .nav > .pill:nth-child(4),
        .header .top-nav > .nav-pill:nth-child(4) { width: 12.4rem !important; }
        .header .nav > .pill:nth-child(5),
        .header .top-nav > .nav-pill:nth-child(5) { width: 5.6rem !important; }
      }

      @media (max-width: 980px) {
        .header {
          height: 9.25rem !important;
          min-height: 9.25rem !important;
          padding: 0.85rem 1rem !important;
          box-sizing: border-box !important;
        }
        .header .header-inner {
          position: relative !important;
          display: block !important;
          height: 4.25rem !important;
          min-height: 4.25rem !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .header .logo,
        .header img.logo {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 4.9rem !important;
          height: 3.75rem !important;
          object-fit: contain !important;
        }
        .header .header-title {
          position: absolute !important;
          left: 5.95rem !important;
          top: 1.9rem !important;
          width: calc(100vw - 7rem) !important;
          min-width: 0 !important;
          transform: translateY(-50%) !important;
          overflow: hidden !important;
          padding-left: 0 !important;
          font-size: 0.69rem !important;
          font-weight: 900 !important;
          line-height: 1 !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }
        .header .nav,
        .header .top-nav {
          position: absolute !important;
          left: -1rem !important;
          top: 4.65rem !important;
          width: calc(100vw) !important;
          max-width: none !important;
          height: 2.75rem !important;
          display: flex !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
          justify-content: flex-start !important;
          gap: 0.4rem !important;
          margin: 0 !important;
          padding: 0.25rem 1rem 0.15rem !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          transform: none !important;
          -webkit-overflow-scrolling: touch !important;
          scrollbar-width: none !important;
        }
        .header .nav > .pill,
        .header .top-nav > .nav-pill {
          display: inline-flex !important;
          flex: 0 0 auto !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0.15rem !important;
          height: 2.35rem !important;
          min-height: 0 !important;
          padding: 0 0.72rem !important;
          font-size: 0.95rem !important;
          line-height: 1 !important;
          white-space: nowrap !important;
        }
      }

    </style>
  </head>
  <body>
    <header class="header">
      <div class="header-inner">
        <a href="./hanxue-luopan-home.html" aria-label="韩学罗盘">
          <img class="logo" src="./public/korea-link-logo.gif" alt="韩学罗盘" />
        </a>
        <div class="header-title">${escapeHtml(headerTitle)}</div>
        <nav class="nav" aria-label="main navigation">
        ${shellNav(activePath)}
        </nav>
      </div>
    </header>
    ${body}
    <button class="back-to-top-button" type="button" onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" aria-label="Back to top">
      <img src="./public/top.webp" alt="" aria-hidden="true" />
    </button>
  </body>
</html>`;
}

const universityRows = universities
  .map(
    (university) => {
      const regions = regionsForCity(university.city);
      const ranking = rankingForUniversity(university);

      return `<tr data-list-order="${university.no}" data-rank="${ranking.sort}" data-rank-label="${escapeHtml(ranking.tableLabel)}" data-city="${escapeHtml(university.city)}" data-type="${escapeHtml(university.type)}" data-primary-region="${regions[0]}" data-regions="${regions.join(" ")}">
              <td>${escapeHtml(ranking.tableLabel)}</td>
              <td>
                <strong class="university-name">${escapeHtml(university.nameCn)}<span class="rank-note">${escapeHtml(ranking.noteLabel)}</span></strong>
                <span>${escapeHtml(university.nameKr)} 路 ${escapeHtml(university.nameEn)}</span>
              </td>
              <td>${escapeHtml(university.city)}</td>
              <td>${escapeHtml(university.type)}</td>
              <td>${escapeHtml(university.focus)}</td>
              <td>
                <strong class="student-count">${escapeHtml(university.totalStudents)}</strong>
                <span class="student-scope">(${escapeHtml(university.foreignStudents)})</span>
              </td>
              <td>
                <strong class="student-count">${escapeHtml(university.dormitoryCapacity)}</strong>
                <span class="student-scope">(${escapeHtml(university.dormitoryRate)})</span>
              </td>
            </tr>`;
    }
  )
  .join("\n");

const universitiesHtml = shell({
  title: "闊╁浗澶у搴?",
  activePath: "universities.html",
  extraStyle: `
      .wrap {
        width: calc(100% - 25rem);
      }

      .university-panel {
        width: 100%;
        margin: 0 auto;
      }

      .university-titlebar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 2rem;
      }

      .university-titlebar h1 {
        margin: 0;
        font-size: clamp(1.25rem, 3.5vw, 2.75rem);
      }

      .university-titlebar .back {
        flex: 0 0 auto;
      }

      .category-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 1.25rem;
      }

      .category-button {
        border: 1px solid var(--ink);
        border-radius: 999px;
        background: var(--surface);
        color: var(--ink);
        cursor: pointer;
        font: inherit;
        font-size: 0.82rem;
        font-weight: 700;
        line-height: 1;
        padding: 0.5rem 0.85rem;
      }

      .category-button[aria-pressed="true"] {
        background: var(--surface);
      }

      .category-region-sort {
        margin-left: auto;
      }

      .region-controls {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        gap: 0.5rem;
      }

      .region-filter {
        font-size: 0.78rem;
        padding: 0.45rem 0.75rem;
      }

      .ranking-note {
        margin: 0.75rem 0 0;
        color: var(--muted);
        font-size: 0.78rem;
        line-height: 1.6;
        text-align: right;
      }

      table {
        width: 100%;
        margin-top: 2rem;
        border-collapse: collapse;
        table-layout: fixed;
        background: #fffefb;
        border: 1px solid var(--ink);
      }

      th,
      td {
        border-bottom: 1px solid var(--ink);
        padding: 0.8rem 0.9rem;
        text-align: left;
        vertical-align: middle;
        word-break: keep-all;
        overflow-wrap: anywhere;
      }

      th {
        background: var(--panel);
        font-size: 1rem;
        font-weight: 800;
      }

      td span {
        display: block;
        margin-top: 0.25rem;
        color: var(--muted);
        font-size: 0.82rem;
      }

      .university-name .rank-note {
        display: none;
        margin: 0 0 0 0.35rem;
        color: var(--muted);
        font-size: 0.82em;
        font-style: italic;
        font-weight: 400;
      }

      .show-rank-note .university-name .rank-note {
        display: inline;
      }

      .student-head {
        display: block;
        line-height: 1.25;
      }

      .student-head span,
      .student-scope {
        display: block;
        margin-top: 0.2rem;
        color: var(--ink);
        font-weight: 400;
      }

      .student-count {
        display: block;
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
        .wrap {
          width: calc(100% - 1.5rem);
        }

        .university-panel {
          width: 100%;
        }

        .university-titlebar {
          align-items: flex-start;
        }

        .category-region-sort {
          margin-left: 0;
        }

        table {
          width: 100%;
          font-size: 0.85rem;
        }
        th:nth-child(3), td:nth-child(3) { display: none; }
      }
  `,
  body: `<main class="wrap">
      <section class="university-panel">
        <div class="university-titlebar">
          <a class="back" href="./hanxue-luopan-home.html">返回首页</a>
        </div>
        <div class="category-controls" aria-label="澶у鍒楄〃鍒嗙被">
          <button class="category-button" type="button" data-filter="rank" aria-pressed="true">澶у鎺掑悕</button>
          <button class="category-button" type="button" data-filter="national" aria-pressed="false">国立</button>
          <button class="category-button" type="button" data-filter="private" aria-pressed="false">私立</button>
          <button class="category-button category-region-sort" type="button" data-filter="region" aria-pressed="false">地区分类</button>
          <div class="region-controls" aria-label="闊╁浗鍦板尯绛涢€?>
          ${regionButtons}
          </div>
        </div>
        <table>
          <colgroup>
            <col style="width: 6%" />
            <col style="width: 28%" />
            <col style="width: 8.4%" />
            <col style="width: 10%" />
            <col style="width: 24%" />
            <col style="width: 11.8%" />
            <col style="width: 11.8%" />
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th>学校</th>
              <th>城市</th>
              <th>类型</th>
              <th>鏂瑰悜鍙傝€</th>
              <th><span class="student-head">瀛︾敓鏁?span>(澶栧浗浜?</span></span></th>
              <th><span class="student-head">学校宿舍<span>(占学生数)</span></span></th>
            </tr>
          </thead>
          <tbody>
              ${universityRows}
          </tbody>
        </table>
        <p class="ranking-note">澶у鎺掑悕锛?a href="${koreaRankingSourceUrl}" target="_blank" rel="noreferrer">THE World University Rankings 2026</a></p>
      </section>
      <script>
        (() => {
          const buttons = Array.from(document.querySelectorAll(".category-button"));
          const tbody = document.querySelector("tbody");
          const rows = Array.from(tbody.querySelectorAll("tr"));
          const regionOrder = new Map(${JSON.stringify(regionFilters.map((region, index) => [region.key, index]))});

          function applyFilter(filter) {
            buttons.forEach((button) => {
              button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
            });

            const [filterType, filterValue] = filter.split(":");

            const sortedRows = [...rows].sort((a, b) => {
              if (filter === "region") {
                const regionCompare =
                  (regionOrder.get(a.dataset.primaryRegion) ?? 999) -
                  (regionOrder.get(b.dataset.primaryRegion) ?? 999);
                if (regionCompare !== 0) return regionCompare;
              }
              const rankCompare = Number(a.dataset.rank) - Number(b.dataset.rank);
              if (rankCompare !== 0) return rankCompare;
              return Number(a.dataset.listOrder) - Number(b.dataset.listOrder);
            });

            let visibleIndex = 1;

            sortedRows.forEach((row) => {
              const type = row.dataset.type || "";
              const isNational = type.includes("国立") || type.includes("公立");
              const isPrivate = type.includes("私立");
              const regions = (row.dataset.regions || "").split(" ");
              const visible =
                filter === "rank" ||
                filter === "region" ||
                (filter === "national" && isNational) ||
                (filter === "private" && isPrivate) ||
                (filterType === "region" && regions.includes(filterValue));

              row.hidden = !visible;
              row.classList.toggle("show-rank-note", filter !== "rank");
              if (visible) {
                row.cells[0].textContent = filter === "rank" ? row.dataset.rankLabel : String(visibleIndex);
                visibleIndex += 1;
              }
              tbody.appendChild(row);
            });
          }

          buttons.forEach((button) => {
            button.addEventListener("click", () => applyFilter(button.dataset.filter));
          });

          applyFilter("rank");
        })();
      </script>
    </main>`
});

const topikResourceSections = [
  {
    tag: "2.1 免费网课",
    title: "鍏嶈垂缃戣璧勬簮锛堝叕鍏卞钩鍙扮被锛?",
    summary: "浠?B 绔欏拰瀹樻柟鍏紑骞冲彴涓轰富锛岃鐩栭浂鍩虹鍏ラ棬銆佷腑楂樼骇寮哄寲銆佺湡棰樿В鏋愬拰涓撻」鎶€宸э紝閫傚悎棰勭畻鏈夐檺銆佸熀纭€闃舵鎴栭渶瑕佽ˉ璇剧殑鑰冪敓銆?",
    rows: [
      ["绯荤粺璇剧▼", "《全400闆嗚嚜瀛﹂煩璇叏濂楁暀绋嬨€?", "瑷€瓒ｆ暀鑲?", "鍥涘崄闊炽€佸熀纭€璇硶銆佷腑楂樼骇璇硶銆佸父鐢ㄥ彛璇€佸惉璇绘妧宸т笌 TOPIK 棰樺瀷瑙ｆ瀽銆?", "适合0鍩虹鍒伴珮绾э紝浣滀负闀挎湡涓荤嚎璇俱€?"],
      ["绯荤粺璇剧▼", "銆?024鏈€缁嗚嚜瀛﹂煩璇叏濂楁暀绋嬨€?", "Candy韩语学姐", "浠庡彂闊冲埌 TOPIK 楂樼骇鐭ヨ瘑鐐癸紝璇炬椂鎷嗗垎鏇寸煭锛岀煡璇嗙偣鑺傚鏇磋交銆?", "閫傚悎闆跺熀纭€鍏ラ棬锛屾垨澶囪€冩椂闂村厖瑁曠殑瀛︾敓銆?"],
      ["鐪熼瑙ｆ瀽", "銆奣OPIK鍘嗗勾鐪熼瑙ｆ瀽銆?", "鐪熼瑙ｆ瀽璇剧▼", "鍥寸粫鍚姏銆侀槄璇汇€佸啓浣滅湡棰樿瑙ｉ鎬濊矾鍜屽父瑙侀櫡闃便€?", "閫傚悎寮哄寲鍜屽啿鍒洪樁娈碉紝閰嶅悎鐪熼璁粌銆?"],
      ["涓撻」鎶€宸?", "銆奣OPIK鍚姏/闃呰鏍稿績鎶€宸с€?", "鍏讳箰澶氳€佸笀", "鎸夐鍨嬫媶瑙ｅ惉鍔涘拰闃呰锛岃蹇€熷畾浣嶃€佸緱鍒嗙偣鍜岄珮棰戣€冪偣銆?", "閫傚悎鐭湡鍐插埡锛屾垨鐪熼璁粌闃舵琛ュ急椤广€?"],
      ["瀹樻柟鍏紑璇?", "銆婇煩璇叆闂ㄣ€?", "寤朵笘澶у璇闄?", "涓嫳鍙岃瀛楀箷锛屾寜寤朵笘鏁欐潗浣撶郴璁插彂闊炽€佸熀纭€璇硶鍜屽父鐢ㄤ細璇濄€?", "閫傚悎鎵撳熀纭€锛屽挨鍏舵槸鍙戦煶鍜屽叆闂ㄨ娉曘€?"],
      ["瀹樻柟鍏紑璇?", "TOPIK 澶囪€冭绋?", "闊╁浗鍥界珛鍥借闄?", "瑕嗙洊鍒濈骇鍒伴珮绾х殑鍚姏銆侀槄璇汇€佸啓浣滆缁冿紝閰嶅缁冧範鏇磋创杩戣€冭瘯銆?", "閫傚悎闇€瑕佹潈濞佽祫鏂欏拰鏍囧噯缁冧範鐨勫鐢熴€?"]
    ]
  },
  {
    tag: "2.2 付费网课",
    title: "浠樿垂缃戣璧勬簮锛堟満鏋?直播服务类）",
    summary: "浠樿垂璇鹃噸鐐硅ˉ瓒冲厤璐硅缂哄皯鐨勭粌涔犲弽棣堛€佷綔鏂囨壒鏀广€佸疄鏃剁瓟鐤戝拰妯℃嫙娴嬭瘎锛屾洿閫傚悎涓珮绾с€佸啿鍒洪樁娈垫垨鑷緥杈冨急鐨勮€冪敓銆?",
    rows: [
      ["综合冲刺", "TOPIK 鍐插埡鐝?", "沪江网校", "鐪熼璁茬粌銆佹妧宸у己鍖栥€佷笓椤硅缁冿紱鐩存挱+褰曟挱锛涢厤濂楃瓟鐤戙€佷綔鏂囩簿鎵广€佺湡棰樿В鏋愬拰妯℃嫙娴嬭瘯銆?", "閫傚悎鑰冨墠鍐插埡銆侀渶瑕佸啓浣滄壒鏀瑰拰绋冲畾鍙嶉鐨勫鐢熴€?"],
      ["鍏ㄧ▼浣撶郴", "韩语 TOPIK 鐩存挱璇?", "鏂颁笢鏂?", "鍩虹銆佸己鍖栥€佸啿鍒哄垎娈垫暀瀛︼紱閰嶇彮涓讳换鐫ｅ銆佸湪绾跨瓟鐤戙€佷綔鏂囨壒鏀瑰拰鍏ㄧ湡妯¤€冦€?", "閫傚悎鎯充粠鍩虹鍒拌€冭瘯绯荤粺鎺ㄨ繘锛屼笖鏈夌暀瀛﹁鍒掗渶姹傜殑瀛︾敓銆?"],
      ["写作专项", "TOPIK 涓骇鍐欎綔鐩存挱鐝?", "牙牙韩语", "鑱氱劍涓骇鍐欎綔棰樺瀷銆佷竾鑳藉啓浣滄鏋躲€佸彞瀛愮骇鎵规敼鍜屾枃绔犵粨鏋勮皟鏁淬€?", "适合 TOPIK 涓骇鍐欎綔钖勫急銆侀渶瑕佷笓椤规彁鍒嗙殑鑰冪敓銆?"]
    ]
  },
  {
    tag: "3.1 基础教材",
    title: "系统学习基础教材",
    summary: "鍩虹鏁欐潗璐熻矗鎼缓瀹屾暣鐭ヨ瘑浣撶郴锛岄€傚悎澶囪€冨墠鏈熸墦搴曘€傚缓璁€夋嫨涓€濂椾富绾挎暀鏉愬潥鎸佸瀹岋紝鍐嶇敤鐪熼鍜屼笓椤逛功琛ュ急椤广€?",
    rows: [
      ["主线教材", "銆婂欢涓栭煩鍥借銆?", "寤朵笘澶у闊╁浗璇鍫?", "鍏ㄥ6鍐岋紝瀵瑰簲 TOPIK1-6绾э紱璇嶆眹銆佽娉曘€佸惉鍔涖€侀槄璇汇€佸啓浣滀綋绯诲畬鏁达紝閰嶇粌涔犲唽鍜岄煶棰戙€?", "鏈€閫傚悎浣滀负绯荤粺瀛︿範涓绘暀鏉愩€?"],
      ["辅助教材", "銆婇灏斿ぇ瀛﹂煩鍥借銆?", "棣栧皵澶у璇█鏁欒偛闄?", "鍏ㄥ6鍐岋紝鍋忓疄鐢ㄥ満鏅拰鍙ｈ琛ㄨ揪锛岃娉曡瑙ｉ€氫織锛岄厤鍚姏闊抽銆?", "閫傚悎鍒濆鑰呰緟鍔╁涔狅紝灏ゅ叾鏄彛璇満鏅ˉ鍏呫€?"],
      ["璇硶琛ュ己", "銆婃柊鏍囧噯闊╁浗璇€?", "闊╁浗澶栧浗璇ぇ瀛﹁瑷€鏁欒偛闄?", "鍏奸【鑰冭瘯棰樺瀷鍜岃瑷€杩愮敤锛岃娉曡В閲婃洿缁嗭紝璇惧悗缁冧範瑙ｆ瀽杈冨畬鏁淬€?", "閫傚悎鑷鑰冪敓锛屾垨璇硶鐞嗚В鍥伴毦鐨勫鐢熴€?"]
    ]
  },
  {
    tag: "3.2 专项教材",
    title: "TOPIK 考试专项教材",
    summary: "涓撻」鏁欐潗鐢ㄤ簬鐔熸倝棰樺瀷銆佽缁冨仛棰樿妭濂忓拰鎻愬崌鍗曢」鍒嗘暟锛岄€傚悎瀹屾垚鍩虹瀛︿範鍚庤繘鍏ュ己鍖栨垨鍐插埡闃舵浣跨敤銆?",
    rows: [
      ["官方真题", "TOPIK 瀹樻柟鏁欑▼鍙婄湡棰橀泦", "鍥界珛鍥介檯鏁欒偛闄?", "鏈€璐磋繎鑰冭瘯鍛介閫昏緫锛岄€傚悎鍋氶檺鏃舵ā鑰冦€侀敊棰樺垎鏋愬拰棰樺瀷鐔熸倝銆?", "鍐插埡闃舵蹇呯粌锛屼紭鍏堢骇鏈€楂樸€?"],
      ["鑰冨墠鎶€宸?", "銆婃柊闊╁浗璇兘鍔涜€冭瘯鑰冨墠瀵圭瓥銆?", "TOPIK专项教研资料", "鍒嗗垵绾с€佷腑楂樼骇锛岃鍚勯鍨嬪揩閫熻В棰樻妧宸с€佸鑰冪瓥鐣ュ拰鍏ㄧ湡妯℃嫙銆?", "适合考前1-3涓湀涓撻」寮哄寲銆?"],
      ["单项突破", "TOPIK 璇嶆眹/语法/闃呰/写作", "涓撻」澶囪€冩暀鏉?", "鎸夎瘝姹囥€佽娉曘€侀槄璇汇€佸啓浣滄媶鍒嗭紝楂橀鑰冪偣鍜屼腑鏂囪В鏋愭洿璐村悎涓浗鑰冪敓銆?", "閫傚悎寮哄寲闃舵鏌ョ己琛ユ紡锛屽挨鍏舵槸鍐欎綔鍜岄珮绾ц娉曘€?"]
    ]
  }
];

const undergraduateTopikPlan = [
  ["(T1) 棣栧皵銆佸欢涓栥€侀珮涓姐€並AIST", 5, 6, "热门专业尽量6", "level-red"],
  ["(T2) 鎴愬潎棣嗐€佹眽闃炽€佸簡鐔欍€佷腑澶€佹ⅷ鑺便€佽タ姹熴€佷笘瀹椼€侀嚋灞便€佸簡鍖椼€佷簹娲茬瓑", 4, 5, "热门专业建议5", "level-peach"],
  ["(T3) 澶栧ぇ銆佷笢鍥姐€佸缓鍥姐€佸紭鐩娿€佸浗姘戙€佸磭瀹炪€佸競绔嬨€佷粊鑽枫€佸繝鍗楃瓑", 3, 4, "4绾ф洿绋?", "level-yellow"],
  ["(T4) 涓潥鍥界绔?涓撲笟鐗硅壊闄㈡牎", 3, 4, "寤鸿3-4绾?", "level-mint"],
  ["(T5) 保底友好院校/语学院过渡", 2, 3, "或语学院结业", "level-green"]
];

const topikLevelAxis = [2, 3, 4, 5, 6];

const topikSites = [
  ["鍖椾含", "鍖椾含澶у銆佸寳浜伐鍟嗗ぇ瀛︺€佸寳浜鍥借澶у銆佹竻鍗庡ぇ瀛?"],
  ["涓婃捣", "涓婃捣澶栧浗璇ぇ瀛︺€佷笂娴峰ぇ瀛︺€佷笂娴峰笀鑼冨ぇ瀛?"],
  ["骞夸笢", "骞夸笢澶栬澶栬锤澶у銆佹繁鍦冲ぇ瀛?"],
  ["姹熻嫃", "鍗椾含澶у銆佷笢鍗楀ぇ瀛︺€佸崡浜笀鑼冨ぇ瀛︺€佹壃宸炲ぇ瀛︺€佹棤閿＄鎶€职业学院"],
  ["灞变笢", "涓浗娴锋磱澶у銆佸北涓滃ぇ瀛︺€佸北涓滅鎶€鑱屼笟瀛﹂櫌銆佺儫鍙板ぇ瀛?"],
  ["宸濇笣", "鍥涘窛澶у銆佹垚閮藉ぇ瀛︺€佽タ鍗楄储缁忓ぇ瀛︺€佸洓宸濆鍥借澶у"],
  ["涓滃寳", "澶ц繛澶栧浗璇ぇ瀛︺€佽窘瀹佸ぇ瀛︺€佹矆闃冲笀鑼冨ぇ瀛︺€佸悏鏋楀ぇ瀛︺€佸欢杈瑰ぇ瀛︺€侀粦榫欐睙澶у"],
  ["鍏朵粬", "澶╂触銆佹渤鍖椼€佹禉姹熴€佹箹鍖椼€侀檿瑗裤€佸畨寰姐€佺寤虹瓑鐪佸競鍧囨湁鑰冪偣"]
];

function topikTable(headers, rows) {
  return `<div class="table-wrap"><table>
    <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
    <tbody>${rows.join("")}</tbody>
  </table></div>`;
}

function topikSearchLink(site, keyword) {
  const q = encodeURIComponent(keyword);
  if (site === "bilibili") return `https://search.bilibili.com/all?keyword=${q}`;
  if (site === "jd") return `https://search.jd.com/Search?keyword=${q}`;
  return `http://search.dangdang.com/?key=${q}`;
}

function topikResourceMeta(kind, name, provider) {
  const text = `${kind} ${name} ${provider}`;

  if (text.includes("400")) {
    return { href: "https://www.bilibili.com/video/BV1PXrxYZEjy/", image: "./public/topik-resources/yanqu-400-cover.webp", cost: "0鍏?" };
  }
  if (text.includes("2024")) {
    return { href: "https://www.yanquedu.com/korean-teacher/37.html", image: "./public/topik-resources/candy-cover.webp", cost: "0鍏?" };
  }
  if (text.includes("TOPIK历年真题解析")) {
    return { href: "https://www.bilibili.com/video/BV1eM4y1L7jV/", image: "./public/topik-resources/topik-zhenti-cover.webp", cost: "0鍏?" };
  }
  if (text.includes("听力") || text.includes("阅读")) {
    return { href: "https://www.qtfm.cn/channels/232472/", image: "./public/topik-resources/yangleduo-cover.webp", cost: "0鍏?" };
  }
  if (text.includes("娌睙")) {
    return { href: "https://class.hujiang.com/category/134752", image: "./public/topik-resources/hujiang-topik-cover.svg", cost: "369鍏冭捣" };
  }
  if (text.includes("新东方")) {
    return { href: "https://www.koolearn.com/product/c_27_207302.html", image: "./public/topik-resources/koolearn-topik-cover.svg", cost: "2599鍏?" };
  }
  if (text.includes("鐗欑墮")) {
    return { href: "https://www.diliushixian.com/course/info/185.html", image: "./public/topik-resources/yaya-writing-cover.svg", cost: "4000鍏?" };
  }
  if (text.includes("延世大学语学院") || name.includes("韩语入门")) {
    return { href: "https://www.coursera.org/learn/learn-korean", image: "./public/topik-resources/yonsei-coursera-cover.webp", cost: "0鍏?" };
  }
  if (text.includes("韩国国立国语院")) {
    return { href: "https://www.korean.go.kr/", image: "./public/topik-resources/koreanlearners.svg", cost: "0鍏?" };
  }
  if (text.includes("官方教程") || text.includes("真题集")) {
    return { href: "https://item.jd.com/12706601.html", image: "./public/topik-resources/jd-topik-official.webp", cost: "45鍏冭捣" };
  }
  if (text.includes("延世韩国语")) {
    return { href: "https://item.jd.com/12318319.html", image: "./public/topik-resources/jd-yonsei-korean.webp", cost: "39鍏冭捣" };
  }
  if (text.includes("首尔大学韩国语")) {
    return { href: "https://item.jd.com/11652455.html", image: "./public/topik-resources/jd-snu-korean.webp", cost: "42鍏冭捣" };
  }
  if (text.includes("新标准韩国语")) {
    return { href: "https://item.jd.com/12950977.html", image: "./public/topik-resources/jd-standard-korean.webp", cost: "35鍏冭捣" };
  }
  if (text.includes("考前对策")) {
    return { href: "https://item.jd.com/13029458.html", image: "./public/topik-resources/jd-topik-strategy.webp", cost: "45鍏冭捣" };
  }
  if (text.includes("璇嶆眹/语法/闃呰/写作")) {
    return { href: "https://item.jd.com/14227433.html", image: "./public/topik-resources/jd-topik-vocab.webp", cost: "45鍏冭捣" };
  }

  return { href: topikSearchLink("bilibili", name), image: "./public/topik-resources/bilibili.svg", cost: "0鍏?" };
}

function topikResourceSection(section) {
  return `<article class="resource-section">
    <div class="resource-section-head">
      <div>
        <h3>${escapeHtml(section.title)}</h3>
      </div>
    </div>
    ${topikTable(
      ["类型", "浠ｈ〃璧勬簮", "鍥剧墖", "费用", "鏍稿績鍐呭", "鎺ㄨ崘浣跨敤"],
      section.rows.map(([kind, name, provider, content, use]) => {
        const meta = topikResourceMeta(kind, name, provider);
        return `<tr>
          <td>${escapeHtml(kind)}</td>
          <td><a class="resource-name" href="${escapeHtml(meta.href)}" target="_blank" rel="noreferrer">${escapeHtml(name)}</a><span class="resource-provider">${escapeHtml(provider)}</span></td>
          <td><a class="resource-thumb" href="${escapeHtml(meta.href)}" target="_blank" rel="noreferrer"><img src="${escapeHtml(meta.image)}" alt="${escapeHtml(name)}"></a></td>
          <td class="resource-cost">${escapeHtml(meta.cost)}</td>
          <td>${escapeHtml(content)}</td>
          <td>${escapeHtml(use)}</td>
        </tr>`;
      })
    )}
  </article>`;
}

const topikHtml = shell({
  title: "TOPIK考试",
  headerTitle: "韩语(TOPIK)",
  activePath: "topik.html",
  extraStyle: `
      .wrap {
        width: calc(100% - 25rem);
        padding-top: 1.875rem;
      }

      .page-guide {
        position: fixed;
        top: 9rem;
        left: 2.25rem;
        z-index: 30;
        display: flex;
        width: 10rem;
        min-height: 37.5rem;
        flex-direction: column;
        gap: 0.58rem;
        background: transparent;
        padding: 1.05rem 0.85rem;
        font-size: 0.73rem;
        font-style: italic;
        font-weight: 400;
        line-height: 1.45;
      }

      .page-guide a {
        display: inline-flex;
        align-items: flex-start;
        gap: 0.42rem;
        color: var(--ink);
        font-weight: 400;
        text-decoration: none;
      }

      .page-guide a::before {
        content: "";
        flex: 0 0 auto;
        width: 0.336rem;
        height: 0.336rem;
        margin-top: 0.46em;
        border-radius: 999px;
        background: var(--ink);
      }

      .page-guide a:hover,
      .page-guide a:focus {
        text-decoration: underline;
        text-underline-offset: 0.18rem;
      }

      .hero {
        display: grid;
        grid-template-columns: 1fr;
        gap: 2rem;
        border-top: 1px solid var(--ink);
        border-bottom: 1px solid var(--ink);
        margin-top: 2rem;
        padding: 2rem 0;
      }

      .eyebrow {
        color: var(--muted);
        font-size: 0.78rem;
        font-weight: 900;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }

      .summary {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        border: 1px solid var(--ink);
      }

      .summary-title {
        display: inline-flex;
        align-items: center;
        align-self: flex-start;
        margin: 0 0 1rem;
        padding: 0.5rem 1rem;
        border: 1px solid var(--ink);
        border-radius: 0;
        background: #fff3ad;
        font-size: clamp(0.64rem, 1.024vw, 0.96rem);
        font-weight: 900;
        line-height: 1;
      }

      .metric {
        border-right: 1px solid var(--ink);
        padding: 0.76rem 1rem;
      }

      .metric:nth-child(2) { border-right: 0; }

      .summary .pill {
        background: #f1f1ee;
        padding: 0.36rem 0.58rem;
        font-size: 0.76rem;
      }
      .summary .pill.green,
      .summary .pill.mint,
      .summary .pill.pink,
      .summary .pill.peach { background: #f1f1ee; }

      .metric:last-child { border-right: 0; }
      .metric strong { display: block; margin-top: 0.76rem; font-size: 1.24rem; line-height: 1; }
      .metric p { margin: 0.6rem 0 0; color: var(--muted); font-size: 0.8rem; line-height: 1.45; }

      .prep-scale-card {
        grid-column: span 4;
        display: grid;
        gap: 0.36rem;
        padding: 0.5rem 0.9rem;
        border-left: 1px solid var(--ink);
      }

      .prep-scale-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .prep-scale-note {
        font-size: 0.66rem;
        font-style: italic;
        font-weight: 400;
        line-height: 1.3;
      }

      .prep-track {
        display: flex;
        min-height: 3.35rem;
        border: 1px solid var(--ink);
        background: var(--surface);
      }

      .prep-segment {
        display: grid;
        align-content: center;
        gap: 0.28rem;
        min-width: 0;
        padding: 0.42rem 0.65rem;
        border-right: 1px solid var(--ink);
      }

      .prep-segment:last-child { border-right: 0; }
      .prep-segment.level-3 { flex-basis: 28.6%; background: #cdebdc; }
      .prep-segment.level-4 { flex-basis: 19%; background: #fff0a6; }
      .prep-segment.level-5 { flex-basis: 31%; background: #f4c6aa; }
      .prep-segment.level-6 { flex-basis: 21.4%; background: #f2aaa1; }
      .prep-main {
        display: flex;
        min-width: 0;
        align-items: center;
        gap: 0.45rem;
      }

      .level-badge {
        display: inline-flex;
        min-width: 2.35rem;
        height: 1.4rem;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--ink);
        border-radius: 999px;
        background: var(--surface);
        font-size: 0.78rem;
        font-weight: 900;
        line-height: 1;
      }

      .prep-segment .months { font-size: 1.06rem; font-weight: 900; line-height: 1; }
      .prep-segment .words { color: var(--muted); font-size: 0.72rem; line-height: 1.2; }

      .prep-axis {
        position: relative;
        display: block;
        height: 0.9rem;
        margin-top: -0.08rem;
        font-size: 0.68rem;
        font-weight: 900;
        line-height: 1;
      }

      .prep-axis span {
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        white-space: nowrap;
      }

      .prep-axis span:first-child { transform: translateX(0); }
      .prep-axis span:last-child { transform: translateX(-100%); }

      .section { margin-top: 1.875rem; }
      .topik-anchor { scroll-margin-top: 8.75rem; }
      .resources-section { margin-top: 2rem; }
      .section-head { border-top: 1px solid var(--ink); padding-top: 1.6rem; }
      .section-head h2 { margin: 0.4rem 0 0; font-size: clamp(2rem, 4vw, 3rem); line-height: 1; }
      .hero h1 { max-width: 68rem; font-size: clamp(3rem, 5.6vw, 4.8rem); }
      .hero .lead { max-width: 48rem; }

      .undergrad-plan {
        margin-top: 1.875rem;
        padding: 0;
      }

      .undergrad-plan .table-wrap {
        margin-top: 0;
      }

      .undergrad-titlebar {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .undergrad-titlebar h2 {
        margin: 0.4rem 0 0;
        font-size: clamp(1.8rem, 3.2vw, 2.8rem);
        line-height: 1;
      }

      .level-graph {
        min-width: 880px;
      }

      .level-row,
      .level-head {
        display: grid;
        grid-template-columns: 24rem 1fr 14.4rem;
      }

      .level-head {
        border-bottom: 1px solid var(--ink);
        background: #f1f1ee;
        font-size: 0.89rem;
        font-weight: 900;
      }

      .level-row {
        border-bottom: 1px solid var(--ink);
      }

      .level-row:last-child {
        border-bottom: 0;
      }

      .level-title,
      .level-note,
      .level-head-label,
      .level-head-note {
        padding: 0.68rem 0.8rem;
      }

      .level-title,
      .level-note {
        font-size: 0.89rem;
        font-weight: 900;
        padding: 0.8rem;
      }

      .level-axis,
      .level-cells {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }

      .level-axis > div,
      .level-cell,
      .level-head-note,
      .level-note {
        border-left: 1px solid var(--ink);
      }

      .level-axis > div {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.68rem 0.6rem;
        text-align: center;
      }

      .level-cell {
        padding: 0.4rem;
      }

      .level-box {
        display: flex;
        height: 2.4rem;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--ink);
        background: var(--paper);
        color: var(--muted);
        font-size: 0.8rem;
        font-weight: 900;
      }

      .level-red { background: #f2aaa1; color: var(--ink); }
      .level-peach { background: #f4c6aa; color: var(--ink); }
      .level-yellow { background: #f2e4a3; color: var(--ink); }
      .level-mint { background: #c7ddd5; color: var(--ink); }
      .level-green { background: #b7dbc6; color: var(--ink); }

      .time-row {
        display: grid;
        grid-template-columns: 12rem 1fr 14rem;
        gap: 1rem;
        border: 1px solid var(--ink);
        background: var(--surface);
        margin-top: 0.8rem;
        padding: 1rem;
      }

      .time-row h3 { margin: 0; font-size: 1.05rem; }
      .time-box { border: 1px solid var(--ink); padding: 0.85rem; }
      .time-box p { margin: 0; }
      .time-box strong { display: block; margin-top: 0.45rem; font-size: 2.35rem; line-height: 1; }
      .time-note { margin-top: 0.55rem !important; font-size: 0.78rem; font-weight: 800; line-height: 1.45; }
      .muted { color: var(--muted); }
      .small { font-size: 0.9rem; line-height: 1.6; }
      .bar { display: block; height: 0.75rem; border: 1px solid var(--ink); background: var(--paper); }
      .bar span { display: block; height: 100%; }
      .green { background: var(--green); }
      .yellow { background: var(--yellow); }
      .peach { background: var(--peach); }
      .mint { background: var(--mint); }

      .split {
        display: grid;
        grid-template-columns: 0.95fr 1.05fr;
        gap: 1.4rem;
        margin-top: 3.25rem;
      }

      .panel {
        border: 1px solid var(--ink);
        background: var(--surface);
        padding: 1rem;
      }

      .factor {
        border: 1px solid var(--ink);
        background: var(--surface);
        padding: 1rem;
        margin-top: 0.7rem;
      }

      .table-wrap {
        overflow-x: hidden;
        border: 1px solid var(--ink);
        background: var(--surface);
        margin-top: 1rem;
      }

      table {
        width: 100%;
        min-width: 780px;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.92rem;
      }

      .resource-card {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        border: 1px solid var(--ink);
        background: var(--paper);
        color: var(--ink);
        padding: 0.55rem;
        font-weight: 900;
        text-decoration: none;
      }

      .resource-card img {
        width: 2.5rem;
        height: 2.5rem;
        border: 1px solid var(--ink);
        background: var(--surface);
        padding: 0.25rem;
        object-fit: contain;
      }

      .resource-section {
        border: 1px solid var(--ink);
        background: var(--surface);
        margin-top: 0;
      }

      .resources-section .summary-title + .resource-section {
        margin-top: 0;
      }

      .resource-section + .resource-section {
        margin-top: -1px;
      }

      .resource-section .table-wrap {
        border: 0;
        border-top: 1px solid var(--ink);
        margin-top: 0;
      }

      .resource-section table {
        min-width: 1180px;
      }

      .resource-section td:first-child {
        width: 8rem;
        font-weight: 900;
      }

      .resource-section td:nth-child(2) {
        width: 16rem;
      }

      .resource-section td:nth-child(3) {
        width: 5.5rem;
      }

      .resource-section td:nth-child(4) {
        width: 7rem;
        white-space: nowrap;
      }

      .resource-section td:nth-child(5) {
        width: 22rem;
      }

      .resource-section td:last-child {
        width: 17rem;
      }

      .resource-section th,
      .resource-section td {
        border-right: 1px solid var(--ink);
      }

      .resource-section th:last-child,
      .resource-section td:last-child {
        border-right: 0;
      }

      .sites-section th,
      .sites-section td {
        border-right: 1px solid var(--ink);
      }

      .sites-section th:last-child,
      .sites-section td:last-child {
        border-right: 0;
      }

      .sites-section .summary-title + .table-wrap {
        margin-top: 0;
      }

      .resource-name,
      .resource-provider {
        display: block;
      }

      .resource-name {
        font-weight: 900;
        color: var(--ink);
        text-decoration: none;
      }

      .resource-name:hover {
        text-decoration: underline;
        text-underline-offset: 0.18rem;
      }

      .resource-provider {
        margin-top: 0.25rem;
        color: var(--muted);
        font-weight: 400;
      }

      .resource-thumb {
        display: flex;
        width: 4.4rem;
        height: 3.4rem;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--ink);
        background: var(--paper);
      }

      .resource-thumb img {
        width: 100%;
        height: 100%;
        padding: 0.25rem;
        object-fit: contain;
      }

      .resource-cost {
        font-weight: 900;
      }

      .resource-section-head {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        align-items: start;
        background: #f1f1ee;
        padding: 0.75rem 1rem;
      }

      .resource-section-head h3 {
        margin: 0;
        font-size: 0.93rem;
        line-height: 1.1;
      }

      .resource-section-head p {
        margin: 0;
        color: var(--muted);
        font-size: 0.92rem;
        line-height: 1.75;
      }

      .tag-title {
        display: inline-flex;
        border: 1px solid var(--ink);
        background: var(--yellow);
        padding: 0.35rem 0.65rem;
        font-size: 0.78rem;
        font-weight: 900;
      }

      th {
        border-bottom: 1px solid var(--ink);
        background: var(--pink);
        padding: 0.8rem 1rem;
        font-weight: 900;
      }

      td {
        border-bottom: 1px solid var(--ink);
        padding: 0.85rem 1rem;
        vertical-align: top;
      }

      tr:last-child td { border-bottom: 0; }

      .cards {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.75rem;
        margin-top: 1rem;
      }

      .topik-system-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
        margin-top: 0;
      }

      .topik-system-card,
      .score-scale {
        border: 1px solid var(--ink);
        background: #fbfbf7;
        padding: 1.15rem;
      }

      .topik-system-card h3 {
        display: block;
        margin: 0.76rem 0 0;
        font-size: 1.24rem;
        font-weight: 900;
        line-height: 1;
      }

      .score-scale h3 {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin: 0;
        font-size: 1.24rem;
        font-weight: 900;
        line-height: 1.18;
      }

      .score-scale h3 > span:first-child {
        display: inline;
        border: 0;
        border-radius: 0;
        background: transparent;
        padding: 0;
        font-size: inherit;
        font-weight: 900;
        line-height: inherit;
      }

      .score-total {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--ink);
        border-radius: 999px;
        background: #f1f1ee;
        padding: 0.36rem 0.58rem;
        color: var(--ink);
        font-size: 0.78rem;
        font-weight: 900;
        line-height: 1;
      }

      .topik-system-card p {
        margin: 0.9rem 0 0;
        color: var(--muted);
        font-size: 0.88rem;
        line-height: 1.65;
      }

      .topik-system-card .pill {
        background: #f1f1ee;
        padding: 0.36rem 0.58rem;
        font-size: 0.76rem;
        font-weight: 900;
      }
      .topik-system-card .pill.yellow { background: #f1f1ee; }
      .topik-system-card .pill.green,
      .topik-system-card .pill.mint { background: #f1f1ee; }

      .exam-unit-grid {
        display: grid;
        grid-template-columns: 5rem repeat(3, minmax(0, 1fr));
        border: 1px solid var(--ink);
        margin-top: 1rem;
      }

      .exam-unit-grid span {
        min-height: 2.35rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-right: 1px solid var(--ink);
        border-bottom: 1px solid var(--ink);
        padding: 0.45rem 0.4rem;
        text-align: center;
        font-size: 0.78rem;
        font-weight: 900;
        line-height: 1.25;
      }

      .exam-unit-grid span:nth-child(4n) {
        border-right: 0;
      }

      .exam-unit-grid span:nth-last-child(-n + 4) {
        border-bottom: 0;
      }

      .exam-unit-grid .head {
        background: #f1f1ee;
        color: var(--muted);
        font-size: 0.7rem;
      }

      .exam-unit-grid .subject {
        justify-content: center;
        background: #fbfbf7;
      }

      .exam-unit-grid .time {
        background: #fff0b5;
      }

      .exam-unit-grid .score {
        background: #d7eee2;
      }

      .exam-unit-grid .total {
        background: #f1f1ee;
      }

      .format-list {
        display: grid;
        gap: 0.55rem;
        margin-top: 1rem;
      }

      .format-item {
        display: grid;
        grid-template-columns: 5.4rem 1fr;
        border: 1px solid var(--ink);
        background: #fbfbf7;
      }

      .format-item strong,
      .format-item span {
        padding: 0.55rem 0.65rem;
        font-size: 0.8rem;
        line-height: 1.45;
      }

      .format-item strong {
        display: flex;
        align-items: center;
        justify-content: center;
        border-right: 1px solid var(--ink);
        font-weight: 900;
        text-align: center;
      }

      .format-item span {
        color: var(--muted);
        font-weight: 800;
      }

      .score-grid {
        display: grid;
        grid-template-columns: 0.72fr 1fr;
        gap: 0.75rem;
        margin-top: 0;
      }

      .scale {
        display: grid;
        border: 1px solid var(--ink);
        margin-top: 1.05rem;
      }

      .scale.topik-i {
        grid-template-columns: 1.35fr 1fr 1fr;
      }

      .scale.topik-ii {
        grid-template-columns: 2fr 0.7fr 0.9fr 0.9fr 1.15fr;
      }

      .segment {
        min-height: 3.35rem;
        display: flex;
        flex-direction: column;
        gap: 0.22rem;
        align-items: center;
        justify-content: center;
        border-right: 1px solid var(--ink);
        padding: 0.45rem 0.45rem;
        text-align: center;
        font-weight: 900;
        line-height: 1.05;
      }

      .segment:last-child {
        border-right: 0;
      }

      .segment.fail {
        background: #f1f1ee;
      }

      .scale .mint { background: #c7ddd5; }
      .scale .green { background: #b7dbc6; }
      .scale .yellow { background: #f2e4a3; }
      .scale .peach { background: #f4c6aa; }
      .scale .pink { background: #f2aaa1; }

      .segment .level {
        font-size: 0.84rem;
      }

      .segment .range {
        color: var(--ink);
        font-size: 0.72rem;
      }

      .axis {
        display: grid;
        margin-top: 0.65rem;
        color: var(--ink);
        font-size: 0.73rem;
        font-weight: 900;
      }

      .axis span {
        position: relative;
      }

      .axis span::before {
        content: "";
        position: absolute;
        top: -0.5rem;
        left: 0;
        height: 0.35rem;
        border-left: 1px solid var(--ink);
      }

      .axis.topik-i {
        grid-template-columns: 1.35fr 1fr 1fr;
      }

      .axis.topik-ii {
        grid-template-columns: 2fr 0.7fr 0.9fr 0.9fr 1.15fr;
      }

      .axis span:last-child {
        text-align: right;
      }

      .axis span:last-child::before {
        right: 0;
        left: auto;
      }

      .card {
        border: 1px solid var(--ink);
        background: var(--surface);
        padding: 1rem;
      }

      .card h3 { margin: 0; font-size: 1.1rem; }
      .flow { display: grid; gap: 0.6rem; margin-top: 1rem; }
      .flow li { display: flex; gap: 0.75rem; align-items: center; border: 1px solid var(--ink); background: var(--surface); padding: 0.75rem; font-weight: 800; }
      .flow span { display: inline-flex; width: 2rem; height: 2rem; align-items: center; justify-content: center; border-radius: 999px; background: var(--ink); color: var(--paper); font-weight: 900; }

      @media (max-width: 980px) {
        .page-guide {
          left: 1rem;
          width: 8.75rem;
          padding: 0.9rem 0.7rem;
          font-size: 0.66rem;
        }
        .hero, .split, .time-row { grid-template-columns: 1fr; }
        .resource-section-head { grid-template-columns: 1fr; }
        .summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .prep-scale-card {
          grid-column: 1 / -1;
          border-top: 1px solid var(--ink);
          border-left: 0;
        }
        .topik-system-grid, .score-grid { grid-template-columns: 1fr; }
        .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }

      @media (max-width: 640px) {
        .page-guide {
          position: sticky;
          top: 8.75rem;
          width: calc(100% - 1.5rem);
          min-height: 0;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 0.45rem 0.7rem;
          margin: 0.75rem auto 0;
          padding: 0.75rem;
          font-size: 0.7rem;
        }
        .page-guide a {
          flex: 0 0 auto;
          white-space: nowrap;
        }
        .topik-anchor {
          scroll-margin-top: 17rem;
        }
        .level-graph { min-width: 0; }
        .level-head { display: none; }
        .level-row {
          display: block;
          padding: 0.85rem;
        }
        .level-title,
        .level-note {
          padding: 0;
          border-left: 0;
        }
        .level-cells {
          margin: 0.75rem 0;
          gap: 0.25rem;
        }
        .level-cell {
          border-left: 0;
          padding: 0;
        }
        .level-box {
          height: 2.35rem;
        }
        .hero h1 { font-size: 2.45rem; }
        .summary, .cards, .topik-system-grid, .score-grid { grid-template-columns: 1fr; }
        .metric { border-right: 0; border-top: 1px solid var(--ink); }
        .metric:first-child { border-top: 0; }
        .prep-scale-head { align-items: flex-start; flex-direction: column; }
        .prep-track { display: grid; }
        .prep-segment {
          border-right: 0;
          border-bottom: 1px solid var(--ink);
        }
        .prep-segment:last-child { border-bottom: 0; }
        .prep-segment.level-3,
        .prep-segment.level-4,
        .prep-segment.level-5,
        .prep-segment.level-6 { flex-basis: auto; }
        .prep-axis { display: none; }
      }
  `,
  body: `<nav class="page-guide" aria-label="TOPIK椤甸潰瀵艰">
      <a href="#prep-time">澶囪€冩椂闂村姣</a>
      <a href="#exam-map">考试系统地图</a>
      <a href="#score-levels">分数怎么变成等级</a>
      <a href="#undergrad-plan">本科申请TOPIK瑙勫垝</a>
      <a href="#resources">缃戣涓庢暀鏉愯祫婧</a>
      <a href="#test-sites">中国地区考点速查</a>
    </nav>
    <main class="wrap">
      <h2 class="summary-title topik-anchor" id="prep-time">澶囪€冩椂闂村姣</h2>
      <section class="summary">
        <article class="metric"><span class="pill yellow">中国考次</span><strong>每年2娆</strong><p>4鏈堛€?0鏈堢焊绗旇€冭瘯</p></article>
        <article class="metric"><span class="pill yellow">考试费用</span><strong>RMB 400</strong><p>绾?鈧?6,000</p></article>
        <article class="prep-scale-card">
          <div class="prep-scale-head">
            <span class="pill yellow">闆跺熀纭€鐩爣鏃堕棿杞</span>
            <em class="prep-scale-note">鎸夌洰鏍囩瓑绾х湅绱澶囪€冩椂闂</em>
          </div>
          <div class="prep-track" aria-label="TOPIK澶囪€冪疮璁℃椂闂磋酱">
            <div class="prep-segment level-3"><div class="prep-main"><strong class="months">6个月</strong><span class="level-badge">3绾</span></div><span class="words">绾?000璇</span></div>
            <div class="prep-segment level-4"><div class="prep-main"><strong class="months">10个月</strong><span class="level-badge">4绾</span></div><span class="words">5000璇嶄互涓</span></div>
            <div class="prep-segment level-5"><div class="prep-main"><strong class="months">16.5个月</strong><span class="level-badge">5绾</span></div><span class="words">绾?000璇</span></div>
            <div class="prep-segment level-6"><div class="prep-main"><strong class="months">21个月</strong><span class="level-badge">6绾</span></div><span class="words">10000璇嶄互涓</span></div>
          </div>
        </article>
      </section>

      <section class="section topik-anchor" id="exam-map">
        <h2 class="summary-title">考试系统地图</h2>
        <div class="topik-system-grid">
          <article class="topik-system-card">
            <span class="pill yellow">TOPIK I</span>
            <h3>1-2绾у叆闂ㄨ€冭瘯</h3>
            <p>绾哥瑪鑰冭瘯銆傚彧鑰冨惉鍔涘拰闃呰锛岄€傚悎璇佹槑鍩虹闊╄鑳藉姏銆</p>
            <div class="exam-unit-grid">
              <span class="head">科目</span><span class="head">时间</span><span class="head">题数</span><span class="head">鍒嗗€</span>
              <span class="subject">鍚姏</span><span class="time">40分钟</span><span>30棰</span><span class="score">100鍒</span>
              <span class="subject">闃呰</span><span class="time">60分钟</span><span>40棰</span><span class="score">100鍒</span>
              <span class="subject total">合计</span><span class="total">100分钟</span><span class="total">70棰</span><span class="total">200鍒</span>
            </div>
          </article>
          <article class="topik-system-card">
            <span class="pill green">TOPIK II</span>
            <h3>3-6绾х暀瀛︿富鎴樺満</h3>
            <p>绾哥瑪鑰冭瘯銆傚ぇ瀛︽湰绉戠洿鐢虫渶甯哥湅鐨勯€氬父鏄繖涓€寮犳垚缁┿€</p>
            <div class="exam-unit-grid">
              <span class="head">科目</span><span class="head">时间</span><span class="head">题数</span><span class="head">鍒嗗€</span>
              <span class="subject">鍚姏</span><span class="time">60分钟</span><span>50棰</span><span class="score">100鍒</span>
              <span class="subject">写作</span><span class="time">50分钟</span><span>4棰</span><span class="score">100鍒</span>
              <span class="subject">闃呰</span><span class="time">70分钟</span><span>50棰</span><span class="score">100鍒</span>
              <span class="subject total">合计</span><span class="total">180分钟</span><span class="total">104棰</span><span class="total">300鍒</span>
            </div>
          </article>
          <article class="topik-system-card">
            <span class="pill mint">IBT / Speaking</span>
            <h3>机考与口语是补充线</h3>
            <div class="format-list">
              <div class="format-item"><strong>IBT</strong><span>机考版，开放地区、题数、分值按当次官方简章确认。</span></div>
              <div class="format-item"><strong>Speaking</strong><span>口语单独考试，约30分钟，通常用于补充口语能力证明。</span></div>
            </div>
            <p>这两类不要和普通 PBT TOPIK 等级混看，申请前先确认学校是否接受。</p>
          </article>
        </div>
      </section>

      <section class="section topik-anchor" id="score-levels">
        <h2 class="summary-title">分数怎么变成等级</h2>
        <div class="score-grid">
          <article class="score-scale">
            <h3><span>TOPIK I</span><span class="score-total">总分 200</span></h3>
            <div class="scale topik-i">
              <div class="segment fail"><span class="level">鏈悎鏍</span><span class="range">0-79</span></div>
              <div class="segment mint"><span class="level">1绾</span><span class="range">80-139</span></div>
              <div class="segment green"><span class="level">2绾</span><span class="range">140-200</span></div>
            </div>
            <div class="axis topik-i"><span>0</span><span>80</span><span>200</span></div>
          </article>
          <article class="score-scale">
            <h3><span>TOPIK II</span><span class="score-total">总分 300</span></h3>
            <div class="scale topik-ii">
              <div class="segment fail"><span class="level">鏈悎鏍</span><span class="range">0-119</span></div>
              <div class="segment mint"><span class="level">3绾</span><span class="range">120+</span></div>
              <div class="segment yellow"><span class="level">4绾</span><span class="range">150+</span></div>
              <div class="segment peach"><span class="level">5绾</span><span class="range">190+</span></div>
              <div class="segment pink"><span class="level">6绾</span><span class="range">230+</span></div>
            </div>
            <div class="axis topik-ii"><span>0</span><span>120</span><span>150</span><span>190</span><span>300</span></div>
          </article>
        </div>
      </section>

      <section class="undergrad-plan topik-anchor" id="undergrad-plan">
        <h2 class="summary-title">本科申请TOPIK瑙勫垝</h2>
        ${topikTable(
          ["目标学校层级", "寤鸿TOPIK"],
          []
        ).replace(
          /<div class="table-wrap"><table>[\s\S]*<\/table><\/div>/,
          `<div class="table-wrap"><div class="level-graph">
            <div class="level-head">
              <div class="level-head-label">目标学校层级</div>
              <div class="level-axis">${topikLevelAxis.map((level) => `<div>TOPIK${level}</div>`).join("")}</div>
              <div class="level-head-note">閲嶇偣鎻愰啋</div>
            </div>
            ${undergraduateTopikPlan
              .map(
                ([tier, minLevel, maxLevel, note, colorClass]) => `<div class="level-row">
              <div class="level-title">${escapeHtml(tier)}</div>
              <div class="level-cells">${topikLevelAxis
                .map((level) => {
                  const active = level >= minLevel && level <= maxLevel;
                  return `<div class="level-cell"><div class="level-box ${active ? colorClass : ""}">${active ? `TOPIK${level}` : level}</div></div>`;
                })
                .join("")}</div>
              <div class="level-note">${escapeHtml(note)}</div>
            </div>`
              )
              .join("")}
          </div></div>`
        )}
      </section>

      <section class="section resources-section topik-anchor" id="resources">
        <h2 class="summary-title">缃戣涓庢暀鏉愯祫婧</h2>
        ${topikResourceSections.map((section) => topikResourceSection(section)).join("")}
      </section>

      <section class="section sites-section topik-anchor" id="test-sites">
        <h2 class="summary-title">中国地区考点速查</h2>
        ${topikTable(
          ["地区", "主要考点", "地区", "主要考点"],
          topikSites
            .reduce((rows, row, index) => {
              if (index % 2 === 0) rows.push([row, topikSites[index + 1]]);
              return rows;
            }, [])
            .map(([left, right]) => `<tr>
              <td>${escapeHtml(left[0])}</td>
              <td>${escapeHtml(left[1])}</td>
              <td>${right ? escapeHtml(right[0]) : ""}</td>
              <td>${right ? escapeHtml(right[1]) : ""}</td>
            </tr>`)
        )}
      </section>

    </main>`
});

const topikResearchHtml = shell({
  title: "TOPIK鑰冭瘯鍏ㄥ浘瑙?",
  headerTitle: "韩语(TOPIK)",
  activePath: "topik.html",
  extraStyle: `
      .wrap {
        width: calc(100% - 25rem);
        padding-top: 1.875rem;
      }

      .topik-page {
        display: grid;
        gap: 2.25rem;
      }

      .intro-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(22rem, 0.9fr);
        gap: 1rem;
        align-items: stretch;
      }

      .intro-main,
      .panel,
      .exam-card,
      .level-row,
      .timeline,
      .source-panel {
        border: 1px solid var(--ink);
        background: var(--surface);
      }

      .intro-main {
        padding: 1.15rem;
      }

      .label {
        display: inline-flex;
        border: 1px solid var(--ink);
        border-radius: 999px;
        background: var(--yellow);
        padding: 0.34rem 0.66rem;
        font-size: 0.76rem;
        font-weight: 900;
        line-height: 1;
      }

      .intro-main h1 {
        max-width: 12ch;
        margin: 1.1rem 0 0;
        font-size: clamp(3rem, 5.4vw, 5rem);
        font-weight: 900;
        line-height: 0.96;
      }

      .intro-main p,
      .panel p,
      .source-panel p {
        color: var(--muted);
        line-height: 1.75;
      }

      .fact-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        border: 1px solid var(--ink);
      }

      .fact {
        min-height: 8rem;
        border-right: 1px solid var(--ink);
        border-bottom: 1px solid var(--ink);
        padding: 0.9rem;
      }

      .fact:nth-child(2n) {
        border-right: 0;
      }

      .fact:nth-last-child(-n + 2) {
        border-bottom: 0;
      }

      .fact span {
        display: inline-flex;
        border: 1px solid var(--ink);
        border-radius: 999px;
        background: var(--pink);
        padding: 0.25rem 0.55rem;
        font-size: 0.72rem;
        font-weight: 900;
      }

      .fact strong {
        display: block;
        margin-top: 0.72rem;
        font-size: 1.45rem;
        line-height: 1.05;
      }

      .fact p {
        margin: 0.5rem 0 0;
        font-size: 0.82rem;
      }

      .section-title {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 1rem;
        border-top: 1px solid var(--ink);
        padding-top: 1.35rem;
      }

      .section-title h2 {
        margin: 0;
        font-size: clamp(1.75rem, 3.4vw, 3rem);
        font-weight: 900;
        line-height: 1;
      }

      .section-title p {
        max-width: 36rem;
        margin: 0;
        color: var(--muted);
        font-size: 0.9rem;
        line-height: 1.65;
      }

      .exam-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.75rem;
        margin-top: 1rem;
      }

      .exam-card {
        padding: 1rem;
      }

      .exam-card h3 {
        margin: 0.75rem 0 0.4rem;
        font-size: 1.55rem;
        font-weight: 900;
      }

      .mini-bars {
        display: grid;
        gap: 0.55rem;
        margin-top: 1rem;
      }

      .bar-row {
        display: grid;
        grid-template-columns: 5.8rem 1fr 4.2rem;
        align-items: center;
        gap: 0.55rem;
        font-size: 0.78rem;
        font-weight: 800;
      }

      .track {
        height: 0.82rem;
        border: 1px solid var(--ink);
        background: var(--paper);
      }

      .fill {
        display: block;
        height: 100%;
        background: var(--green);
      }

      .score-grid {
        display: grid;
        grid-template-columns: 1fr 1.35fr;
        gap: 1rem;
        margin-top: 1rem;
      }

      .score-scale {
        border: 1px solid var(--ink);
        background: var(--surface);
        padding: 1rem;
      }

      .score-scale h3,
      .panel h3,
      .source-panel h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 900;
      }

      .scale {
        display: flex;
        min-height: 3.2rem;
        overflow: hidden;
        border: 1px solid var(--ink);
        margin-top: 0.9rem;
      }

      .segment {
        display: grid;
        place-items: center;
        border-right: 1px solid var(--ink);
        padding: 0.35rem;
        font-size: 0.75rem;
        font-weight: 900;
        text-align: center;
      }

      .segment:last-child {
        border-right: 0;
      }

      .axis {
        display: flex;
        justify-content: space-between;
        margin-top: 0.45rem;
        color: var(--muted);
        font-size: 0.72rem;
        font-weight: 800;
      }

      .level-ladder {
        display: grid;
        gap: 0.65rem;
        margin-top: 1rem;
      }

      .level-row {
        display: grid;
        grid-template-columns: 6rem 1fr 15rem;
        align-items: center;
      }

      .level-no {
        display: grid;
        height: 100%;
        place-items: center;
        border-right: 1px solid var(--ink);
        background: var(--yellow);
        font-size: 1.55rem;
        font-weight: 900;
      }

      .level-main {
        padding: 0.85rem 1rem;
      }

      .level-main strong {
        font-size: 1.1rem;
      }

      .level-main p {
        margin: 0.35rem 0 0;
        color: var(--muted);
        font-size: 0.88rem;
        line-height: 1.55;
      }

      .level-use {
        border-left: 1px solid var(--ink);
        padding: 0.85rem 1rem;
        font-size: 0.88rem;
        font-weight: 900;
        line-height: 1.45;
      }

      .route-map {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 0.65rem;
        margin-top: 1rem;
      }

      .route-card {
        border: 1px solid var(--ink);
        background: var(--surface);
        padding: 0.9rem;
      }

      .route-card strong {
        display: block;
        font-size: 1.35rem;
        line-height: 1;
      }

      .route-card p {
        margin: 0.7rem 0 0;
        color: var(--muted);
        font-size: 0.82rem;
        line-height: 1.55;
      }

      .timeline {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        margin-top: 1rem;
      }

      .time-step {
        min-height: 8rem;
        border-right: 1px solid var(--ink);
        padding: 0.9rem;
      }

      .time-step:last-child {
        border-right: 0;
      }

      .time-step span {
        display: inline-flex;
        border: 1px solid var(--ink);
        border-radius: 999px;
        background: var(--mint);
        padding: 0.25rem 0.55rem;
        font-size: 0.72rem;
        font-weight: 900;
      }

      .time-step strong {
        display: block;
        margin-top: 0.8rem;
        font-size: 1.05rem;
      }

      .time-step p {
        margin: 0.5rem 0 0;
        color: var(--muted);
        font-size: 0.78rem;
        line-height: 1.45;
      }

      .prep-grid {
        display: grid;
        grid-template-columns: 1.1fr 0.9fr;
        gap: 1rem;
        margin-top: 1rem;
      }

      .prep-stacks {
        display: grid;
        gap: 0.7rem;
      }

      .prep-card {
        border: 1px solid var(--ink);
        background: var(--surface);
        padding: 0.85rem;
      }

      .prep-card h3 {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin: 0;
        font-size: 1rem;
      }

      .source-panel {
        padding: 1rem;
      }

      .source-links {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.65rem;
        margin-top: 1rem;
      }

      .source-links a {
        border: 1px solid var(--ink);
        background: var(--paper);
        padding: 0.75rem;
        font-size: 0.86rem;
        font-weight: 900;
        text-decoration: none;
      }

      .note {
        margin: 0.85rem 0 0;
        color: var(--muted);
        font-size: 0.82rem;
        line-height: 1.7;
      }

      @media (max-width: 1180px) {
        .intro-grid,
        .score-grid,
        .prep-grid {
          grid-template-columns: 1fr;
        }

        .exam-grid,
        .route-map,
        .source-links {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .timeline {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
      }

      @media (max-width: 720px) {
        .wrap {
          width: calc(100% - 1.5rem);
        }

        .intro-grid,
        .fact-grid,
        .exam-grid,
        .score-grid,
        .route-map,
        .timeline,
        .prep-grid,
        .source-links {
          grid-template-columns: 1fr;
        }

        .intro-main h1 {
          font-size: 2.55rem;
        }

        .section-title {
          align-items: start;
          flex-direction: column;
        }

        .fact,
        .fact:nth-child(2n),
        .fact:nth-last-child(-n + 2),
        .time-step {
          border-right: 0;
          border-bottom: 1px solid var(--ink);
        }

        .fact:last-child,
        .time-step:last-child {
          border-bottom: 0;
        }

        .level-row {
          grid-template-columns: 4.2rem 1fr;
        }

        .level-use {
          grid-column: 1 / -1;
          border-left: 0;
          border-top: 1px solid var(--ink);
        }

        .bar-row {
          grid-template-columns: 4.8rem 1fr 3.4rem;
        }
      }
  `,
  body: `<main class="wrap topik-page">
      <section class="intro-grid">
        <article class="intro-main">
          <span class="label">官方韩语能力考试</span>
          <h1>TOPIK 鏄煩鍥界暀瀛︾殑璇█閫氳璇</h1>
          <p>TOPIK 鐢ㄦ潵琛￠噺闈炴瘝璇€呯殑闊╄鑳藉姏銆傚涓浗瀛︾敓鏉ヨ锛屽畠閫氬父鍐冲畾鑳戒笉鑳界洿鐢虫湰绉?鐮旂┒鐢熴€佽兘涓嶈兘鐢宠濂栧閲戙€佷互鍙婂叆瀛﹀悗鍚噦涓撲笟璇剧殑绋冲畾搴︺€</p>
          <p class="note">涓€鍙ヨ瘽锛氬厛鍒ゆ柇鑷繁瑕佺敵璇峰摢绫诲鏍″拰涓撲笟锛屽啀鍊掓帹 TOPIK 鐩爣銆備笉瑕佸彧闂€滄渶浣庡嚑绾р€濓紝瑕佺湅鈥滆繖涓笓涓氱敤鍑犵骇鏇寸ǔ鈥濄€</p>
        </article>
        <div class="fact-grid">
          <article class="fact"><span>考试对象</span><strong>闈為煩璇瘝璇€</strong><p>鐣欏銆佸氨涓氥€佸瀛﹂噾銆佽瑷€鑳藉姏璇佹槑閮藉父鐢ㄣ€</p></article>
          <article class="fact"><span>等级</span><strong>1-6绾</strong><p>1-2绾ф槸 TOPIK I锛?-6绾ф槸 TOPIK II銆</p></article>
          <article class="fact"><span>中国考区</span><strong>甯歌 PBT</strong><p>澶ч檰绾哥瑪鑰冭瘯閫氬父闆嗕腑鍦?4鏈堛€?0鏈堬紝鍏蜂綋浠ユ暀鑲茶€冭瘯缃戜负鍑嗐€</p></article>
          <article class="fact"><span>成绩有效</span><strong>2骞</strong><p>鐢宠鏃惰纭鎴愮哗鍦ㄧ洰鏍囧鏍℃彁浜ゆ埅姝㈡棩鍓嶄粛鏈夋晥銆</p></article>
        </div>
      </section>

      <section>
        <div class="section-title">
          <h2>考试系统地图</h2>
          <p>鍏堝垎娓呰€冭瘯褰㈠紡銆傚鏁板ぇ学申请看 TOPIK I/II 鎴愮哗锛屽彛璇€冭瘯鏄崟鐙綋绯伙紝涓嶇瓑浜庢櫘閫?TOPIK 绛夌骇銆</p>
        </div>
        <div class="exam-grid">
          <article class="exam-card">
            <span class="label">PBT TOPIK I</span>
            <h3>1-2绾у叆闂ㄨ€冭瘯</h3>
            <p class="note">鍚姏 40鍒嗛挓锛岄槄璇?60鍒嗛挓锛屾€诲垎 200銆傞€傚悎璇佹槑鍩虹鏃ュ父闊╄銆</p>
            <div class="mini-bars">
              <div class="bar-row"><span>鍚姏</span><div class="track"><span class="fill" style="width:40%"></span></div><strong>40m</strong></div>
              <div class="bar-row"><span>闃呰</span><div class="track"><span class="fill" style="width:60%;background:var(--yellow)"></span></div><strong>60m</strong></div>
            </div>
          </article>
          <article class="exam-card">
            <span class="label" style="background:var(--green)">PBT TOPIK II</span>
            <h3>3-6绾х暀瀛︿富鎴樺満</h3>
            <p class="note">鍚姏銆佸啓浣溿€侀槄璇诲悇 100分，总分 300銆傚ぇ瀛︾洿鐢虫渶甯哥湅鐨勫氨鏄繖涓€寮犳垚缁┿€</p>
            <div class="mini-bars">
              <div class="bar-row"><span>鍚姏</span><div class="track"><span class="fill" style="width:33%"></span></div><strong>100</strong></div>
              <div class="bar-row"><span>写作</span><div class="track"><span class="fill" style="width:33%;background:var(--pink)"></span></div><strong>100</strong></div>
              <div class="bar-row"><span>闃呰</span><div class="track"><span class="fill" style="width:33%;background:var(--yellow)"></span></div><strong>100</strong></div>
            </div>
          </article>
          <article class="exam-card">
            <span class="label" style="background:var(--mint)">IBT / Speaking</span>
            <h3>鏈鸿€冧笌鍙ｈ鏄ˉ充线</h3>
            <p class="note">IBT 鍦ㄩ儴鍒嗗湴鍖哄紑鏀俱€係peaking 鍗曠嫭璇勫垎锛岀敤浜庡彛璇兘鍔涜瘉鏄庯紝鐢宠鍓嶈鐪嬪鏍℃槸鍚︽帴鍙椼€</p>
            <div class="mini-bars">
              <div class="bar-row"><span>IBT</span><div class="track"><span class="fill" style="width:70%;background:var(--mint)"></span></div><strong>鏈鸿€</strong></div>
              <div class="bar-row"><span>口语</span><div class="track"><span class="fill" style="width:30%;background:var(--peach)"></span></div><strong>30m</strong></div>
            </div>
          </article>
        </div>
      </section>

      <section>
        <div class="section-title">
          <h2>分数怎么变成等级</h2>
          <p>TOPIK 涓嶆槸鐧惧垎鍒跺綍鍙栫嚎锛岃€屾槸鎸夋€诲垎鍒囩瓑绾с€俆OPIK II 鍙樊 1分，也可能从 5绾ф帀鍒?4绾с€</p>
        </div>
        <div class="score-grid">
          <article class="score-scale">
            <h3>TOPIK I锛屾€诲垎 200</h3>
            <div class="scale">
              <div class="segment" style="width:40%;background:#f1f1ee">鏈悎鏍?br />0-79</div>
              <div class="segment" style="width:30%;background:var(--mint)">1绾?br />80-139</div>
              <div class="segment" style="width:30%;background:var(--green)">2绾?br />140-200</div>
            </div>
            <div class="axis"><span>0</span><span>80</span><span>140</span><span>200</span></div>
          </article>
          <article class="score-scale">
            <h3>TOPIK II锛屾€诲垎 300</h3>
            <div class="scale">
              <div class="segment" style="width:40%;background:#f1f1ee">鏈悎鏍?br />0-119</div>
              <div class="segment" style="width:10%;background:var(--mint)">3绾?br />120</div>
              <div class="segment" style="width:13.3%;background:var(--yellow)">4绾?br />150</div>
              <div class="segment" style="width:13.3%;background:var(--peach)">5绾?br />190</div>
              <div class="segment" style="width:23.4%;background:var(--pink)">6绾?br />230+</div>
            </div>
            <div class="axis"><span>0</span><span>120</span><span>150</span><span>190</span><span>230</span><span>300</span></div>
          </article>
        </div>
      </section>

      <section>
        <div class="section-title">
          <h2>6涓瓑绾у埌搴曡兘鍋氫粈涔</h2>
          <p>涓嬮潰鏄妸瀹樻柟鑳藉姏鎻忚堪鍘嬬缉鎴愮暀瀛﹀満鏅瑷€锛氱湅浣犺兘鍚﹀惉璇俱€佽鏁欐潗銆佸啓鎶ュ憡锛岃€屼笉鍙槸鑳戒笉鑳借亰澶┿€</p>
        </div>
        <div class="level-ladder">
          <article class="level-row"><div class="level-no">1</div><div class="level-main"><strong>生存韩语</strong><p>闂矾銆佽喘鐗┿€佺偣椁愩€佺畝鍗曡嚜鎴戜粙缁嶃€</p></div><div class="level-use">不建议直申专业课</div></article>
          <article class="level-row"><div class="level-no">2</div><div class="level-main"><strong>鏃ュ父闊╄</strong><p>鑳藉鐞嗗父瑙佺敓娲诲満鏅紝浣嗕笓涓氳鐞嗚В浠嶅悆鍔涖€</p></div><div class="level-use">璇闄?预科过渡</div></article>
          <article class="level-row"><div class="level-no">3</div><div class="level-main"><strong>基础校园韩语</strong><p>鑳借繘琛屽熀鏈ぞ浼氫氦娴侊紝寮€濮嬭鎳傜畝鍗曡绋嬭鏄庛€</p></div><div class="level-use">閮ㄥ垎瀛︽牎鏈€浣庣嚎</div></article>
          <article class="level-row"><div class="level-no">4</div><div class="level-main"><strong>涓撲笟璇捐捣姝ョ嚎</strong><p>鑳界悊瑙ｈ緝姝ｅ紡鏂囨湰鍜岃鍫傝〃杈撅紝鏄鏁版湰绉戠敵璇风殑瀹炵敤搴曠嚎銆</p></div><div class="level-use">鏅€氫笓涓氭洿绋</div></article>
          <article class="level-row"><div class="level-no">5</div><div class="level-main"><strong>绔炰簤鍔涚瓑绾</strong><p>鑳藉鐞嗚緝澶嶆潅涓婚锛屽啓浣滃拰闃呰閫熷害寮€濮嬫敮鎾戜笓涓氬涔犮€</p></div><div class="level-use">鐑棬涓撲笟寤鸿绾</div></article>
          <article class="level-row"><div class="level-no">6</div><div class="level-main"><strong>高阶学术韩语</strong><p>鑳借緝绋冲畾鍦扮悊瑙ｅ鏈潗鏂欍€佹柊闂昏瘎璁恒€佽鍫傝璁恒€</p></div><div class="level-use">濂栧閲?名校加分</div></article>
        </div>
      </section>

      <section>
        <div class="section-title">
          <h2>闊╁浗鐣欏鎬庝箞鐢?TOPIK</h2>
          <p>瀛︽牎瑙勫畾浼氬彉锛屼笓涓氫篃浼氬彉銆傝繖涓浘鍙仛绛栫暐鍙傝€冿紝鏈€缁堜互鐩爣瀛︽牎鏈€鏂版嫑鐢熺畝绔犱负鍑嗐€</p>
        </div>
        <div class="route-map">
          <article class="route-card"><strong>0-2绾</strong><p>鍏堣璇闄㈡垨棰勭銆傞€傚悎闆跺熀纭€銆佹椂闂村厖瓒炽€侀渶瑕佸厛閫傚簲闊╁浗鐢熸椿鐨勫鐢熴€</p></article>
          <article class="route-card"><strong>3绾</strong><p>鍙湅閮ㄥ垎鏈鎴栧湴鏂归櫌鏍★紝浣嗕笓涓氳椋庨櫓浠嶉珮锛岃琛ュ涔犺鍒掑拰鏉愭枡銆</p></article>
          <article class="route-card"><strong>4绾</strong><p>澶氭暟鏈鐢宠鏇村疄鐢ㄧ殑搴曠嚎锛屾櫘閫氫笓涓氬拰鍦版柟鍥界珛鏇村€煎緱閲嶇偣瑙勫垝銆</p></article>
          <article class="route-card"><strong>5绾</strong><p>棣栧皵鍦堛€佺儹闂ㄤ笓涓氥€佸瀛﹂噾鐢宠鏇存湁绔炰簤鍔涳紝鍐欎綔涓嶈兘鎷栧悗鑵裤€</p></article>
          <article class="route-card"><strong>6绾</strong><p>鍚嶆牎銆佷紶濯掔粡钀ャ€佷汉鏂囩ぞ绉戙€佸瀛﹂噾鏇寸ǔ锛屼絾浠嶈鐪?GPA 鍜屼笓涓氭潗鏂欍€</p></article>
        </div>
      </section>

      <section>
        <div class="section-title">
          <h2>鐢宠鍊掓帹鏃堕棿绾</h2>
          <p>TOPIK 鏈€澶у潙涓嶆槸鑰冧笉杩囷紝鑰屾槸鎴愮哗鍑烘潵澶櫄銆傜敵璇峰鍓嶈嚦灏戦鐣欎竴娆¤ˉ鑰冩満浼氥€</p>
        </div>
        <div class="timeline">
          <article class="time-step"><span>-12个月</span><strong>确定目标等级</strong><p>鎸夊鏍″眰绾у拰涓撲笟鍊掓帹锛屼笉瑕佸彧鐪嬫渶浣庣嚎銆</p></article>
          <article class="time-step"><span>-9个月</span><strong>完成语法主线</strong><p>0鍩虹鍏堟妸鍙戦煶銆佸姪璇嶃€佽繛鎺ヨ瘝鎵撶ǔ銆</p></article>
          <article class="time-step"><span>-6个月</span><strong>寮€濮嬬湡棰樿妭濂</strong><p>鍚姏鍜岄槄璇婚檺鏃惰缁冿紝鍐欎綔寤虹珛妯℃澘銆</p></article>
          <article class="time-step"><span>-4个月</span><strong>鎶ュ悕鎶㈣€冧綅</strong><p>涓浗鑰冨尯鎸夊畼鏂瑰紑鏀炬椂闂存姤鍚嶏紝鐑棬鍩庡競鍒嫋銆</p></article>
          <article class="time-step"><span>-2个月</span><strong>妯℃嫙鑰冭瘯</strong><p>瀹屾暣鍋氬嵎锛岀‘璁ゅ急椤规槸鍚﹀奖鍝嶇洰鏍囩瓑绾с€</p></article>
          <article class="time-step"><span>鐢宠鍓</span><strong>提交有效成绩</strong><p>鎴愮哗鏈夋晥鏈熼€氬父鎸?骞寸畻锛屾埅姝㈡棩鍓嶈鑳芥彁浜ゃ€</p></article>
        </div>
      </section>

      <section>
        <div class="section-title">
          <h2>澶囪€冭矾绾挎€庝箞閫</h2>
          <p>TOPIK II 的分差常常来自写作和阅读速度。只刷词汇，不做限时套题，很容易卡在 4绾с€</p>
        </div>
        <div class="prep-grid">
          <div class="prep-stacks">
            <article class="prep-card"><h3><span>0鍩虹鍒?绾</span><span>6-9个月</span></h3><div class="mini-bars"><div class="bar-row"><span>发音语法</span><div class="track"><span class="fill" style="width:75%"></span></div><strong>楂</strong></div><div class="bar-row"><span>鐪熼</span><div class="track"><span class="fill" style="width:35%;background:var(--yellow)"></span></div><strong>涓</strong></div></div></article>
            <article class="prep-card"><h3><span>3绾у埌4绾</span><span>2-4个月</span></h3><div class="mini-bars"><div class="bar-row"><span>闃呰閫熷害</span><div class="track"><span class="fill" style="width:70%"></span></div><strong>楂</strong></div><div class="bar-row"><span>鍚姏</span><div class="track"><span class="fill" style="width:60%;background:var(--mint)"></span></div><strong>楂</strong></div></div></article>
            <article class="prep-card"><h3><span>4绾у埌5/6绾</span><span>3-6个月</span></h3><div class="mini-bars"><div class="bar-row"><span>写作</span><div class="track"><span class="fill" style="width:82%;background:var(--pink)"></span></div><strong>鏍稿績</strong></div><div class="bar-row"><span>閿欓澶嶇洏</span><div class="track"><span class="fill" style="width:76%;background:var(--peach)"></span></div><strong>鏍稿績</strong></div></div></article>
          </div>
          <article class="panel">
            <h3>鏈€甯歌鐨?涓鍖</h3>
            <p><strong>鍙儗鍗曡瘝锛</strong>TOPIK II 鏄槄璇婚€熷害銆佸啓浣滅粍缁囥€佸惉鍔涘畾浣嶄竴璧疯€冦€</p>
            <p><strong>澶櫄鎶ュ悕锛</strong>鎴愮哗鍏竷鍜屽鏍℃埅姝㈡棩鏈熶箣闂磋鐣欑紦鍐层€</p>
            <p><strong>鍙啿鏈€浣庣嚎锛</strong>鏈€浣庣嚎鑳芥姤鍚嶏紝涓嶄唬琛ㄥ綍鍙栫ǔ銆傜儹闂ㄤ笓涓氶€氬父瑕佹洿楂樼瓑绾у拰涓撲笟鏉愭枡銆</p>
          </article>
        </div>
      </section>

      <section class="source-panel">
        <h3>瀹樻柟淇℃伅鍏ュ彛</h3>
        <p>页面内容依据官方 TOPIK/NIIED/Study in Korea/涓浗鏁欒偛鑰冭瘯缃戝叕寮€淇℃伅鏁寸悊銆傝€冭瘯鏃ユ湡銆佽垂鐢ㄣ€佽€冪偣鍜屽鏍¤姹備細鍙樺寲锛屾彁浜ゅ墠浠嶈鏌ョ洰鏍囧鏍′笌鎶ュ悕绯荤粺銆</p>
        <div class="source-links">
          <a href="https://www.topik.go.kr/" target="_blank" rel="noreferrer">TOPIK 官方网站 鈫</a>
          <a href="https://www.niied.go.kr/" target="_blank" rel="noreferrer">NIIED 鍥界珛鍥介檯鏁欒偛闄?鈫</a>
          <a href="https://www.studyinkorea.go.kr/" target="_blank" rel="noreferrer">Study in Korea 鈫</a>
          <a href="https://topik.neea.edu.cn/" target="_blank" rel="noreferrer">涓浗鏁欒偛鑰冭瘯缃?TOPIK 鈫</a>
        </div>
      </section>
    </main>`
});

const finalTopikHtml = topikHtml || topikResearchHtml;

const costBreakdownParts = [
  ["学费", 50, "约4-10万/年", "#7d98f2"],
  ["住宿费", 25, "约1-6万/年", "#5cc8a1"],
  ["餐饮费", 15, "约1.2-3万/年", "#a678f0"],
  ["交通费", 5, "约0.2-0.6万/年", "#ff9851"],
  ["其他杂费", 5, "约0.5-1.5万/年", "#f17878"]
];

const costPreDepartureRows = [
  ["???? / TOPIK", "0.3-1.5? + 400?/?", "????????????????", "TOPIK / ???"],
  ["?????", "?250-600?/?", "????????????????????", "??????"],
  ["???? / ?? / ??", "?800-3000?", "?????????????????????", "??????"],
  ["?? vs ????", "??0????0.6-1?", "???????????????????????????", "????"]
];

const costScenarioComparisonRows = [
  ["????????", "14-18?", "15-20?", "16-20?", "blue"],
  ["????????", "12-16?", "13-16?", "14-16?", "purple"],
  ["??????", "8-13?", "9-14?", "10-15?", "orange"],
  ["??????", "7-11?", "8-12?", "9-12?", "green"]
];

const costScenarioRows = [
  ["????????", "14-20?", 14, 20, "4-10?", "1.8-7.2?", "6-9?", "??/???????????"],
  ["????????", "12-16?", 12, 16, "3.2-5.5?", "1.8-3.6?", "6-9?", "?????????30%"],
  ["??????", "8-15?", 8, 15, "2.5-6?", "1.2-2.4?", "4-6?", "????????????"],
  ["??????", "7-12?", 7, 12, "1.8-4.5?", "1-1.8?", "3.6-6?", "?????????"]
];

const costCompositions = [
  ["??????", "?8?", [["??", 3, "yellow"], ["??", 1.2, "mint"], ["??", 3, "green"], ["??", 0.8, "pink"]]],
  ["??????", "?15?", [["??", 5, "yellow"], ["??", 3.6, "mint"], ["??", 5.4, "green"], ["??", 1, "pink"]]],
  ["??????", "?20?", [["??", 8, "yellow"], ["??", 5, "mint"], ["??", 6, "green"], ["??", 1, "pink"]]]
];

const costPreparationRows = [
  ["????", "3000-15000?", "???????????????????4-8??"],
  ["TOPIK??", "400-800?", "??????400?/???????1-2??"],
  ["????", "0-10000?", "????0??????3000-8000??"],
  ["??/??/??", "?1500-5000?", "????????????D-2???????"],
  ["?????", "?1500-5000?", "????1000-2000???????????"]
];

const costMonthlyRows = [
  ["????", "?? 2000-4000", "?? 1000-2500", "?????????"],
  ["????", "?? 3000-6000", "?? 1500-3000", "??????"],
  ["??", "?? 1500-3000", "?? 800-1500", "?????30%"],
  ["??", "?? 1800-3000", "?? 1200-2000", "??/????"],
  ["??", "?? 300-500", "?? 200-300", "??????0"],
  ["??", "?? 1000-2000", "?? 500-1500", "??????????"]
];

const costSavingRows = [
  ["???", "25-50%", "TOPIK?????????????????????"],
  ["??", "?30%", "?????????????????"],
  ["??", "?30%", "????????????"],
  ["??", "?20%", "????????????????"],
  ["??", "10-15h/?", "??????????????????"]
];

const costBudgetRoutes = [
  ["7-10?", "??????", "???????????????????"],
  ["10-14?", "????/????", "??????????????????"],
  ["14-20?", "??????", "????????????????????"]
];

function costRangeBar(min, max, ceiling = 20) {
  const left = (min / ceiling) * 100;
  const width = ((max - min) / ceiling) * 100;
  return `<div class="range-bar"><span style="left:${left}%;width:${width}%">${escapeHtml(`${min}-${max}?`)}</span></div>`;
}

function costScenarioGraph(rows) {
  return `<div class="scenario-graph">${rows.map(([scene, budget, min, max, tuition, housing, living, note]) => `<article class="scenario-row"><div class="scenario-name"><h3>${escapeHtml(scene)}</h3><strong>${escapeHtml(budget)}</strong><p>??? / ?</p></div><div class="scenario-bar">${costRangeBar(min, max)}</div><div class="cost-breakdown"><div class="cost-parts"><span><b>??</b><br />${escapeHtml(tuition)}</span><span><b>??</b><br />${escapeHtml(housing)}</span><span><b>??</b><br />${escapeHtml(living)}</span></div><p>${escapeHtml(note)}</p></div></article>`).join("")}</div>`;
}

function costStack(parts) {
  const total = parts.reduce((sum, [, value]) => sum + value, 0);
  return `<div class="stack-bar">${parts.map(([label, value, color]) => `<span class="${color}" style="width:${(value / total) * 100}%" title="${escapeHtml(`${label} ${value}?`)}"></span>`).join("")}</div>`;
}

function costDonutStyle(parts) {
  let cursor = 0;
  return parts.map(([, value, , color]) => { const start = cursor; cursor += value; return `${color} ${start}% ${cursor}%`; }).join(", ");
}

function costPreDepartureCosts(rows) {
  return `<section class="section pre-cost-section"><h2 class="summary-title">???????</h2><div class="pre-cost-panel"><table class="pre-cost-table"><thead><tr><th>??</th><th>????</th><th>????</th><th>????</th></tr></thead><tbody>${rows.map(([item, budget, detail, source]) => `<tr><td class="pre-cost-item">${escapeHtml(item)}</td><td class="pre-cost-budget">${escapeHtml(budget)}</td><td>${escapeHtml(detail)}</td><td class="pre-cost-source">${escapeHtml(source)}</td></tr>`).join("")}</tbody></table></div></section>`;
}

function costBreakdownAnalysis(parts) {
  return `<section class="section"><h2 class="summary-title">????????????</h2><div class="cost-analysis-panel"><div class="donut-wrap"><div class="donut-chart" style="background: conic-gradient(${costDonutStyle(parts)})"><span class="donut-hole"></span></div></div><div class="donut-legend"><table class="donut-table"><thead><tr><th>??</th><th>??</th><th>???</th></tr></thead><tbody>${parts.map(([label, value, amount, color]) => `<tr><td><span class="item-cell"><span class="legend-key" style="background:${escapeHtml(color)}"></span>${escapeHtml(label)}</span></td><td class="value-cell">${escapeHtml(`${value}%`)}</td><td class="amount-cell">${escapeHtml(amount)}</td></tr>`).join("")}</tbody></table></div></div></section>`;
}

function costScenarioComparisonTable(rows) {
  return `<section class="section"><h2 class="summary-title">??????????????????</h2><div class="comparison-panel"><table class="comparison-table"><thead><tr><th>????</th><th>????</th><th>???</th><th>???/???</th></tr></thead><tbody>${rows.map(([type, humanities, stem, arts, color]) => `<tr><td class="scenario-type ${escapeHtml(color)}">${escapeHtml(type)}</td><td>${escapeHtml(humanities)}</td><td>${escapeHtml(stem)}</td><td>${escapeHtml(arts)}</td></tr>`).join("")}</tbody></table></div></section>`;
}


const costHtml = shell({
  title: "鐣欏璐圭敤锛堝瀛﹂噾锛?",
  headerTitle: "鐣欏璐圭敤锛堝瀛﹂噾锛?",
  activePath: "cost.html",
  extraStyle: `
      .wrap {
        width: calc(100% - 25rem);
        padding-top: 1.875rem;
      }

      .summary-title {
        display: inline-flex;
        align-items: center;
        align-self: flex-start;
        margin: 0 0 1rem;
        padding: 0.5rem 1rem;
        border: 1px solid var(--ink);
        border-radius: 0;
        background: var(--yellow);
        font-size: clamp(0.8rem, 1.28vw, 1.2rem);
        font-weight: 900;
        line-height: 1;
      }

      .pre-cost-section {
        margin-top: 0;
        margin-bottom: 2rem;
      }
      .pre-cost-panel {
        overflow-x: auto;
        border: 1px solid var(--ink);
        background: var(--surface);
        padding: 1rem;
      }
      .pre-cost-table {
        min-width: 980px;
        margin-top: 0;
        border: 1px solid var(--ink);
        border-collapse: collapse;
        background: #ffffff;
        color: var(--ink);
        font-size: 0.88rem;
      }
      .pre-cost-table th,
      .pre-cost-table td {
        border: 1px solid var(--ink);
        background: #ffffff;
        color: var(--ink);
        padding: 0.68rem 0.8rem;
        vertical-align: middle;
      }
      .pre-cost-table th {
        background: #f1f1ee;
        font-weight: 900;
      }
      .pre-cost-table th:first-child { width: 15%; }
      .pre-cost-table th:nth-child(2) { width: 18%; text-align: center; }
      .pre-cost-table th:last-child { width: 16%; text-align: center; }
      .pre-cost-item {
        font-weight: 900;
        white-space: nowrap;
      }
      .pre-cost-budget {
        text-align: center;
        font-weight: 900;
        white-space: nowrap;
      }
      .pre-cost-source {
        color: var(--muted);
        font-size: 0.76rem;
        font-weight: 800;
        text-align: center;
      }
      .pre-cost-note {
        margin: 0.75rem 0 0;
        color: var(--muted);
        font-size: 0.76rem;
        font-weight: 700;
        line-height: 1.6;
      }
      .pre-cost-sources {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.75rem;
        color: var(--muted);
        font-size: 0.72rem;
        font-weight: 800;
      }
      .pre-cost-sources a {
        border: 1px solid var(--ink);
        background: #ffffff;
        padding: 0.32rem 0.5rem;
      }

      .summary {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        border-top: 1px solid var(--ink);
        border-bottom: 1px solid var(--ink);
      }

      .metric {
        border-right: 1px solid var(--ink);
        padding: 0.76rem 1rem;
      }

      .metric:last-child { border-right: 0; }
      .metric strong { display: block; margin-top: 0.76rem; font-size: 1.24rem; line-height: 1; }
      .metric p { margin: 0.6rem 0 0; color: var(--muted); font-size: 0.8rem; line-height: 1.45; }

      .label {
        display: inline-flex;
        border: 1px solid var(--ink);
        padding: 0.36rem 0.58rem;
        background: #f1f1ee;
        font-size: 0.76rem;
        font-weight: 900;
        line-height: 1;
      }

      .label.yellow { background: var(--yellow); }
      .label.green { background: #b7dbc6; }
      .label.mint { background: #c7ddd5; }
      .label.peach { background: #f4c6aa; }
      .label.coral { background: #f2aaa1; }

      .section { margin-top: 2.5rem; }
      .table-wrap {
        overflow-x: auto;
        border: 1px solid var(--ink);
        background: var(--surface);
        margin-top: 1rem;
      }

      table {
        width: 100%;
        min-width: 760px;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.92rem;
      }

      th {
        border-bottom: 1px solid var(--ink);
        background: #f1f1ee;
        padding: 0.8rem 1rem;
        font-weight: 900;
      }

      td {
        border-bottom: 1px solid var(--ink);
        padding: 0.85rem 1rem;
        vertical-align: middle;
      }

      tr:last-child td { border-bottom: 0; }
      .strong { font-size: 1.2rem; font-weight: 900; white-space: nowrap; }
      .muted { color: var(--muted); }
      .cost-drivers {
        display: grid;
        grid-template-columns: 0.95fr 0.95fr 1.45fr;
        gap: 1.4rem;
      }
      .driver-card {
        border: 1px solid var(--ink);
        border-radius: 8px;
        background: var(--surface);
        padding: 1.35rem;
        text-align: center;
      }
      .driver-icon {
        display: inline-grid;
        width: 3rem;
        height: 3rem;
        place-items: center;
        border: 1px solid currentColor;
        border-radius: 999px;
        font-size: 1.25rem;
        font-weight: 900;
      }
      .driver-card h3 {
        margin: 1rem 0 0;
        font-size: 1.25rem;
        font-weight: 900;
      }
      .driver-card p {
        margin: 0.55rem 0 0;
        color: var(--muted);
        font-weight: 800;
      }
      .driver-card small {
        display: block;
        margin-top: 0.85rem;
        color: var(--muted);
        font-size: 0.76rem;
        line-height: 1.55;
      }
      .driver-orange { background: #fff7ef; }
      .driver-orange .driver-icon { color: #ff7a1a; }
      .driver-red { background: #fff4f5; }
      .driver-red .driver-icon { color: #e9434d; }
      .driver-teal { background: #f0fbf9; }
      .driver-teal .driver-icon { color: #21b8ad; }
      .cost-analysis-panel {
        display: grid;
        grid-template-columns: auto minmax(20rem, 1fr);
        align-items: center;
        gap: 1.75rem;
        height: 100%;
        border: 1px solid var(--ink);
        border-radius: 8px;
        background: var(--surface);
        padding: 1.25rem;
      }
      .cost-visual-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1.4rem;
        align-items: stretch;
        margin-top: 0;
      }
      .cost-visual-grid > .section {
        display: flex;
        flex-direction: column;
        min-width: 0;
        margin-top: 0;
      }
      .donut-wrap {
        display: grid;
        place-items: center;
      }
      .donut-chart {
        position: relative;
        width: 11.9rem;
        height: 11.9rem;
        border: 1px solid var(--ink);
        border-radius: 999px;
      }
      .donut-hole {
        position: absolute;
        inset: 28%;
        border: 1px solid var(--ink);
        border-radius: 999px;
        background: var(--surface);
      }
      .donut-legend {
        min-width: 0;
        padding-left: 0;
      }
      .legend-key {
        display: inline-block;
        flex: 0 0 auto;
        width: 1rem;
        height: 1rem;
        border: 1px solid var(--ink);
      }
      .donut-table {
        width: 100%;
        min-width: 0;
        border: 1px solid var(--ink);
        border-collapse: collapse;
        border-radius: 0;
        background: #ffffff;
        color: var(--ink);
        font-size: 0.9rem;
      }
      .donut-table th,
      .donut-table td {
        border: 1px solid var(--ink);
        background: #ffffff;
        color: var(--ink);
        padding: 0.55rem 0.65rem;
        text-align: left;
        vertical-align: middle;
      }
      .donut-table th {
        background: #f1f1ee;
        font-weight: 900;
      }
      .donut-table th:last-child,
      .donut-table th:nth-child(2),
      .donut-table .value-cell,
      .donut-table .amount-cell {
        text-align: center;
      }
      .donut-table .item-cell {
        display: inline-flex;
        align-items: center;
        gap: 0.55rem;
        font-weight: 800;
        white-space: nowrap;
      }
      .donut-table .value-cell {
        font-weight: 400;
        white-space: nowrap;
      }
      .donut-table .amount-cell {
        font-size: 0.9rem;
        font-weight: 400;
        text-align: center;
        white-space: nowrap;
      }
      .comparison-panel {
        display: flex;
        flex: 1;
        overflow-x: hidden;
        border: 1px solid var(--ink);
        border-radius: 8px;
        background: #ffffff;
        padding: 1rem;
        color: var(--ink);
      }
      .comparison-table {
        width: 100%;
        height: 100%;
        min-width: 0;
        table-layout: fixed;
        margin-top: 0;
        border: 1px solid var(--ink);
        background: #ffffff;
        color: var(--ink);
      }
      .comparison-table th,
      .comparison-table td {
        border: 1px solid var(--ink);
        background: #ffffff;
        color: var(--ink);
        padding: 0.55rem 0.5rem;
        vertical-align: middle;
      }
      .comparison-table thead tr,
      .comparison-table tbody tr {
        height: 20%;
      }
      .comparison-table thead th {
        background: #f1f1ee;
      }
      .comparison-table tbody tr.soft-row td {
        background: #f0fbf4;
      }
      .comparison-table tbody tr:last-child td {
        border-bottom: 1px solid var(--ink);
      }
      .comparison-table th,
      .comparison-table td {
        text-align: center;
      }
      .comparison-table th:first-child,
      .comparison-table td:first-child {
        text-align: center;
      }
      .scenario-type { font-weight: 900; }
      .scenario-type.blue { color: #3e55ff; }
      .scenario-type.purple { color: #8b35ff; }
      .scenario-type.orange { color: #ff6b1a; }
      .scenario-type.green { color: #00a85a; }
      .comparison-table .scenario-type,
      .comparison-table .scenario-type.blue,
      .comparison-table .scenario-type.purple,
      .comparison-table .scenario-type.orange,
      .comparison-table .scenario-type.green {
        color: var(--ink);
      }
      .scenario-graph {
        margin-top: 1rem;
        padding: 1.1rem;
        border: 1px solid var(--ink);
        background: var(--surface);
      }
      .scenario-axis,
      .scenario-row {
        display: grid;
        grid-template-columns: 12rem 1fr 16rem;
        gap: 1.2rem;
      }
      .scenario-axis {
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--ink);
        color: var(--muted);
        font-size: 0.72rem;
        font-weight: 900;
      }
      .axis-ticks,
      .range-axis {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
      .axis-ticks span:nth-child(n+2):nth-child(-n+4),
      .range-axis span:nth-child(n+2):nth-child(-n+4) { text-align: center; }
      .axis-ticks span:last-child,
      .range-axis span:last-child { text-align: right; }
      .scenario-row {
        align-items: center;
        padding: 1.1rem 0;
        border-bottom: 1px solid var(--ink);
      }
      .scenario-row:last-child { border-bottom: 0; padding-bottom: 0; }
      .scenario-name h3 { margin: 0; font-size: 1rem; font-weight: 900; }
      .scenario-name strong { display: block; margin-top: 0.55rem; font-size: 1.55rem; line-height: 1; }
      .scenario-name p { margin: 0.45rem 0 0; color: var(--muted); font-size: 0.72rem; font-weight: 700; }
      .scenario-bar { display: grid; gap: 0.35rem; }
      .range-bar {
        position: relative;
        height: 2.5rem;
        border: 1px solid var(--ink);
        background: var(--paper);
      }
      .range-bar span {
        position: absolute;
        top: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-left: 1px solid var(--ink);
        border-right: 1px solid var(--ink);
        background: var(--green);
        font-size: 0.8rem;
        font-weight: 900;
        line-height: 1;
        white-space: nowrap;
      }
      .range-axis {
        color: var(--muted);
        font-size: 0.68rem;
        font-weight: 700;
      }
      .range-axis-mobile { display: none; }
      .cost-breakdown { display: grid; gap: 0.55rem; font-size: 0.8rem; }
      .cost-parts {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        border: 1px solid var(--ink);
      }
      .cost-parts span { padding: 0.35rem 0.45rem; border-right: 1px solid var(--ink); }
      .cost-parts span:last-child { border-right: 0; }
      .cost-breakdown p { margin: 0; color: var(--muted); line-height: 1.45; }

      .split {
        display: grid;
        grid-template-columns: 0.95fr 1.05fr;
        gap: 1.4rem;
      }

      .composition {
        display: grid;
        gap: 0.75rem;
      }

      .composition-card {
        border: 1px solid var(--ink);
        background: var(--surface);
        padding: 1rem;
      }

      .composition-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 0.75rem;
      }

      .composition-head h3 { margin: 0; font-size: 1rem; }
      .composition-head strong { font-size: 1.25rem; }
      .stack-bar {
        display: flex;
        height: 1.75rem;
        overflow: hidden;
        border: 1px solid var(--ink);
        background: var(--paper);
      }
      .stack-bar span {
        height: 100%;
        border-right: 1px solid var(--ink);
      }
      .stack-bar span:last-child { border-right: 0; }
      .legend {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.5rem;
        margin-top: 0.75rem;
        color: var(--muted);
        font-size: 0.76rem;
        font-weight: 700;
      }

      .yellow { background: var(--yellow); }
      .green { background: var(--green); }
      .mint { background: var(--mint); }
      .pink { background: var(--pink); }

      .saving-row {
        display: grid;
        grid-template-columns: 8rem 8rem 1fr;
        align-items: center;
        border: 1px solid var(--ink);
        background: var(--surface);
        font-size: 0.9rem;
      }
      .saving-row + .saving-row { border-top: 0; }
      .saving-row div { padding: 0.85rem 1rem; }
      .saving-row div:not(:last-child) { border-right: 1px solid var(--ink); }
      .saving-row strong { font-size: 1.2rem; }

      .route-card {
        display: grid;
        grid-template-columns: 7rem 1fr;
        border-bottom: 1px solid var(--ink);
        background: var(--surface);
      }
      .route-card:last-child { border-bottom: 0; }
      .route-card .budget {
        border-right: 1px solid var(--ink);
        background: var(--yellow);
        padding: 1rem;
        font-size: 1.2rem;
        font-weight: 900;
      }
      .route-card .route-body { padding: 1rem; }

      @media (max-width: 980px) {
        .summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .metric { border-top: 1px solid var(--ink); }
        .cost-visual-grid,
        .cost-drivers,
        .cost-analysis-panel {
          grid-template-columns: 1fr;
        }
        .cost-analysis-panel,
        .comparison-panel {
          height: auto;
        }
        .comparison-table {
          height: auto;
        }
        .comparison-table thead tr,
        .comparison-table tbody tr {
          height: auto;
        }
        .split { grid-template-columns: 1fr; }
        .scenario-axis { display: none; }
        .scenario-row { grid-template-columns: 1fr; gap: 0.85rem; }
        .range-axis-mobile { display: grid; }
      }

      @media (max-width: 640px) {
        .summary { grid-template-columns: 1fr; }
        .donut-chart {
          width: min(16.5rem, 100%);
          height: auto;
          aspect-ratio: 1 / 1;
        }
        .saving-row { grid-template-columns: 1fr; }
        .saving-row div:not(:last-child) { border-right: 0; border-bottom: 1px solid var(--ink); }
      }
  `,
  body: `<main class="wrap">
      ${costPreDepartureCosts(costPreDepartureRows)}

      <div class="cost-visual-grid">
        ${costBreakdownAnalysis(costBreakdownParts)}
        ${costScenarioComparisonTable(costScenarioComparisonRows)}
      </div>

      <section class="section">
        <h2 class="summary-title">年度预算场景对比</h2>
        ${costScenarioGraph(costScenarioRows)}
      </section>

      <section class="section split">
        <div>
          <h2 class="summary-title">典型案例费用构成</h2>
          <div class="composition">
            ${costCompositions
              .map(
                ([profile, total, parts]) => `<article class="composition-card">
              <div class="composition-head"><h3>${escapeHtml(profile)}</h3><strong>${escapeHtml(total)}</strong></div>
              ${costStack(parts)}
              <div class="legend">${parts.map(([label, value]) => `<span>${escapeHtml(label)} ${escapeHtml(String(value) + "万")}</span>`).join("")}</div>
            </article>`
              )
              .join("")}
          </div>
        </div>
        <div>
          <h2 class="summary-title">鍓嶆湡涓€娆℃€у噯澶囪垂</h2>
          ${topikTable(
            ["项目", "鍙傝€冭垂鐢?", "璇存槑"],
            costPreparationRows.map((row) => `<tr>${row.map((cell, index) => `<td class="${index === 1 ? "strong" : ""}">${escapeHtml(cell)}</td>`).join("")}</tr>`)
          )}
        </div>
      </section>

      <section class="section">
        <h2 class="summary-title">每月生活成本速查</h2>
        ${topikTable(
          ["项目", "首尔地区/鏈?", "地方城市/鏈?", "鎬庝箞鍒ゆ柇"],
          costMonthlyRows.map((row) => `<tr>${row.map((cell, index) => `<td class="${index === 0 ? "strong" : index === 3 ? "muted" : ""}">${escapeHtml(cell)}</td>`).join("")}</tr>`)
        )}
      </section>

      <section class="section split">
        <div>
          <h2 class="summary-title">闄嶄綆鎴愭湰浼樺厛绾</h2>
          ${costSavingRows
            .map(
              ([label, value, detail]) =>
                `<article class="saving-row"><div><strong>${escapeHtml(label)}</strong></div><div><strong>${escapeHtml(value)}</strong></div><div class="muted">${escapeHtml(detail)}</div></article>`
            )
            .join("")}
        </div>
        <div>
          <h2 class="summary-title">鎸夐绠楅€夎矾绾</h2>
          <div class="table-wrap" style="margin-top:0">
            ${costBudgetRoutes
              .map(
                ([budget, route, detail]) => `<article class="route-card"><div class="budget">${escapeHtml(budget)}</div><div class="route-body"><strong>${escapeHtml(route)}</strong><p class="muted">${escapeHtml(detail)}</p></div></article>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <p class="muted" style="margin-top:3rem;border-top:1px solid var(--ink);padding-top:1.25rem;line-height:1.8;font-size:0.9rem">
        璇存槑锛氭湰椤电敱銆?025骞撮煩鍥芥湰绉戠暀瀛﹁垂鐢ㄧ爺绌舵姤鍛婏紙鍩轰簬100+鐪熷疄妗堜緥锛夈€嬪帇缂╂暣鐞嗐€傝垂鐢ㄥ潎涓轰汉姘戝竵浼扮畻锛屽鏍℃斂绛栥€佷笓涓氥€佹眹鐜囧拰涓汉娑堣垂浼氶€犳垚娴姩锛屾渶缁堜互瀛︽牎瀹樻柟瀛﹁垂琛ㄣ€佸鑸嶉€氱煡鍜岀璇?淇濋櫓瑕佹眰涓哄噯銆?
      </p>
    </main>`
});

const applicationSummaryMetrics = [
  ["璺嚎鏍稿績", "2+2 / 1+3", "鍏堝湪涓浗璇昏瑷€鎴栧熀纭€璇撅紝鍐嶈荡闊╁浗瀹屾垚鏈銆?", "mint"],
  ["鏈€澶у尯鍒?", "学籍归属", "璁″垝鍐呯湅涓柟瀛︾睄锛岃鍒掑閲嶇偣鐪嬮煩鏂瑰绫嶃€?", "yellow"],
  ["璇█搴曠嚎", "TOPIK 3", "澶氭暟鍑哄銆佸叆瀛︽垨鎻掔彮椤圭洰鐨勫父瑙佽捣鐐广€?", "green"],
  ["鏇寸ǔ目标", "TOPIK 4+", "鎻掔彮銆侀灏斿湀銆佸瀛﹂噾閫氬父鏇撮渶瑕佽繖涓尯闂淬€?", "peach"],
  ["鏍搁獙鍏ュ彛", "鐩戠骞冲彴", "椤圭洰鎵瑰銆佸鏍″畼缃戙€佺暀鏈嶈鏄庤涓€璧锋煡銆?", "gray"],
  ["浠樻鍓?", "合同拆项", "瀛﹁垂銆佺鐞嗚垂銆侀€€璐广€佹湭杈炬爣澶勭悊鍐欐竻銆?", "pink"]
];

const applicationRouteTypes = [
  {
    title: "璁″垝鍐呬腑澶栧悎浣滃姙瀛?+2",
    tag: "楂樿€冨織鎰?国内学籍",
    color: "mint",
    body: "杩欑被椤圭洰閫氬父绾冲叆鏅€氶珮绛夋暀鑲叉嫑鐢熻鍒掓垨鏈夋暀鑲蹭富绠￠儴闂ㄦ壒澶嶃€傚鐢熷湪涓柟澶у瀹屾垚鍓嶆璇剧▼锛岃揪鏍囧悗璧撮煩鍥藉悎浣滃ぇ瀛﹀畬鎴愬悗娈佃绋嬶紝甯歌缁撴灉鏄腑鏂瑰浣?闊╂柟瀛︿綅锛屾垨涓柟瀛﹀巻瀛︿綅涓轰富銆侀煩鏂瑰涔犵粡鍘嗕负杈呫€?",
    points: ["优先看教育部中外合作办学监管平台", "纭涓撲笟浠ｇ爜銆佹嫑鐢熻鍒掋€佹瘯涓氳瘉涔﹀啓娉?", "适合想保留国内本科路径的学生"]
  },
  {
    title: "璁″垝澶栧浗闄呮湰绉?出国培训1+3銆?+2",
    tag: "国内预备+韩国学位",
    color: "green",
    body: "杩欑被椤圭洰甯哥敱鍥藉唴楂樻牎鍥介檯瀛﹂櫌鎴栫户缁暀鑲插钩鍙版壙鍔烇紝鍥藉唴闃舵浠ラ煩璇€佹ˉ姊佽銆侀儴鍒嗕笓涓氬熀纭€璇惧拰鐣欏鏈嶅姟涓轰富銆傞儴鍒嗛」鐩槑纭鏄庢棤涓柟鏈鏅€氬绫嶏紝鏈€缁堜互闊╁浗澶у瀛﹀＋瀛︿綅鍜岀暀鏈嶈璇佷负鐩爣銆?",
    points: ["鍚堝悓閲岃鍐欐竻闊╂柟瀛︾睄浣曟椂娉ㄥ唽", "纭鍥藉唴闃舵瀛﹁垂銆佺鐞嗚垂銆侀€€璐硅鍒?", "閫傚悎楂樿€冨悗鐩存帴杞煩鍥芥湰绉戣矾寰勭殑瀛︾敓"]
  },
  {
    title: "鍦ㄦ牎鐢熸牎闄?+2/3+1",
    tag: "校内选拔",
    color: "yellow",
    body: "杩欑被椤圭洰涓昏闈㈠悜宸茬粡鍦ㄥ浗鍐呭ぇ瀛﹀氨璇荤殑瀛︾敓锛岀敱鍥介檯浜ゆ祦澶勬垨鏁欏姟澶勫彂甯冮€夋淳閫氱煡銆傚悕棰濋€氬父杈冨皯锛岃姹侴PA銆乀OPIK銆佷笓涓氬尮閰嶅拰瀛﹂櫌鎺ㄨ崘锛屼紭鍔挎槸鍙屾柟宸叉湁瀛﹀垎浜掕鍗忚銆?",
    points: ["鍙鏈牎鎸囧畾骞寸骇寮€鏀?", "鍚嶉銆佷笓涓氥€佸瀛﹂噾姣忓勾鍙樺寲", "閫傚悎宸茬粡鍏ヨ鍥藉唴鏈涓旀垚缁╃ǔ定的学生"]
  },
  {
    title: "闊╁浗澶у鎻掔彮鐩寸敵",
    tag: "无中方项目也可做",
    color: "peach",
    body: "瀹屾垚鍥藉唴澶у1年或2骞村悗锛屽彲浠ョ洿鎺ユ寜闊╁浗澶у澶栧浗浜烘彃鐝姹傜敵璇蜂簩骞寸骇鎴栦笁骞寸骇銆傚畠涓嶄緷璧栧浗鍐呭悎浣滈」鐩紝浣嗘潗鏂欍€佷笓涓氬尮閰嶃€佸鍒嗚瀹氬拰璇█瑕佹眰瑕佽嚜宸遍€愰」澶勭悊銆?",
    points: ["浜屽勾绾?涓夊勾绾ф彃鐝姹備笉鍚?", "多数学校看TOPIK鎴栨牎鍐呴煩璇祴璇?", "閫傚悎鑷敵鑳藉姏寮恒€佺洰鏍囧鏍℃槑纭殑瀛︾敓"]
  }
];

const applicationComparisonRows = [
  ["璁″垝鍐呭悎浣滃姙瀛?", "涓浗澶у", "閫氬父鏈変腑鏂瑰绫嶏紝鍙兘鍙栧緱鍙屽浣?", "看项目批复和韩方要求", "瀛︽牎灏戙€佷笓涓氬浐瀹氥€佸垎鏁扮嚎鍜屽悕棰濆彈闄?"],
  ["璁″垝澶?+3/2+2", "涓浗鍥藉唴棰勫璇剧▼", "澶氫互闊╁浗澶у瀛﹀＋瀛︿綅涓虹洰鏍?", "甯歌TOPIK 3鎴栨牎鑰冭揪鏍?", "瑕佹牳楠屾槸鍚︽湁鏅€氭湰绉戝绫嶃€侀煩鏂瑰绫嶅拰璁よ瘉鍙ｅ緞"],
  ["校际2+2/3+1", "已入读的国内本科", "鎸夊弻鏂瑰崗璁瀹氾紝鍙兘鍙屽浣?", "TOPIK 3-4銆丟PA銆佸闄㈡帹鑽?", "鍙潰鍚戞湰鏍″鐢燂紝鍚嶉灏戯紝涓撲笟鍖归厤涓ユ牸"],
  ["韩国插班直申", "鍥藉唴澶у鎴栦笓绉戦樁娈?", "闊╁浗澶у瀛︿綅", "学校自定，插班常更高", "鏉愭枡鍘嬪姏鏈€澶э紝瀛﹀垎杞崲涓嶄竴瀹氭弧棰?"]
];

const applicationExamples = [
  ["璁″垝鍐呭悎浣滃姙瀛?", "鐑熷彴澶у x 妾€鍥藉ぇ瀛?", "鏉愭枡绉戝涓庡伐绋?", "本科4骞达紝瀛︾敓鍙€夋嫨鍦ㄧ儫鍙板畬鎴愶紝涔熷彲鍙傚姞2+2璧撮煩淇涓ゅ勾涓撲笟璇俱€?", "鐪嬩笓涓氫唬鐮?80401H銆佹嫑鐢熻鍒掑拰褰撳勾绠€绔犮€?", "https://emc.ytu.edu.cn/info/1176/2499.htm"],
  ["璁″垝鍐呭悎浣滃姙瀛?", "鍗庡寳姘村埄姘寸數澶у x 鍚槑澶у", "环境设计", "椤甸潰璇存槑椤圭洰缁忎腑鍥芥暀鑲查儴鎵瑰噯锛屽浗鍐?年后自愿赴启明完成后2骞淬€?", "纭褰撳勾鎶ュ悕閫氱煡銆侀煩鏂瑰叆瀛﹁姹傚拰鍙屽浣嶆潯浠躲€?", "https://www2.ncwu.edu.cn/yishu/info/1040/2658.htm"],
  ["璁″垝鍐?鐪佹壒澶嶅妗?", "铜陵学院 x 鍙堟澗澶у", "浼氳瀛︺€佸浗闄呯粡娴庝笌璐告槗", "鍓?骞撮摐闄靛闄紝鍚?骞村張鏉惧ぇ瀛︼紝椤甸潰绉?015骞寸敱鏁欒偛閮ㄥ妗堛€?", "鑰侀」鐩渶鏍搁獙鏄惁浠嶅湪褰撳勾鎷涚敓銆?", "https://www.tlu.edu.cn/_t818/2019/1220/c61a66867/page.htm"],
  ["璁″垝澶栧嚭鍥藉煿璁?+2", "涓浗鍦拌川澶у(姝︽眽) x 鍙堢煶澶у", "鍟嗙銆佸伐绉戙€佽壓浣撱€佷紶濯掔瓑", "椤甸潰鏄庣‘鏃犱腑鍥藉湴璐ㄥぇ瀛?姝︽眽)瀛︾睄锛屾敞鍐岄煩鍥藉張鐭冲ぇ瀛﹀绫嶃€?", "閲嶇偣鐪嬪悎鍚屻€侀煩鏂瑰绫嶅紑濮嬫椂闂村拰璐圭敤鏄庣粏銆?", "https://iec.cug.edu.cn/info/1063/19331.htm"],
  ["璁″垝澶栧嚭鍥藉煿璁?+2", "婀栧寳宸ヤ笟澶у x 鍙堢煶澶у", "鍟嗙銆佸伐绉戙€佽壓浣?", "国内2年后TOPIK 3鍙敵璇疯荡闊╋紝瀹屾垚鍚庤幏鍙堢煶澶у瀛﹀＋瀛︿綅銆?", "奖学金按国内成绩、TOPIK鍜屽湪闊╂垚缁╂诞鍔ㄣ€?", "https://sie.hbut.edu.cn/info/1021/2218.htm"],
  ["国际本科1+3", "骞垮窞宸ュ晢瀛﹂櫌 x 涓滃浗澶у", "IT銆佽兘婧愩€佽瑷€鏂囧寲銆佹暀鑲层€佸晢绉戠瓑", "鍙戝竷浼氭潗鏂欑О国内1骞村悗璧撮煩鍥藉崌璇诲ぇ浜岋紝鍏ュ鍗虫敞鍐屼笢鍥藉ぇ瀛﹀绫嶃€?", "纭鏍″尯銆佷笓涓氥€佸绫嶅拰鐣欐湇璁よ瘉鍙ｅ緞銆?", "https://ies.gzgs.edu.cn/info/1072/1973.htm"],
  ["国际本科1+3", "广州华立学院韩国方向", "鐏靛北澶у銆佷含绂忓ぇ学等", "国内1骞磋瑷€鍜岄儴鍒嗕笓涓氳锛岃揪鏍囧悗璧撮煩鍥藉悎浣滈櫌鏍?骞淬€?", "椤甸潰钀ラ攢琛ㄨ堪杈冨锛岄渶閫愰」鏍搁獙璇佹嵁銆?", "https://www.hualixy.edu.cn/jlxy/gjxm/1xgjbkxm/content_66398"],
  ["校际2+2鍙屽浣?", "澶ц繛姘戞棌澶у x 寤哄浗澶у", "澶氭暟涓撲笟锛屾帓闄ら儴鍒嗗闄?", "鏈浜屽勾绾х敵璇凤紝瑕佹眰TOPIK 3鎴栭€氳繃寤哄浗澶у鍦ㄧ嚎闊╄鏍¤€冦€?", "閫傚悎鍦ㄦ牎鐢燂紝鏌ョ湅鏁欏姟澶勫綋骞撮€夋淳閫氱煡銆?", "https://new.dlnu.edu.cn/gjjl/info/1032/1356.htm"],
  ["校际2+2鍙屽浣?", "璐靛窞澶у x 鍏ㄥ寳澶у", "校内协议项目", "闈㈠悜鍏ㄦ棩鍒舵湰绉戠敓锛岄€氱煡瑕佹眰GPA涓嶄綆浜?.0骞堕€氳繃TOPIK 4銆?", "鍚嶉灏戯紝涓昏闈㈠悜鏈牎鎸囧畾骞寸骇瀛︾敓銆?", "https://oir.gzu.edu.cn/2024/0325/c18480a214134/page.htm"],
  ["校际2+2鍙屽浣?", "瑗垮畨鐭虫补澶у x 鍏夊窞澶у", "鏂伴椈銆佸箍鍛娿€佽璁°€佺粡钀ャ€佸伐绉戠瓑", "瀹屾垚鍥藉唴涓ゅ勾鍚庤荡闊╋紝鍏堣闊╁浗璇紝杈綯OPIK 3鍚庢彃鐝笁骞寸骇銆?", "娉ㄦ剰璇█骞村彲鑳芥媺闀垮疄闄呮瘯涓氬懆鏈熴€?", "https://gjjl.xsyu.edu.cn/info/1127/1389.htm"]
];

const applicationTimelineRows = [
  ["楂樹簩涓?楂樹笁涓?", "鍏堝畾璺嚎", "鍐冲畾璧伴珮鑰冭鍒掑唴鍚堜綔鍔炲銆佽鍒掑鍥介檯鏈锛岃繕鏄厛璇诲浗鍐呮湰绉戝啀浜夊彇鏍￠檯閫夋淳銆?"],
  ["楂樹笁涓?", "核验项目", "鏌ユ暀鑲查儴/瀛︽牎瀹樼綉銆侀煩鏂瑰畼缃戙€佹嫑鐢熺畝绔犮€佸绫嶅綊灞炪€佽垂鐢ㄥ悎鍚屽拰閫€璐硅鍒欍€?"],
  ["鍏ュ鍓?", "璇█涓庢潗鏂?", "鍑嗗鎶ょ収銆佷翰灞炲叧绯汇€佹瘯涓氳瘉/鎴愮哗鍗曘€佸叕璇佽璇併€乀OPIK鎴栨牎鍐呴煩璇祴璇曘€?"],
  ["鍥藉唴闃舵绗?骞?", "把韩语拉到可出境", "1+3鑷冲皯鍐睺OPIK 3；目标首尔圈或插班，尽量把目标放到TOPIK 4浠ヤ笂銆?"],
  ["璧撮煩鍓?个月", "纭褰曞彇涓庣璇?", "鎷挎爣鍑嗗叆瀛﹁鍙€佸璐圭即绾冲嚟璇併€佷綇瀹垮畨鎺掋€丏-2绛捐瘉鏉愭枡鍜屼繚闄╄姹傘€?"],
  ["鍦ㄩ煩绗?学期", "淇滸PA鍜屽嚭鍕?", "濂栧閲戙€佺画绛俱€佷笓涓氬垎娴佸拰姣曚笟瑕佹眰閮界湅鍑哄嫟銆佸鍒嗗拰鎴愮哗銆?"]
];

const applicationRiskChecks = [
  ["鍔炲鍚堟硶鎬?", "璁″垝鍐呴」鐩煡涓鍚堜綔鍔炲鐩戠骞冲彴锛涜鍒掑椤圭洰鑷冲皯瑕佺湅鍒颁腑鏂瑰畼缃戙€侀煩鏂瑰畼缃戞垨姝ｅ紡鍚堜綔鏂囦欢銆?"],
  ["学籍归属", "闂竻鏄惁鏈変腑鍥芥櫘閫氭湰绉戠粺鎷涘绫嶃€佷綍鏃舵敞鍐岄煩鏂瑰绫嶃€佸け璐ュ悗鑳藉惁杞洖鏅€氫笓涓氥€?"],
  ["鏂囧嚟涓庤璇?", "纭姣曚笟璇佷功棰佸彂瀛︽牎銆佽瘉涔︽枃瀛椼€佹槸鍚﹂渶瀹為檯璧撮煩绾夸笅瀛︿範锛屼互鍙婃槸鍚﹀睘浜庣暀鏈嶈璇佸彈鐞嗚寖鍥淬€?"],
  ["璇█闂ㄦ", "涓嶈鍙湅鏈€低入学线。TOPIK 3鑳藉叆瀛︿笉绛変簬鑳藉惉鎳備笓涓氳锛屾彃鐝拰濂栧閲戦€氬父鏇寸湅TOPIK 4-6銆?"],
  ["专业衔接", "闊╁浗鎻掔彮浼氱湅鍘熶笓涓氬拰宸蹭慨瀛﹀垎銆傝法涓撲笟銆佽壓鏈璁°€佸尰瀛︺€佸笀鑼冦€佷紶濯掔瓑瑕佹彁鍓嶇‘璁ら檺鍒躲€?"],
  ["费用合同", "鍥藉唴瀛﹁垂銆侀煩鏂瑰璐广€佷綇瀹胯垂銆佸浗闄呯鐞嗚垂銆佺璇佹湇鍔¤垂鍜岄€€璐规潯娆捐鍒嗗紑鍐欐竻妤氥€?"],
  ["钀ラ攢绾㈢嚎", "鐪嬪埌鍚嶆牎淇濆綍銆佹棤闇€鍑哄涔熻兘璁よ瘉銆佹瘯涓氬寘灏变笟銆佸浣嶇櫨鍒嗙櫨璁よ瘉绛夎娉曪紝鍏堟殏鍋滀粯娆俱€?"]
];

const applicationSourceLinks = [
  ["鏁欒偛閮ㄤ腑澶栧悎浣滃姙瀛︾洃绠″伐浣滀俊鎭钩鍙?", "https://www.crs.jsj.edu.cn/"],
  ["Study in Korea：本科与插班制度", "https://www.studyinkorea.go.kr/en_US/plan/schoolType.do?tab=undergraduate-college"],
  ["Study in Korea锛氳瑷€瑕佹眰涓嶵OPIK", "https://studyinkorea.go.kr/ko/plan/examAndKoreanStudy.do"],
  ["鏁欒偛娑夊鐩戠淇℃伅缃戯細瀛﹀巻瀛︿綅璁よ瘉椤荤煡", "https://jsj.moe.gov.cn/n1/12017.shtml"],
  ["鏁欒偛閮ㄧ暀瀛︽湇鍔′腑蹇?", "https://portal.cscse.edu.cn/"],
  ["鐑熷彴澶у x 妾€鍥藉ぇ瀛?", "https://emc.ytu.edu.cn/info/1176/2499.htm"],
  ["涓浗鍦拌川澶у(姝︽眽) x 鍙堢煶澶у", "https://iec.cug.edu.cn/info/1063/19331.htm"],
  ["婀栧寳宸ヤ笟澶у x 鍙堢煶澶у", "https://sie.hbut.edu.cn/info/1021/2218.htm"],
  ["骞垮窞宸ュ晢瀛﹂櫌 x 涓滃浗澶у", "https://ies.gzgs.edu.cn/info/1072/1973.htm"]
];

const applicationDeepSummary = [
  ["宸叉牳楠屾牱鏈?", "28椤?", "鐩戠骞冲彴銆佸鏍″畼缃戙€佹嫑鐢熺畝绔犲拰鏍￠檯閫氱煡鍚堝苟鏁寸悊銆?", "mint"],
  ["璁″垝鍐呭叆鍙?", "楂樿€冪粺鎷?", "绾冲叆鏅€氶珮绛夋暀鑲叉嫑鐢熻鍒掞紝鍏堢湅涓撲笟浠ｇ爜鍜屾壒澶嶃€?", "yellow"],
  ["璁″垝澶栧叆鍙?", "考试/闈㈣瘯", "甯歌涓洪珮涓瘯涓氥€佹湰绉戠嚎鎴栬嫳璇?闊╄鎴愮哗鍏嶇瑪璇曘€?", "green"],
  ["国内阶段", "1.8-8涓?骞?", "鍏紑鏍锋湰宸紓寰堝ぇ锛岄绉戝拰鍚嶆牎椤圭洰鏈€楂樸€?", "peach"],
  ["韩国阶段", "绾?-6涓?骞?", "鎸夊鏍°€佷笓涓氥€佸瀛﹂噾鍜屾眹鐜囨诞鍔ㄣ€?", "pink"],
  ["璇█鍒嗘按宀?", "TOPIK 3/4", "3绾ц兘鍑哄锛?绾ф洿鎺ヨ繎鎻掔彮銆佸瀛﹂噾鍜屽惉璇惧畨鍏ㄧ嚎銆?", "gray"]
];

const applicationRouteMatrix = [
  {
    route: "璁″垝鍐呬腑澶栧悎浣滃姙瀛?",
    badge: "楂樿€冪粺鎷?",
    color: "mint",
    entry: "鍙傚姞楂樿€冿紝鎸夌渷绾ф嫑鐢熻鍒掑綍鍙栵紱鑹烘湳绫诲彟鐪嬬粺鑰?鏍¤€冭鍒欍€?",
    language: "鍏ュ閫氬父涓嶅厛鍗OPIK；赴韩或奖学金节点常要求TOPIK 3-4銆?",
    domesticFee: "绾?.8-4.1涓?骞?",
    koreaFee: "可全程国内或赴韩；赴韩按韩方标准",
    risk: "涓嶆槸鎵€鏈夐」鐩兘鍙戦煩鏂瑰浣嶏紝涔熶笉鏄墍鏈夐」鐩兘蹇呴』鍑哄浗銆?"
  },
  {
    route: "璁″垝澶?+3 / 2+2国际本科",
    badge: "预科/出国培训",
    color: "green",
    entry: "楂樹腑姣曚笟鎴栧悓绛夊鍘嗭紱鏈绾裤€佽嫳璇?0-100銆侀泤鎬?.5銆乀OPIK1绛夊父浣滀负鍏嶇瑪璇曟潯浠躲€?",
    language: "国内阶段冲TOPIK 3锛涚洰鏍囬灏斿湀鎴栫儹闂ㄤ笓涓氬缓璁甌OPIK 4+銆?",
    domesticFee: "绾?.4-8涓?骞?",
    koreaFee: "绾?-5涓?骞村璐癸紝鍙︿綇瀹跨敓娲?",
    risk: "甯告棤涓柟鏅€氭湰绉戝绫嶏紝鍚堝悓蹇呴』鍐欐竻闊╂柟瀛︾睄涓庤璇佽矾寰勩€?"
  },
  {
    route: "鍦ㄦ牎鐢熸牎闄?+2 / 3+1",
    badge: "校内选拔",
    color: "yellow",
    entry: "閫氬父闈㈠悜鏈牎澶т簩鎴栨寚瀹氬勾绾э紱鐪婫PA銆佹棤鎸傜銆佸闄㈡帹鑽愩€佷笓涓氬尮閰嶃€?",
    language: "TOPIK 3璧锋锛孴OPIK 4更常见；英授项目另看CET-6/闆呮€?鎵樼銆?",
    domesticFee: "正常缴纳本校学费",
    koreaFee: "鍑忓厤鍚庣害1.8-6.2涓?骞?",
    risk: "鍚嶉灏戯紝椤圭洰姣忓鏈熷彉鍖栵紝瀛﹀垎杞崲鍜屾瘯涓氳姹傝鐪嬫暀鍔￠€氱煡銆?"
  },
  {
    route: "涓撳崌鏈?/ 鎻掔彮鐩村崌",
    badge: "澶т笓鎴栨湰绉戦樁娈?",
    color: "peach",
    entry: "涓夊勾鍒朵笓绉戙€佸浗鍐呮湰绉?-2骞存垨宸蹭慨瀛﹀垎锛涢煩鍥藉ぇ瀛︽寜浜?涓?鍥涘勾绾ф彃鐝鏍搞€?",
    language: "TOPIK 3常见，毕业或升硕常看TOPIK 4銆?",
    domesticFee: "培训费约2.6-4涓囦竴娆℃垨鎸夊勾",
    koreaFee: "绾?.6-5.2涓?骞?",
    risk: "璺ㄤ笓涓氬拰瀛﹀垎璁ゅ畾涓嶇ǔ瀹氾紝鍖诲銆佸笀鑼冦€佽壓鏈被闄愬埗鏇村銆?"
  }
];

const applicationProgramCards = [
  {
    kind: "plan",
    label: "璁″垝鍐?",
    color: "mint",
    school: "鐑熷彴澶у x 妾€鍥藉ぇ瀛?",
    mode: "4骞存湰绉戯紝鍙叧娉?+2赴韩机会",
    major: "鏉愭枡绉戝涓庡伐绋?080401H",
    entry: "楂樿€冪粺鎷涳紝鐗╃悊+鍖栧锛屽北涓滅敓婧愪负涓?",
    language: "鍏ュ涓嶄互TOPIK涓虹‖闂ㄦ",
    fee: "CRS鍒楁槑100浜?鏈燂紱瀛﹁垂浠ョ渷鎷涘姙鍏竷涓哄噯",
    costMin: 3.5,
    costMax: 4,
    verify: "CRS缂栧彿MOE37KR2A20111193N锛岄煩鏂硅瘉涔︽爮涓烘棤锛屽厛鐪嬩腑鏂瑰鍘嗚矾寰勩€?",
    href: "https://www.crs.jsj.edu.cn/aproval/detail/669"
  },
  {
    kind: "plan",
    label: "璁″垝鍐?",
    color: "mint",
    school: "鍗庡寳姘村埄姘寸數澶у x 鍚槑澶у",
    mode: "4年本科，国内2骞村悗鍙嚜鎰胯荡闊?骞?",
    major: "环境设计 130503H",
    entry: "楂樿€冭壓鏈被褰曞彇锛?20浜?鏈?",
    language: "璧撮煩鍓嶇湅闊╂柟鍏ュ瑕佹眰",
    fee: "瀛﹁垂浠ュ綋骞磋壓鏈被涓鍚堜綔鎷涚敓璁″垝涓哄噯",
    costMin: 2.5,
    costMax: 4,
    verify: "CRS鏄剧ず招生起止2017-2026锛屾壒鍑嗕功鏈夋晥鑷?030-12-31銆?",
    href: "https://www.crs.jsj.edu.cn/aproval/detail/2277"
  },
  {
    kind: "plan",
    label: "璁″垝鍐呮満鏋?",
    color: "mint",
    school: "闀挎槬澶у鍚槑瀛﹂櫌 x 鍚槑澶у",
    mode: "闈炵嫭绔嬫硶浜轰腑澶栧悎浣滃姙瀛︽満鏋?",
    major: "杞﹁締宸ョ▼銆侀鍝佺瀛︺€佺數姘斿伐绋?",
    entry: "楂樿€冪粺鎷涳紝450浜?骞?",
    language: "鎸夊闄㈠煿鍏绘柟妗堟帹杩?",
    fee: "瀛﹁垂浠ラ暱鏄ュぇ瀛﹀綋骞存嫑鐢熺珷绋嬩负鍑?",
    costMin: 2.5,
    costMax: 4,
    verify: "CRS鏄剧ず招生起止2022-2038锛屽姙瀛︽€昏妯?800浜恒€?",
    href: "https://www.crs.jsj.edu.cn/aproval/detail/3163"
  },
  {
    kind: "plan",
    label: "璁″垝鍐?",
    color: "mint",
    school: "南京晓庄学院 x 鍙堟澗澶у",
    mode: "4骞存湰绉戯紝绗笁瀛﹀勾鍙荡闊?",
    major: "学前教育 040106H",
    entry: "楂樿€冪粺鎷涳紝40浜?鏈?",
    language: "璧撮煩鎸夊張鏉惧ぇ瀛﹁姹?",
    fee: "鍥藉唴鍏紑璁″垝甯歌涓?.2涓?骞达紝璧撮煩鎸夐煩鏂规爣鍑?",
    costMin: 2.2,
    costMax: 3.8,
    verify: "CRS鏄剧ず招生起止2014-2025锛屾壒鍑嗕功鏈夋晥鑷?029-12-31銆?",
    href: "https://www.crs.jsj.edu.cn/aproval/detail/1051"
  },
  {
    kind: "plan",
    label: "璁″垝鍐呮満鏋?",
    color: "mint",
    school: "椴佷笢澶у钄氬北鑸硅埗涓庢捣娲嬪闄?",
    mode: "4骞存湰绉戯紝闈炵嫭绔嬫硶浜烘満鏋?",
    major: "鏈烘銆佽埞鑸舵捣娲嬨€佺數姘?",
    entry: "楂樿€冪粺鎷涳紝460浜?骞?",
    language: "鎸夊闄㈠煿鍏绘柟妗堟帹杩?",
    fee: "瀛﹁垂浠ラ瞾涓滃ぇ瀛︽嫑鐢熺珷绋嬩负鍑?",
    costMin: 2.5,
    costMax: 4,
    verify: "CRS鏄剧ず涓庨煩鍥借敋灞卞ぇ学合作，招生起止2013-2027銆?",
    href: "https://www.crs.jsj.edu.cn/aproval/detail/913"
  },
  {
    kind: "plan",
    label: "璁″垝鍐呮満鏋?",
    color: "mint",
    school: "娌冲崡宸ヤ笟澶у浠佽嵎鐞嗗伐瀛﹂櫌",
    mode: "4骞存湰绉戯紝鍙笉浠ュ嚭鍥戒负蹇呰鏉′欢",
    major: "鐢熺墿宸ョ▼銆佸寲宸ャ€佺┖闂翠俊鎭?",
    entry: "楂樿€冪粺鎷涳紝2026年起招生",
    language: "鎸夊闄㈠煿鍏绘柟妗堟帹杩?",
    fee: "鏂拌椤圭洰锛屽璐瑰緟褰撳勾鎷涚敓绔犵▼",
    costMin: 3,
    costMax: 5,
    verify: "CRS鏄剧ず每年270浜猴紝闊╂柟鍙巿鐢熷懡宸ュ/鍖栧宸ュ/绌洪棿淇℃伅宸ュ瀛︿綅銆?",
    href: "https://www.crs.jsj.edu.cn/aproval/detail/3737"
  },
  {
    kind: "plan",
    label: "璁″垝鍐?",
    color: "mint",
    school: "鍝堝皵婊ㄥ闄?x 涓栨槑澶у",
    mode: "中韩联合办学，可3+1",
    major: "椋熷搧绉戝涓庡伐绋?",
    entry: "绾冲叆楂樿€冭鍒掞紝鍙嫑鏈夊織鎰垮鐢?",
    language: "3年内达到TOPIK 4锛涜瑷€培训不另收费",
    fee: "闊╂柟绾?14涓囬煩甯?骞达紝绾?.11万人民币；TOPIK4鍙噺鍏?0%",
    costMin: 2.05,
    costMax: 4.11,
    verify: "学校问答列明TOPIK4銆佸璐广€佷綇瀹跨害9000鍏?骞淬€?",
    href: "https://www.hrbu.edu.cn/ws/info/1016/1781.htm"
  },
  {
    kind: "plan",
    label: "璁″垝鍐?",
    color: "mint",
    school: "姹熻タ姘村埄鐢靛姏澶у x 鍏夊窞澶у",
    mode: "4骞存湰绉?",
    major: "鐢垫皵宸ョ▼鍙婂叾鑷姩鍖?080601H",
    entry: "楂樿€冪粺鎷涳紝120浜?鏈?",
    language: "鎸夐」鐩煿鍏昏姹?",
    fee: "瀛﹁垂浠ュ綋骞存嫑鐢熻鍒掍负鍑?",
    costMin: 2,
    costMax: 4,
    verify: "CRS鏄剧ず招生起止2016-2028锛屽鏂逛负闊╁浗鍏夊窞澶у銆?",
    href: "https://www.crs.jsj.edu.cn/aproval/detail/2143"
  },
  {
    kind: "plan",
    label: "璁″垝鍐?",
    color: "mint",
    school: "韩山师范学院 x 鍏夊窞澶у",
    mode: "4骞存湰绉?",
    major: "学前教育",
    entry: "楂樿€冪粺鎷?",
    language: "鎸夐」鐩煿鍏昏姹?",
    fee: "瀛﹁垂浠ュ綋骞存嫑鐢熻鍒掍负鍑?",
    costMin: 1.8,
    costMax: 3.5,
    verify: "CRS鍙煡锛岄渶鍚屾鐪嬪綋骞村箍涓滄嫑鐢熻鍒掋€?",
    href: "https://www.crs.jsj.edu.cn/aproval/detail/3128"
  },
  {
    kind: "plan",
    label: "璁″垝鍐?",
    color: "mint",
    school: "鍚夋灄鍖栧伐澶у x 搴嗗崡澶у",
    mode: "4骞存湰绉?",
    major: "鐢垫皵宸ョ▼鍙婂叾鑷姩鍖?",
    entry: "楂樿€冪粺鎷?",
    language: "鎸夐」鐩煿鍏昏姹?",
    fee: "瀛﹁垂浠ュ悏鏋楀寲宸ュぇ瀛﹀綋骞存嫑鐢熺珷绋嬩负鍑?",
    costMin: 2,
    costMax: 4,
    verify: "CRS鏄剧ず涓洪煩鍥藉簡鍗楀ぇ瀛﹀悎浣滄湰绉戞暀鑲查」鐩€?",
    href: "https://www.crs.jsj.edu.cn/aproval/detail/3228"
  },
  {
    kind: "plan",
    label: "璁″垝鍐呬笓绉?",
    color: "mint",
    school: "鍚夊畨鑱屼笟鎶€鏈闄?x 鍙堟澗澶у",
    mode: "3骞撮珮绛変笓绉戝悎浣滃姙瀛?",
    major: "旅游管理 540101H",
    entry: "绾冲叆鏅€氶珮绛夋暀鑲叉嫑鐢熻鍒掞紝100浜?鏈?",
    language: "鎸変笓绉戦」鐩煿鍏昏姹?",
    fee: "涓撶闃舵瀛﹁垂浠ユ睙瑗跨渷鍜屽鏍℃嫑鐢熻鍒掍负鍑?",
    costMin: 1.2,
    costMax: 2.5,
    verify: "CRS鍦版柟澶囨锛屽鏂归鍙戝涔犺瘉鏄庯紝涓嶇瓑鍚岄煩鍥芥湰绉戝浣嶃€?",
    href: "https://www.crs.jsj.edu.cn/aproval/localdetail/3540"
  },
  {
    kind: "training",
    label: "璁″垝澶?+2",
    color: "green",
    school: "涓浗鍦拌川澶у(姝︽眽) x 鍙堢煶澶у",
    mode: "国内2骞?韩国2骞?",
    major: "鍟嗙銆佸伐绉戙€佽壓浣撱€佷紶濯掋€佷綋鑲?",
    entry: "高中毕业；文理本科线+鑻辫鍙婃牸锛岃壓浣撻渶涓撲笟鏉愭枡锛涚瑪璇?闈㈣瘯",
    language: "涓ゅ勾鍐呴煩璇揪鏍囧悗璧撮煩",
    fee: "国内3.4涓?年，住宿0.6-0.65涓?骞达紱闊╁浗瀛﹁垂绾?.5涓?年，住宿0.5-1涓?骞?",
    costMin: 3.4,
    costMax: 4.5,
    verify: "椤甸潰鏄庣‘璁″垝澶栬嚜涓绘嫑鐢燂紝鏃犱腑鍥藉湴璐ㄥぇ瀛?姝︽眽)瀛︾睄锛屾敞鍐屽張鐭冲ぇ瀛﹀绫嶃€?",
    href: "https://iec.cug.edu.cn/info/1063/19331.htm"
  },
  {
    kind: "training",
    label: "璁″垝澶?+2",
    color: "green",
    school: "婀栧寳宸ヤ笟澶у x 鍙堢煶澶у",
    mode: "国内2骞?韩国2骞?",
    major: "鍟嗙銆佸伐绉戙€佽壓浣?",
    entry: "高中毕业；本科线/英语100/闆呮€?.5/鎵樼55/DET60/TOPIK1可免笔试",
    language: "瀹屾垚鍥藉唴璇剧▼涓擳OPIK 3鍙荡闊?",
    fee: "国内3.6涓?骞达紱闊╁浗瀛﹁垂绾?涓?年，第三年可减免30%-80%",
    costMin: 3,
    costMax: 3.6,
    verify: "学校2025鎷涚敓绠€绔犲垪鏄庡綍鍙栨爣鍑嗐€佽垂鐢ㄤ笌濂栧閲戝尯闂淬€?",
    href: "https://sie.hbut.edu.cn/info/1021/2218.htm"
  },
  {
    kind: "training",
    label: "1+3",
    color: "green",
    school: "广州华立学院韩国方向",
    mode: "国内1骞?韩国3骞?",
    major: "鐏靛北澶у銆佷含绂忓ぇ学等方向",
    entry: "高三/鍚岀瓑瀛﹀巻鎴栦紭绉€楂樹簩锛?6-25岁；笔试+闈㈣瘯+閫傚簲鍔涙祴璇?",
    language: "涓€年冲TOPIK 3-4鏇寸ǔ",
    fee: "1+3椤垫湭鍒楁槑璐圭敤锛涘悓鏍?+1鍏紑鏍锋湰涓哄浗鍐?.28涓?年，0.5骞撮」鐩?.8涓?鏈嶅姟璐?.5涓?",
    costMin: 2.28,
    costMax: 4,
    verify: "椤甸潰鍒楁槑鎷涚敓瀵硅薄銆佹潗鏂欍€佸厤绗旇瘯鏉′欢锛岃垂鐢ㄩ渶鍚戝鏍＄储鍙栨寮忔敹璐硅〃銆?",
    href: "https://www.hualixy.edu.cn/jlxy/gjxm/1xgjbkxm/content_66398"
  },
  {
    kind: "training",
    label: "1+4预科",
    color: "green",
    school: "涓浗浼犲獟澶у闊╁浗鍥介檯棰勭",
    mode: "国内1骞?韩国本科",
    major: "浼犲獟銆佽壓鏈€佺鎶€绛夊悕鏍℃柟鍚?",
    entry: "闈㈣瘯涓庤瑷€鍐呮祴锛汿OPIK1鍙敵璇峰厤璇█娴嬭瘯瀹℃牳",
    language: "TOPIK2鎴栦竴鏈嚎鍙敵璇?0%学费减免",
    fee: "国内学费8涓?学年，报名费300鍏冿紱瀛︽牎涓嶆敹鐣欏鏈嶅姟璐?",
    costMin: 8,
    costMax: 8,
    verify: "2026鎷涚敓绠€绔犲垪鏄庡綍鍙栧師鍒欍€佸瀛﹂噾鍜屾敹璐规爣鍑嗐€?",
    href: "https://educen.cuc.edu.cn/2024/0402/c8424a266110/page.htm"
  },
  {
    kind: "training",
    label: "韩语方向",
    color: "green",
    school: "灞变笢澶у鍥介檯鏁欒偛椤圭洰",
    mode: "国内半年/1骞磋瑷€寮哄寲",
    major: "闊╁浗鏈鎴栫澹敵璇烽€氶亾",
    entry: "鎻愪氦鏉愭枡缁煎悎璇勪及锛岄潰璇曢€氳繃鍙戝綍鍙栭€氱煡",
    language: "TOPIK涓撻」璇剧▼",
    fee: "闊╁浗璇█璇剧害2涓?6涓湀锛岄煩鍥藉ぇ学学费约2-5涓?年，生活费约3-6涓?骞?",
    costMin: 2,
    costMax: 5,
    verify: "閫傚悎浣滀负闊╄棰勫涓庢嫨鏍″叆鍙ｏ紝涓嶇瓑鍚屽浐瀹?+2椤圭洰銆?",
    href: "https://sdlx.sdu.edu.cn/zsjz/hyfx1.htm"
  },
  {
    kind: "training",
    label: "璇█预科",
    color: "green",
    school: "河北美术学院韩国留学预科",
    mode: "国内1骞磋瑷€预科+韩国本科",
    major: "艺术类为主，也覆盖非艺术方向",
    entry: "楂樹腑姣曚笟鎴栧悓绛夊鍘?",
    language: "艺术TOPIK2/3，非艺术TOPIK3",
    fee: "国内预科2.6涓囷紱闊╁浗瀛﹁垂绾?.8涓?骞达紝浣忓绾?涓?骞达紝鐢熸椿绾?涓?骞?",
    costMin: 2.6,
    costMax: 3.8,
    verify: "椤甸潰杈冩棭锛岄€傚悎鐪嬭垂鐢ㄧ粨鏋勶紝鎶ュ悕鍓嶆牳楠屾槸鍚︿粛鎷涚敓銆?",
    href: "https://gjjy.hbafa.edu.cn/info/1002/1556.htm"
  },
  {
    kind: "training",
    label: "2+2",
    color: "green",
    school: "鍚堣偉宸ヤ笟澶у闊╁浗2+2国际本科",
    mode: "国内2骞?韩国2骞?",
    major: "椤哄ぉ涔″ぇ瀛︺€佹槑鐭ュぇ学等方向",
    entry: "应往届高中毕业及同等学历",
    language: "浠ラ煩鏂瑰ぇ瀛﹀叆瀛﹁姹備负鍑?",
    fee: "闊╁浗澶у瀛﹁垂绾?-4涓?年，国内外年均约6涓?",
    costMin: 2,
    costMax: 6,
    verify: "2023椤甸潰锛岄渶鏍搁獙鏄惁浠嶆寜鍚屼竴鍚堜綔闄㈡牎鎷涚敓銆?",
    href: "https://jcjxc.hfut.edu.cn/info/1024/1266.htm"
  },
  {
    kind: "training",
    label: "2.5+1.5",
    color: "green",
    school: "江苏第二师范学院 x 涓滄槑澶у",
    mode: "国内2.5骞?韩国1.5骞?",
    major: "中韩国际本科",
    entry: "高中毕业；本科线、艺术统考前20%鎴栭」鐩祴璇曞悎鏍?",
    language: "璧撮煩鍓嶆寜涓滄槑澶у瑕佹眰",
    fee: "国内4涓?年，申请及管理费4涓囷紝闊╁浗绾?涓?骞?",
    costMin: 4,
    costMax: 5,
    verify: "鎷涚敓绠€绔燩DF鍒楁槑60浜恒€佸綍鍙栧師鍒欏拰鏀惰垂銆?",
    href: "https://jxjy.jssnu.edu.cn/_upload/article/files/94/68/596adc034db487190ce896375d08/4fc7cd39-d873-408e-ba11-a190d898824d.pdf"
  },
  {
    kind: "school",
    label: "校际2+2",
    color: "yellow",
    school: "澶ц繛姘戞棌澶у x 寤哄浗澶у",
    mode: "鏈浜屽勾绾х敵璇凤紝闊╁浗2骞?",
    major: "澶氭暟涓撲笟锛屾帓闄よ壓鏈璁″闄㈠拰甯堣寖瀛﹂櫌",
    entry: "鐢宠鏃朵负鏈浜屽勾绾э紝鍚嶉涓嶉檺",
    language: "TOPIK 3鎴栧缓鍥藉ぇ瀛﹀湪绾块煩璇牎鑰?",
    fee: "学费422-583涓囬煩甯?瀛︽湡锛屼綇瀹?1涓囬煩甯?鏈?",
    costMin: 4.4,
    costMax: 6.2,
    verify: "鏍￠檯椤甸潰鍒楁槑璐圭敤銆佽瑷€鍜屽勾绾ц姹傘€?",
    href: "https://new.dlnu.edu.cn/gjjl/info/1032/1356.htm"
  },
  {
    kind: "school",
    label: "校际2+2",
    color: "yellow",
    school: "璐靛窞澶у x 鍏ㄥ寳澶у",
    mode: "鏈澶т簩璧撮煩2骞?",
    major: "按协议和附件专业",
    entry: "鍏ㄦ棩鍒?022绾ф湰绉戯紝GPA鈮?.0锛屽悕棰?浜?",
    language: "TOPIK 4",
    fee: "2023閫氱煡鎻愬埌瀵规柟澶у瀛﹁垂鍑忓厤70%锛?024浠ラ檮浠跺拰閫氱煡涓哄噯",
    costMin: 1.5,
    costMax: 3,
    verify: "閫傚悎鎴愮哗鍜岄煩璇己鐨勫湪鏍＄敓锛屼笉鏄珮鑰冨悗鐩存帴鎶ュ悕椤圭洰銆?",
    href: "https://oir.gzu.edu.cn/2024/0325/c18480a214134/page.htm"
  },
  {
    kind: "school",
    label: "校际2+2/3+2",
    color: "yellow",
    school: "鍚夋灄澶栧浗璇ぇ瀛?x 閲滃北澶栧浗璇ぇ瀛?",
    mode: "鏈鍙屽浣?",
    major: "鏈濋矞璇€佽嫳璇?英韩双语)",
    entry: "指定年级，原则上GPA鈮?.0涓旀棤涓嶅強鏍?",
    language: "韩语授课；TOPIK濂栧閲?-6绾?",
    fee: "学费50%鍑忓厤鍚庣害180涓囬煩甯?学期",
    costMin: 1.9,
    costMax: 2.3,
    verify: "椤甸潰鍒楁槑鍏ュ瑕佹眰銆佽垂鐢ㄥ拰TOPIK濂栧閲戙€?",
    href: "https://gjc.jisu.edu.cn/info/1028/2127.htm"
  },
  {
    kind: "school",
    label: "校际2+2",
    color: "yellow",
    school: "瑗垮畨鐭虫补澶у x 鍏夊窞澶у",
    mode: "国内2骞?韩语1骞?专业2骞?",
    major: "鏂伴椈銆佸箍鍛娿€佽璁°€佺粡钀ャ€佸伐绉戠瓑",
    entry: "本校学生，按项目选拔",
    language: "闊╁浗璇?年后TOPIK3鎴栨牎鍐?绾э紱鏈揪鏍囩户缁瑷€",
    fee: "璇█绗竴骞村璐瑰叏鍏嶏紱缁х画璇█100涓囬煩鍏?鍗婂勾鎴?0涓囬煩鍏?学期",
    costMin: 1,
    costMax: 4,
    verify: "瀹為檯姣曚笟鍛ㄦ湡鍙兘鎷夐暱锛岄€傚悎鑳芥帴鍙楄瑷€缂撳啿鐨勫鐢熴€?",
    href: "https://gjjl.xsyu.edu.cn/info/1127/1389.htm"
  },
  {
    kind: "school",
    label: "校际2+2",
    color: "yellow",
    school: "鍢夊叴澶у x 鐧界煶澶у",
    mode: "闊╄涓€学期+专业2骞?",
    major: "瑙嗚浼犺揪銆佺幆澧冭璁°€佸伐涓氳璁?",
    entry: "鎴愮哗浼樿壇銆佹棤涓嶅強鏍笺€佽嫳璇洓绾ф垨鍙ｈ鑹ソ",
    language: "赴韩后韩语学习一学期",
    fee: "鍏ュ閲?3万韩元，第一学期学费226.5涓囬煩鍏冿紱闊╄瀛︿範涓€瀛︽湡鍏嶅璐?",
    costMin: 1.3,
    costMax: 3,
    verify: "椤甸潰杈冩棭锛岃垂鐢ㄥ彧鑳戒綔缁撴瀯鍙傝€冿紝闇€鐪嬫柊閫氱煡銆?",
    href: "https://gjy.zjxu.edu.cn/info/1061/1123.htm"
  },
  {
    kind: "transfer",
    label: "涓撳崌鏈?+1",
    color: "peach",
    school: "鍘﹂棬杞欢鑱屼笟鎶€鏈闄?x 澶ч偙鍔犲浘绔嬪ぇ瀛?",
    mode: "专科3骞?韩国本科1骞?",
    major: "国际本科方向",
    entry: "涓夊勾鍒剁粺鎷涘ぇ专生",
    language: "鍥藉唴鎺ュ彈闊╄鍩硅",
    fee: "韩语培训2.38涓?鍩虹鏈嶅姟璐?万；韩国学费1.8-2.6涓?学期，住宿约4500/学期",
    costMin: 3.6,
    costMax: 5.2,
    verify: "椤甸潰鍒楁槑璐圭敤鎷嗛」锛岄€傚悎涓撶鐢熸瘮杈冦€?",
    href: "https://gjxy.xmist.edu.cn/info/1028/1387.htm"
  },
  {
    kind: "transfer",
    label: "涓撳崌鏈?.5+0.5+2",
    color: "peach",
    school: "武昌首义学院 x 鍙堟澗澶у",
    mode: "国内专科+闊╁浗鏈涓夊勾绾?",
    major: "鍙堟澗澶у鏈涓撲笟",
    entry: "淇畬鍥藉唴涓撶瀛﹀垎骞惰幏涓撶姣曚笟璇?",
    language: "TOPIK3升入本科，毕业需TOPIK4鎴栬瑷€鏇夸唬璇?",
    fee: "闊╄鏈揪鏍囧彲鑷垂缁х画璇闄紱璐圭敤鎸夊張鏉惧ぇ瀛︽爣鍑?",
    costMin: 3,
    costMax: 5,
    verify: "椤甸潰杈冩棭锛岄渶鏍搁獙鏄惁浠嶅湪鎵ц銆?",
    href: "https://www.wsyu.edu.cn/2019/1206/c2438a130022/page.htm"
  },
  {
    kind: "transfer",
    label: "涓撳崌鏈?+1",
    color: "peach",
    school: "武汉东湖学院 x 鍚槑澶у",
    mode: "国内专科3骞?韩国本科4年级1骞?",
    major: "涓撳崌鏈浉鍏充笓涓?",
    entry: "完成专科阶段学业",
    language: "TOPIK3鐩稿簲姘村钩鍚庤荡闊?",
    fee: "闊╂柟濂栧閲戝彲鎸夋垚缁╂彁渚?0%-100%学费减免",
    costMin: 2,
    costMax: 5,
    verify: "椤甸潰涓?024鏂伴椈锛岃垂鐢ㄩ渶鐪嬪綋骞撮煩鏂规爣鍑嗐€?",
    href: "https://www.wdu.edu.cn/gljg/gjjl/xwzx/xwkx/202403/t4685457.shtml"
  },
  {
    kind: "transfer",
    label: "3+2涓撳崌鏈?",
    color: "peach",
    school: "瑗夸含瀛﹂櫌闊╁浗浜ゆ祦涓績",
    mode: "国内专科3骞?韩国本科2骞?",
    major: "鍩规潗銆佷粊宸濄€佷笘鏄庛€佹竻宸炪€佸磭瀹炵瓑",
    entry: "瑗夸含涓撶鍦ㄦ牎鐢?",
    language: "TOPIK3鍚庢敾璇绘湰绉?",
    fee: "璐圭敤鎸夊悎浣滈櫌鏍℃爣鍑嗭紱椤甸潰鏈垪鏄庡叿浣撻噾棰?",
    costMin: 3,
    costMax: 6,
    verify: "閫傚悎鐪嬫ā寮忥紝涓嶉€傚悎鐩存帴鎹棰勭畻銆?",
    href: "https://ice.xijing.edu.cn/info/1018/1065.htm"
  }
];

const applicationAdmissionSteps = [
  ["01", "鍏堝垽瀹氬绫?", "鏅€氱粺鎷涘绫嶃€侀煩鏂瑰绫嶃€佽繕鏄煿璁鍛樿韩浠姐€?"],
  ["02", "鐪嬪叆瀛﹂棬妲?", "楂樿€冪嚎銆佽嫳璇崟绉戙€丟PA銆乀OPIK銆佺瑪璇曢潰璇曞垎鍒垪娓呫€?"],
  ["03", "鎷嗚垂鐢?", "鍥藉唴瀛﹁垂銆侀」鐩鐞嗚垂銆侀煩鏂瑰璐广€佷綇瀹裤€佽璇併€侀€€璐广€?"],
  ["04", "鏍歌瘉涔?", "涓柟姣曚笟璇併€侀煩鏂瑰浣嶃€佺暀鏈嶈璇佽矾寰勬槸鍚︿竴鑷淬€?"],
  ["05", "绠楀け璐ユ柟妗?", "TOPIK鏈揪鏍囥€佷笓涓氫笉鍖归厤銆侀€€瀛︺€佸欢鏈熸瘯涓氭€庝箞澶勭悊銆?"]
];

const applicationDeepSourceLinks = [
  ["鐩戠骞冲彴锛氱儫鍙板ぇ瀛?x 妾€鍥藉ぇ瀛?", "https://www.crs.jsj.edu.cn/aproval/detail/669"],
  ["鐩戠骞冲彴锛氬崕鍖楁按鍒╂按鐢?x 鍚槑澶у", "https://www.crs.jsj.edu.cn/aproval/detail/2277"],
  ["鐩戠骞冲彴锛氶暱鏄ュぇ瀛﹀惎鏄庡闄?", "https://www.crs.jsj.edu.cn/aproval/detail/3163"],
  ["鐩戠骞冲彴锛氬崡浜檽搴?x 鍙堟澗澶у", "https://www.crs.jsj.edu.cn/aproval/detail/1051"],
  ["鐩戠骞冲彴锛氶瞾涓滃ぇ瀛﹁敋灞卞闄?", "https://www.crs.jsj.edu.cn/aproval/detail/913"],
  ["鐩戠骞冲彴锛氭渤鍗楀伐涓氬ぇ瀛︿粊鑽风悊宸ュ闄?", "https://www.crs.jsj.edu.cn/aproval/detail/3737"],
  ["涓浗鍦拌川澶у(姝︽眽)2+2涓煩鍥介檯鐝?", "https://iec.cug.edu.cn/info/1063/19331.htm"],
  ["婀栧寳宸ヤ笟澶у闊╁浗鍙堢煶澶у2+2", "https://sie.hbut.edu.cn/info/1021/2218.htm"],
  ["涓浗浼犲獟澶у闊╁浗鍥介檯棰勭2026", "https://educen.cuc.edu.cn/2024/0402/c8424a266110/page.htm"],
  ["澶ц繛姘戞棌澶у x 寤哄浗澶у", "https://new.dlnu.edu.cn/gjjl/info/1032/1356.htm"],
  ["璐靛窞澶у x 鍏ㄥ寳澶у", "https://oir.gzu.edu.cn/2024/0325/c18480a214134/page.htm"],
  ["Study in Korea：本科与插班", "https://www.studyinkorea.go.kr/en_US/plan/schoolType.do?tab=undergraduate-college"],
  ["鏁欒偛娑夊鐩戠淇℃伅缃戯細璁よ瘉椤荤煡", "https://jsj.moe.gov.cn/n1/12017.shtml"],
  ["鏁欒偛閮ㄧ暀瀛︽湇鍔′腑蹇?", "https://portal.cscse.edu.cn/"]
];

function applicationFeeBar(min, max, color = "mint", cap = 8) {
  const safeMin = Math.max(0, Number(min) || 0);
  const safeMax = Math.max(safeMin, Number(max) || safeMin);
  const left = Math.min(96, (safeMin / cap) * 100);
  const width = Math.max(4, Math.min(100 - left, ((safeMax - safeMin || safeMax) / cap) * 100));

  return `<div class="fee-track"><span class="${color}" style="left:${left}%;width:${width}%"></span></div>`;
}

const applicationHtml = shell({
  title: "申请路线",
  headerTitle: "中韩2+2 / 1+3璺嚎",
  activePath: "application.html",
  extraStyle: `
      .wrap {
        width: calc(100% - 25rem);
        padding-top: 1.875rem;
      }

      .summary-title {
        display: inline-flex;
        align-items: center;
        margin: 0 0 1rem;
        padding: 0.5rem 1rem;
        border: 1px solid var(--ink);
        border-radius: 0;
        background: var(--yellow);
        font-size: clamp(0.8rem, 1.28vw, 1.2rem);
        font-weight: 900;
        line-height: 1;
      }

      .section { margin-top: 1.875rem; }

      .summary {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        border: 1px solid var(--ink);
      }

      .metric {
        border-right: 1px solid var(--ink);
        padding: 0.76rem 1rem;
      }

      .metric:last-child { border-right: 0; }
      .metric strong { display: block; margin-top: 0.76rem; font-size: 1.24rem; line-height: 1; }
      .metric p { margin: 0.6rem 0 0; color: var(--muted); font-size: 0.8rem; line-height: 1.45; }

      .summary .pill {
        background: #f1f1ee;
        padding: 0.36rem 0.58rem;
        font-size: 0.76rem;
      }
      .summary .pill.green,
      .summary .pill.mint,
      .summary .pill.pink,
      .summary .pill.peach,
      .summary .pill.yellow { background: #f1f1ee; }

      .label {
        display: inline-flex;
        border: 1px solid var(--ink);
        border-radius: 999px;
        padding: 0.34rem 0.58rem;
        background: var(--yellow);
        font-size: 0.76rem;
        font-weight: 900;
        line-height: 1;
      }

      .label.mint { background: var(--mint); }
      .label.green { background: #b7dbc6; }
      .label.yellow { background: var(--yellow); }
      .label.peach { background: #f4c6aa; }
      .label.coral { background: #f2aaa1; }
      .label.gray { background: #f1f1ee; }

      .route-matrix {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        border: 1px solid var(--ink);
        background: var(--surface);
      }

      .route-card {
        display: grid;
        align-content: start;
        gap: 0.72rem;
        border-right: 1px solid var(--ink);
        padding: 1rem;
      }

      .route-card:last-child { border-right: 0; }
      .route-card h3 { margin: 0; font-size: 1.08rem; line-height: 1.25; }
      .route-card p { margin: 0; color: var(--muted); font-size: 0.82rem; line-height: 1.58; }
      .route-card dl { display: grid; gap: 0.45rem; margin: 0; }
      .route-card div { border-top: 1px solid var(--ink); padding-top: 0.55rem; }
      .route-card dt { font-size: 0.68rem; font-weight: 900; color: var(--muted); }
      .route-card dd { margin: 0.16rem 0 0; font-size: 0.86rem; font-weight: 800; line-height: 1.45; }

      .fee-track {
        position: relative;
        height: 0.8rem;
        border: 1px solid var(--ink);
        background: var(--paper);
      }

      .fee-track span {
        position: absolute;
        top: 0;
        bottom: 0;
        border-right: 1px solid var(--ink);
        border-left: 1px solid var(--ink);
      }

      .fee-note {
        display: grid;
        gap: 0.35rem;
      }

      .fee-note strong {
        font-size: 0.96rem;
        line-height: 1.25;
      }

      .fee-axis {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        margin-top: 0.35rem;
        color: var(--muted);
        font-size: 0.68rem;
        font-weight: 800;
      }

      .fee-axis span:nth-child(n+2):nth-child(-n+4) { text-align: center; }
      .fee-axis span:last-child { text-align: right; }

      .table-wrap {
        overflow-x: auto;
        border: 1px solid var(--ink);
        background: var(--surface);
        margin-top: 1rem;
      }

      table {
        width: 100%;
        min-width: 820px;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.92rem;
      }

      th {
        border-bottom: 1px solid var(--ink);
        background: #f1f1ee;
        padding: 0.8rem 1rem;
        font-weight: 900;
      }

      td {
        border-bottom: 1px solid var(--ink);
        padding: 0.85rem 1rem;
        vertical-align: top;
        line-height: 1.55;
      }

      tr:last-child td { border-bottom: 0; }
      td strong { display: block; font-size: 1rem; }
      .muted { color: var(--muted); }

      .atlas-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .atlas-filter {
        border: 1px solid var(--ink);
        border-radius: 999px;
        background: var(--surface);
        color: var(--ink);
        cursor: pointer;
        font: inherit;
        font-size: 0.8rem;
        font-weight: 900;
        line-height: 1;
        padding: 0.48rem 0.78rem;
      }

      .atlas-filter[aria-pressed="true"] { background: var(--yellow); }

      .atlas-status {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin: -0.35rem 0 0.8rem;
        border: 1px solid var(--ink);
        background: var(--surface);
        padding: 0.65rem 0.8rem;
        font-size: 0.82rem;
        font-weight: 900;
      }

      .atlas-status span:last-child {
        color: var(--muted);
        font-size: 0.76rem;
      }

      .program-atlas {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        border: 1px solid var(--ink);
        background: var(--surface);
      }

      .program-atlas.is-filtered .program-card {
        border-right: 1px solid var(--ink);
      }

      .program-atlas.is-filtered .program-card:not([hidden]):nth-of-type(3n) {
        border-right: 0;
      }

      .program-card {
        display: grid;
        align-content: start;
        gap: 0.7rem;
        min-height: 20.5rem;
        border-right: 1px solid var(--ink);
        border-bottom: 1px solid var(--ink);
        padding: 1rem;
      }

      .program-card:nth-child(3n) { border-right: 0; }
      .program-card[hidden] { display: none !important; }
      .program-card h3 {
        margin: 0;
        font-size: 1.04rem;
        line-height: 1.26;
      }

      .program-card p {
        margin: 0;
        color: var(--muted);
        font-size: 0.82rem;
        line-height: 1.56;
      }

      .program-meta {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.45rem;
      }

      .meta-box {
        min-height: 4.3rem;
        border: 1px solid var(--ink);
        background: var(--paper);
        padding: 0.55rem;
      }

      .meta-box span {
        display: block;
        color: var(--muted);
        font-size: 0.66rem;
        font-weight: 900;
      }

      .meta-box strong {
        display: block;
        margin-top: 0.22rem;
        font-size: 0.78rem;
        line-height: 1.35;
      }

      .program-fee {
        border-top: 1px solid var(--ink);
        padding-top: 0.65rem;
      }

      .program-fee .fee-track { margin-top: 0.45rem; }

      .program-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        border-top: 1px solid var(--ink);
        padding-top: 0.65rem;
      }

      .example-link,
      .source-link {
        display: inline-flex;
        border-bottom: 1px solid var(--ink);
        font-size: 0.78rem;
        font-weight: 900;
      }

      .atlas-empty {
        display: none;
        border: 1px solid var(--ink);
        background: var(--surface);
        padding: 1rem;
        color: var(--muted);
        font-weight: 800;
      }

      .atlas-empty.is-visible {
        display: block;
      }

      .pipeline {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        border: 1px solid var(--ink);
        background: var(--surface);
      }

      .pipeline-step {
        min-height: 9rem;
        border-right: 1px solid var(--ink);
        padding: 1rem;
      }

      .pipeline-step:last-child { border-right: 0; }
      .pipeline-step b {
        display: inline-flex;
        width: 2rem;
        height: 2rem;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--ink);
        border-radius: 999px;
        background: var(--mint);
        font-size: 0.82rem;
      }
      .pipeline-step strong { display: block; margin-top: 0.8rem; font-size: 1rem; }
      .pipeline-step p { margin: 0.45rem 0 0; color: var(--muted); font-size: 0.82rem; line-height: 1.55; }

      .timeline {
        display: grid;
        border: 1px solid var(--ink);
        background: var(--surface);
      }

      .timeline-row {
        display: grid;
        grid-template-columns: 8.5rem 11rem 1fr;
        border-bottom: 1px solid var(--ink);
      }

      .timeline-row:last-child { border-bottom: 0; }
      .timeline-row div { padding: 0.85rem 1rem; }
      .timeline-row div:not(:last-child) { border-right: 1px solid var(--ink); }
      .timeline-row strong { display: block; }
      .timeline-row p { margin: 0; color: var(--muted); line-height: 1.75; }

      .split {
        display: grid;
        grid-template-columns: 1.05fr 0.95fr;
        gap: 1.4rem;
      }

      .checklist {
        display: grid;
        border: 1px solid var(--ink);
        background: var(--surface);
      }

      .check-row {
        display: grid;
        grid-template-columns: 8rem 1fr;
        border-bottom: 1px solid var(--ink);
      }

      .check-row:last-child { border-bottom: 0; }
      .check-row div { padding: 0.85rem 1rem; }
      .check-row div:first-child {
        border-right: 1px solid var(--ink);
        background: #f1f1ee;
        font-weight: 900;
      }
      .check-row p { margin: 0; color: var(--muted); line-height: 1.75; }

      .decision-card {
        border: 1px solid var(--ink);
        background: var(--surface);
      }

      .decision-card article {
        display: grid;
        grid-template-columns: 7rem 1fr;
        border-bottom: 1px solid var(--ink);
      }

      .decision-card article:last-child { border-bottom: 0; }
      .decision-card strong {
        border-right: 1px solid var(--ink);
        padding: 1rem;
        background: var(--mint);
        font-size: 1.08rem;
      }
      .decision-card p { margin: 0; padding: 1rem; color: var(--muted); line-height: 1.75; }

      .source-panel {
        margin-top: 3.25rem;
        border: 1px solid var(--ink);
        background: var(--surface);
        padding: 1rem;
      }

      .source-panel h2 { margin: 0; font-size: 1.1rem; }
      .source-panel p { margin: 0.65rem 0 0; color: var(--muted); line-height: 1.75; }
      .source-links {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
        margin-top: 1rem;
      }
      .source-links a {
        display: inline-flex;
        border: 1px solid var(--ink);
        background: var(--paper);
        padding: 0.45rem 0.7rem;
        font-size: 0.78rem;
        font-weight: 900;
      }

      @media (max-width: 1100px) {
        .route-matrix { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .route-card:nth-child(2n) { border-right: 0; }
        .route-card:nth-child(n+3) { border-top: 1px solid var(--ink); }
        .program-atlas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .program-card:nth-child(3n) { border-right: 1px solid var(--ink); }
        .program-card:nth-child(2n) { border-right: 0; }
        .atlas-status { align-items: flex-start; flex-direction: column; }
        .pipeline { grid-template-columns: 1fr; }
        .pipeline-step { min-height: auto; border-right: 0; border-bottom: 1px solid var(--ink); }
        .pipeline-step:last-child { border-bottom: 0; }
        .summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .metric { border-top: 1px solid var(--ink); }
        .split { grid-template-columns: 1fr; }
      }

      @media (max-width: 720px) {
        .route-matrix,
        .program-atlas { grid-template-columns: 1fr; }
        .route-card,
        .route-card:nth-child(2n),
        .program-card,
        .program-card:nth-child(2n),
        .program-card:nth-child(3n) {
          border-right: 0;
          border-top: 1px solid var(--ink);
        }
        .route-card:first-child,
        .program-card:first-child { border-top: 0; }
        .atlas-toolbar { gap: 0.4rem; }
        .summary { grid-template-columns: 1fr; }
        .timeline-row,
        .check-row,
        .decision-card article { grid-template-columns: 1fr; }
        .timeline-row div:not(:last-child),
        .check-row div:first-child,
        .decision-card strong {
          border-right: 0;
          border-bottom: 1px solid var(--ink);
        }
      }
  `,
  body: `<main class="wrap">
      <h2 class="summary-title">中韩2+2 / 1+3璺嚎娣卞害閫熻</h2>
      <section class="summary">
        ${applicationDeepSummary
          .map(
            ([label, value, detail, color]) =>
              `<article class="metric"><span class="pill ${color}">${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><p>${escapeHtml(detail)}</p></article>`
          )
          .join("")}
      </section>

      <section class="section">
        <h2 class="summary-title">四类路线：入学标准与费用范围</h2>
        <div class="route-matrix">
          ${applicationRouteMatrix
            .map(
              (route) => `<article class="route-card">
            <span class="label ${route.color}">${escapeHtml(route.badge)}</span>
            <h3>${escapeHtml(route.route)}</h3>
            <dl>
              <div><dt>鍏ュ鏍囧噯</dt><dd>${escapeHtml(route.entry)}</dd></div>
              <div><dt>璇█绾</dt><dd>${escapeHtml(route.language)}</dd></div>
              <div><dt>国内费用</dt><dd>${escapeHtml(route.domesticFee)}</dd></div>
              <div><dt>韩国费用</dt><dd>${escapeHtml(route.koreaFee)}</dd></div>
            </dl>
            <p>${escapeHtml(route.risk)}</p>
          </article>`
            )
            .join("")}
        </div>
      </section>

      <section class="section">
        <h2 class="summary-title">璐圭敤鏉″舰鍥撅細鍏堢湅涓€年要准备多少</h2>
        <div class="route-matrix">
          ${[
            ["计划内合作办学", "国内统招中外合作费用", 1.8, 4.1, "mint", "多数仍按国内高校招生计划缴费；赴韩阶段另看韩方。"],
            ["计划外1+3/2+2", "国内预科/项目学费", 3.4, 8, "green", "学校差异最大，名校预科与传媒类项目更高。"],
            ["校际双学位", "赴韩学费减免后", 1.8, 6.2, "yellow", "建国、釜外、全北等项目差异取决于奖学金。"],
            ["专升本/插班", "韩国本科阶段", 3.6, 5.2, "peach", "专科衔接通常按韩国大学学期学费缴纳。"]
          ]
            .map(
              ([title, label, min, max, color, note]) => `<article class="route-card">
              <span class="label ${color}">${escapeHtml(label)}</span>
              <h3>${escapeHtml(title)}</h3>
              <div class="fee-note">
                ${applicationFeeBar(min, max, color)}
                <div class="fee-axis"><span>0</span><span>2涓</span><span>4涓</span><span>6涓</span><span>8涓?</span></div>
                <strong>${escapeHtml(String(min) + "-" + String(max) + "万/年")}</strong>
                <p>${escapeHtml(note)}</p>
              </div>
            </article>`
            )
            .join("")}
        </div>
      </section>

      <section class="section">
        <h2 class="summary-title">椤圭洰鍦板浘锛氭寜绫诲瀷绛涢€</h2>
        <div class="atlas-toolbar" aria-label="椤圭洰绫诲瀷绛涢€?>
          <button class="atlas-filter" type="button" data-kind="all" aria-pressed="true">鍏ㄩ儴28椤</button>
          <button class="atlas-filter" type="button" data-kind="plan" aria-pressed="false">璁″垝鍐?鐩戠骞冲彴</button>
          <button class="atlas-filter" type="button" data-kind="training" aria-pressed="false">1+3 / 2+2预科</button>
          <button class="atlas-filter" type="button" data-kind="school" aria-pressed="false">鏍￠檯鍙屽浣</button>
          <button class="atlas-filter" type="button" data-kind="transfer" aria-pressed="false">涓撳崌鏈?鎻掔彮</button>
        </div>
        <div class="atlas-status" aria-live="polite">
          <span id="atlas-status-text">褰撳墠鏄剧ず锛氬叏閮?8椤</span>
          <span>鐐瑰嚮涓婃柟鎸夐挳鍚庯紝涓嬫柟鍗＄墖鍙繚鐣欏搴旂被鍨嬨€</span>
        </div>
        <div class="atlas-empty" id="atlas-empty">杩欎竴绫诲瀷鏆傛椂娌℃湁宸叉暣鐞嗛」鐩€</div>
        <div class="program-atlas">
          ${applicationProgramCards
            .map(
              (program) => `<article class="program-card" data-kind="${escapeHtml(program.kind)}">
            <span class="label ${program.color}">${escapeHtml(program.label)}</span>
            <h3>${escapeHtml(program.school)}</h3>
            <p><strong>${escapeHtml(program.mode)}</strong><br />${escapeHtml(program.major)}</p>
            <div class="program-meta">
              <div class="meta-box"><span>鍏ュ鏍囧噯</span><strong>${escapeHtml(program.entry)}</strong></div>
              <div class="meta-box"><span>璇█绾</span><strong>${escapeHtml(program.language)}</strong></div>
            </div>
            <div class="program-fee">
              <p>${escapeHtml(program.fee)}</p>
              ${applicationFeeBar(program.costMin, program.costMax, program.color)}
              <div class="fee-axis"><span>0</span><span>2涓</span><span>4涓</span><span>6涓</span><span>8涓?</span></div>
            </div>
            <p>${escapeHtml(program.verify)}</p>
            <div class="program-footer">
              <span class="muted">鍏紑鏍锋湰锛岄潪鎺ㄨ崘鎺掑悕</span>
              <a class="source-link" href="${escapeHtml(program.href)}" target="_blank" rel="noreferrer">鏉ユ簮 鈫</a>
            </div>
          </article>`
            )
            .join("")}
        </div>
      </section>

      <section class="section">
        <h2 class="summary-title">浠樻鍓?姝ユ牳楠屾祦绋</h2>
        <div class="pipeline">
          ${applicationAdmissionSteps
            .map(
              ([no, title, detail]) => `<article class="pipeline-step">
            <b>${escapeHtml(no)}</b>
            <strong>${escapeHtml(title)}</strong>
            <p>${escapeHtml(detail)}</p>
          </article>`
            )
            .join("")}
        </div>
      </section>

      <section class="section split">
        <div>
          <h2 class="summary-title">浠樻鍓嶆牳楠屾竻鍗</h2>
          <div class="checklist">
            ${applicationRiskChecks
              .map(
                ([label, detail]) => `<article class="check-row"><div>${escapeHtml(label)}</div><div><p>${escapeHtml(detail)}</p></div></article>`
              )
              .join("")}
          </div>
        </div>
        <div>
          <h2 class="summary-title">鎬庝箞閫夋洿绋</h2>
          <div class="decision-card">
            <article><strong>瑕佸浗鍐呭厹搴</strong><p>浼樺厛鐪嬭鍒掑唴涓鍚堜綔鍔炲銆傚畠閫夋嫨灏戯紝浣嗗绫嶃€佹壒澶嶅拰姣曚笟璺緞鏇村鏄撴牳楠屻€</p></article>
            <article><strong>楂樿€冨悗杞悜</strong><p>鍙湅1+3鎴?+2鍥介檯鏈锛屼絾鍚堝悓閲屽繀椤诲啓娓呴煩鏂瑰綍鍙栥€佸绫嶃€佽垂鐢ㄥ拰鏈揪鏍囧悗鐨勫鐞嗐€</p></article>
            <article><strong>已读国内本科</strong><p>鍏堟煡鏈牎鍥介檯浜ゆ祦澶勩€傛牎闄?+2/3+1姣旀牎澶栭」鐩洿瀹规槗鍋氬鍒嗕簰璁ゃ€</p></article>
            <article><strong>目标明确</strong><p>鐩存帴鎸夐煩鍥藉ぇ瀛︽彃鐝敵璇蜂篃鍙銆傛潗鏂欏帇鍔涙洿澶э紝浣嗕笉琚浗鍐呴」鐩粦瀹氥€</p></article>
          </div>
        </div>
      </section>

      <section class="source-panel">
        <h2>璧勬枡鏉ユ簮涓庡鏍稿叆鍙</h2>
        <p>椤甸潰渚濇嵁鏁欒偛閮ㄤ腑澶栧悎浣滃姙瀛︾洃绠″钩鍙般€侀煩鍥芥斂搴淪tudy in Korea銆佹暀鑲叉秹澶栫洃绠′俊鎭綉銆佹暀鑲查儴鐣欏鏈嶅姟涓績浠ュ強涓煩楂樻牎鍏紑椤圭洰椤垫暣鐞嗐€傝垂鐢ㄦ寜椤甸潰鍏紑瀛楁鍘嬬缉涓轰汉姘戝竵鍖洪棿锛屾湭鍏紑鎴栧勾浠借緝鏃х殑椤圭洰宸插湪鍗＄墖涓爣娉紝鏈€缁堜互褰撳勾鎷涚敓绠€绔犮€佸悎鍚屽拰缂磋垂閫氱煡涓哄噯銆</p>
        <div class="source-links">
          ${applicationDeepSourceLinks
            .map(([label, href]) => `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(label)} 鈫</a>`)
            .join("")}
        </div>
      </section>
      <script>
        (() => {
          const labels = {
            all: "鍏ㄩ儴28椤?",
            plan: "璁″垝鍐?鐩戠骞冲彴",
            training: "1+3 / 2+2预科",
            school: "鏍￠檯鍙屽浣?",
            transfer: "涓撳崌鏈?鎻掔彮"
          };
          const buttons = Array.from(document.querySelectorAll(".atlas-filter"));
          const cards = Array.from(document.querySelectorAll(".program-card"));
          const atlas = document.querySelector(".program-atlas");
          const status = document.getElementById("atlas-status-text");
          const empty = document.getElementById("atlas-empty");

          function applyFilter(kind) {
            let visibleCount = 0;
            buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.kind === kind)));
            cards.forEach((card) => {
              const visible = kind === "all" || card.dataset.kind === kind;
              card.hidden = !visible;
              if (visible) visibleCount += 1;
            });
            atlas.classList.toggle("is-filtered", kind !== "all");
            status.textContent = "褰撳墠鏄剧ず锛? + (labels[kind] || "绛涢€夌粨鏋?) + "锛? + visibleCount + "项）";
            empty.classList.toggle("is-visible", visibleCount === 0);
          }

          buttons.forEach((button) => {
            button.addEventListener("click", () => applyFilter(button.dataset.kind || "all"));
          });

          applyFilter("all");
        })();
      </script>
    </main>`
});

const placeholderPages = [
  ["exchange-rate.html", "汇率", "人民币与韩元汇率入口后续会接入实时或定期更新的参考数据。"],
  ["korea-overview.html", "韩国概况", "这里将整理韩国城市、学制、签证、住宿和生活信息。"],
  ["about.html", "关于我们", "韩学罗盘会把官方信息、学校信息、人民币估算和学生经验分层展示。"],
  ["korean-learning.html", "韩语(TOPIK)", "从零基础到 TOPIK 6 级的学习路线将在这里扩展。"]
];

mkdirSync(root, { recursive: true });
writeFileSync(new URL("universities.html", root), universitiesHtml, "utf8");
writeFileSync(new URL("topik.html", root), finalTopikHtml, "utf8");
writeFileSync(new URL("cost.html", root), costHtml, "utf8");
writeFileSync(new URL("application.html", root), applicationHtml, "utf8");
execFileSync(process.execPath, [fileURLToPath(new URL("scripts/build-application-page.mjs", root))], { stdio: "inherit" });

for (const [fileName, title, description] of placeholderPages) {
  writeFileSync(
    new URL(fileName, root),
    shell({
      title,
      activePath: fileName,
      body: `<main class="wrap">
      <div class="page-actionbar"><a class="back" href="./hanxue-luopan-home.html">返回首页</a></div>
      <p class="lead">${escapeHtml(description)}</p>
    </main>`
    }),
    "utf8"
  );
}

await import("./render-universities-static.mjs");
