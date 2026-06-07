import Image from "next/image";

import { BackToTopButton } from "@/components/BackToTopButton";
import { DetailPageContainer } from "@/components/DetailPageContainer";
import { SiteHeader } from "@/components/SiteHeader";

const flowSteps = [
  ["1", "盘点准备物", "身份、学历、成绩、语言、资金、亲属关系先列底稿。", "材料清单"],
  ["2", "定申请目标", "确认本科、插班、研究生、语学院，以及春季或秋季入学。", "路线类型"],
  ["3", "筛学校专业", "按城市、专业、语言门槛、学费、奖学金和宿舍做长名单。", "冲稳保表"],
  ["4", "选择申请方式", "在这里决定自申、半托管、全包，并写清谁负责哪一步。", "分工表"],
  ["5", "提交申请", "网申、缴申请费、上传或邮寄材料、预约面试、盯补件。", "申请号"],
  ["6", "确认录取", "查结果、缴学费、确认宿舍，等待学校签发标准入学许可书。", "录取包"],
  ["7", "签证入境", "按D-2或D-4准备签证，订住宿机票，入境后办登陆证。", "入韩清单"]
];

const materialGroups = [
  {
    title: "基础身份与学历",
    badge: "最先核对",
    items: [
      ["护照", "有效期、拼音姓名、出生日期一致"],
      ["毕业证/预毕业证明", "高中、本科、专科按路线准备"],
      ["成绩单", "中英文或韩文翻译，盖章版本"],
      ["国籍与亲属材料", "父母国籍、户口本、亲属关系证明"]
    ]
  },
  {
    title: "语言、资金与文书",
    badge: "决定学校层级",
    items: [
      ["TOPIK或英语成绩", "看学校和专业，部分可先录后补"],
      ["存款证明", "金额、冻结期、账户人按学校和签证要求确认"],
      ["自我介绍/学习计划", "本科、插班、研究生侧重点不同"],
      ["邮箱和网申账号", "学生本人持有，任何服务方只协助"]
    ]
  }
];

const fields = [
  ["商科", "经营、国际通商、金融，容错高，就业面宽。"],
  ["传媒", "新媒体、广告、影视、翻译，语言和作品表达重要。"],
  ["理工IT", "计算机、AI、半导体，适合理科基础稳定的学生。"],
  ["艺术设计", "作品集是关键，申请服务和作品集服务分开评估。"],
  ["文旅康养", "酒店观光、幼儿教育等，适合想降低录取难度的学生。"]
];

const agencyModes = [
  ["自申", "2000-5000元", "最低成本，最高参与度。", "bg-[#d8f3df]"],
  ["半托管", "4000-8000元", "多数家庭最稳的折中。", "bg-[#ffe07a]"],
  ["全包", "10000-20000元", "省时间，但合同风险更高。", "bg-[#ffb084]"],
  ["准备周期", "6-12个月", "越早做材料越少慌。", "bg-mint"],
  ["核心资产", "账号归属", "邮箱、网申号必须在自己手里。", "bg-[#ffd0d8]"],
  ["最大红线", "保录保签", "看到就暂停付款。", "bg-[#ffb084]"]
];

const riskRows = [
  ["自申", "中", "高", "中", "中", "高"],
  ["半托管", "中", "低", "低", "中", "中"],
  ["全包", "低", "低", "低", "高", "中"],
  ["不透明机构", "极高", "极高", "高", "极高", "高"]
];

const riskColor: Record<string, string> = {
  低: "bg-[#d8f3df]",
  中: "bg-[#fff0a8]",
  高: "bg-[#ffd0b3]",
  极高: "bg-[#f2aaa1] font-black"
};

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mb-3 inline-flex border border-ink bg-[#ffe07a] px-4 py-2 text-lg font-black leading-tight">
      {children}
    </h2>
  );
}

function MiniVisual({ alt, src }: { alt: string; src: string }) {
  return (
    <figure className="h-20 w-28 shrink-0 overflow-hidden border border-ink bg-surface sm:h-[6.3rem] sm:w-[9.4rem]">
      <Image alt={alt} className="block h-full w-full object-cover" height={300} src={src} width={420} />
    </figure>
  );
}

function SectionTitleRow({ alt, children, src }: { alt: string; children: string; src: string }) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
      <h2 className="inline-flex border border-ink bg-[#ffe07a] px-4 py-2 text-lg font-black leading-tight">
        {children}
      </h2>
      <MiniVisual alt={alt} src={src} />
    </div>
  );
}

export default function AgencyCheckPage() {
  return (
    <main id="top" className="min-h-screen bg-paper text-ink">
      <SiteHeader pageTitle="报考流程" />
      <DetailPageContainer className="pb-16 pt-6 lg:pt-8">
        <section className="flex justify-end border-y border-ink py-6">
          <aside className="grid w-full self-start border border-ink bg-[#ffe07a] p-5 sm:max-w-[18rem]">
            <strong className="text-3xl font-black leading-none">先定3件事</strong>
            <p className="mt-4 text-sm font-black leading-7">入学季<br />预算上限<br />语言水平</p>
          </aside>
        </section>

        <section className="mt-9">
          <SectionTitle>流程总览：7个节点一路往下走</SectionTitle>
          <div className="grid border border-ink bg-surface lg:grid-cols-7">
            {flowSteps.map(([no, title, detail, output]) => (
              <article
                className="border-b border-ink p-4 last:border-b-0 lg:min-h-[15rem] lg:border-b-0 lg:border-r lg:last:border-r-0"
                key={no}
              >
                <b className="grid size-8 place-items-center rounded-full border border-ink bg-[#ffe07a] text-sm">{no}</b>
                <h3 className="mt-4 text-lg font-black leading-tight">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{detail}</p>
                <span className="mt-4 inline-flex border border-ink bg-paper px-2 py-1 text-xs font-black">
                  输出：{output}
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-9">
          <SectionTitleRow
            alt="护照、材料清单和申请文件插图"
            src="/application-flow-mini-materials.webp"
          >
            准备物清单：先看有没有资格和材料
          </SectionTitleRow>
          <div className="grid gap-3 lg:grid-cols-2">
            {materialGroups.map((group) => (
              <article className="border border-ink bg-surface" key={group.title}>
                <h3 className="flex items-center justify-between gap-3 border-b border-ink p-4 text-lg font-black">
                  {group.title}
                  <span className="rounded-full border border-ink bg-mint px-2 py-1 text-xs">{group.badge}</span>
                </h3>
                <div className="grid sm:grid-cols-2">
                  {group.items.map(([item, note], index) => (
                    <div
                      className={`border-b border-ink p-4 sm:border-r ${index % 2 === 1 ? "sm:border-r-0" : ""} ${
                        index >= group.items.length - 2 ? "sm:border-b-0" : ""
                      }`}
                      key={item}
                    >
                      <strong className="text-sm">{item}</strong>
                      <p className="mt-2 text-xs leading-5 text-muted">{note}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="mt-3 grid border border-ink bg-surface lg:grid-cols-3">
            {[
              ["先做", "护照、学历成绩、亲属关系、目标入学季。没有这些，学校表很难定。"],
              ["并行做", "TOPIK、文书草稿、预算表、学校招生简章截图和截止日表。"],
              ["临近做", "存款证明、网申缴费、材料邮寄、面试、签证预约和入境安排。"]
            ].map(([title, detail]) => (
              <article className="border-b border-ink p-4 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0" key={title}>
                <strong className="text-lg">{title}</strong>
                <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-9">
          <SectionTitleRow alt="大学、地图定位和奖学金插图" src="/application-flow-mini-school.webp">
            选校判断：先筛能申，再排值不值得申
          </SectionTitleRow>
          <div className="grid gap-3 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="border border-ink bg-surface">
              {[
                ["能不能申", "国籍、学历、毕业时间、语言、资金、父母国籍要求必须逐条对照招生简章。"],
                ["值不值得申", "专业匹配、城市成本、学费奖学金、宿舍概率、毕业后方向一起看。"],
                ["怎么排队", "建议每轮做冲刺、稳定、保底三类，避免只盯首尔热门校。"]
              ].map(([title, detail]) => (
                <article className="grid border-b border-ink last:border-b-0 sm:grid-cols-[7rem_1fr]" key={title}>
                  <strong className="border-b border-ink bg-panel p-4 sm:border-b-0 sm:border-r">{title}</strong>
                  <p className="p-4 text-sm leading-7 text-muted">{detail}</p>
                </article>
              ))}
            </div>
            <div className="grid border border-ink bg-surface sm:grid-cols-3">
              {[
                ["冲", "排名、城市、专业都理想，但语言或成绩刚压线。只放1-2所，避免预算被申请费吃掉。"],
                ["稳", "条件匹配度最高，专业和费用都能接受。真正决定录取概率的是这组学校。"],
                ["保", "录取难度更低，专业路线仍然合理。不要把完全不想去的学校放进保底。"]
              ].map(([title, detail]) => (
                <article className="border-b border-ink p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0" key={title}>
                  <h3 className="text-3xl font-black leading-none">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted">{detail}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {fields.map(([title, detail]) => (
              <article className="border border-ink bg-surface p-4" key={title}>
                <strong>{title}</strong>
                <p className="mt-2 text-xs leading-5 text-muted">{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-9">
          <SectionTitleRow alt="网申界面、日历和提交材料插图" src="/application-flow-mini-submit.webp">
            申请方式：在第4步决定自申还是找人帮
          </SectionTitleRow>
          <div className="grid gap-3 lg:grid-cols-[0.8fr_1.2fr]">
            <aside className="border border-ink bg-[#ffe07a] p-5">
              <strong className="text-3xl font-black leading-none">判断核心</strong>
              <p className="mt-4 text-sm font-bold leading-7">谁掌握账号，谁盯截止日，谁对材料真实性负责。服务方式可以不同，但申请主体永远是学生自己。</p>
            </aside>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ["自申", "自己控流程", "适合目标清楚、时间充足、能读招生简章的人。成本低，但最怕漏材料和错过截止日。"],
                ["半托管", "关键环节找人复核", "适合多数家庭。选校方向自己定，文书、翻译、公证、面试等容易出错的点找人协助。"],
                ["全包", "省时间但合同要硬", "适合时间紧、材料复杂、冲刺名校或有签证风险的人。账号、费用、退款边界要写清楚。"]
              ].map(([badge, title, detail]) => (
                <article className="border border-ink bg-surface p-4" key={badge}>
                  <span className="rounded-full border border-ink bg-panel px-2 py-1 text-xs font-black">{badge}</span>
                  <h3 className="mt-4 text-xl font-black leading-tight">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-9">
          <SectionTitleRow alt="签证、行李、钥匙和机票插图" src="/application-flow-mini-arrival.webp">
            录取后入韩：结果出来后不是结束
          </SectionTitleRow>
          <div className="grid border border-ink bg-surface md:grid-cols-3 lg:grid-cols-6">
            {[
              ["RESULT", "查录取结果", "确认录取学校、专业、入学季和缴费截止日。"],
              ["TUITION", "缴学费和宿舍", "只向学校指定账户付款，保留汇款和收据记录。"],
              ["COA", "拿标准入学许可书", "学校确认注册后，通常会提供签证所需录取材料。"],
              ["VISA", "办D-2或D-4签证", "按韩国签证门户和管辖使领馆要求准备材料。"],
              ["READY", "订住宿机票", "确认宿舍入住、保险、换汇、手机卡和接机安排。"],
              ["KOREA", "入境后登记", "按学校通知完成报到、选课、体检和外国人登陆证。"]
            ].map(([label, title, detail], index) => (
              <article
                className={`border-b border-ink p-4 last:border-b-0 md:border-r lg:border-b-0 lg:last:border-r-0 ${
                  index % 3 === 2 ? "md:border-r-0 lg:border-r" : ""
                }`}
                key={label}
              >
                <b className="text-xs text-muted">{label}</b>
                <strong className="mt-3 block leading-tight">{title}</strong>
                <p className="mt-2 text-xs leading-5 text-muted">{detail}</p>
              </article>
            ))}
          </div>
          <p className="mt-3 border border-ink bg-surface p-4 text-sm leading-7 text-muted">
            签证和入境要求会变化，最终以Korea Visa Portal、韩国驻华使领馆和学校国际处当年通知为准。
          </p>
        </section>

        <section className="mt-9">
          <SectionTitle>自申 vs 中介：这里保留详细数据</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {agencyModes.map(([label, value, note, color]) => (
              <article className="border border-ink bg-surface p-4" key={label}>
                <span className={`rounded-full border border-ink px-2 py-1 text-xs font-black ${color}`}>{label}</span>
                <strong className="mt-4 block text-2xl font-black">{value}</strong>
                <p className="mt-2 text-sm leading-6 text-muted">{note}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-3">
            {[
              ["自申", "0.2-0.5w", "每周4-6小时，适合愿意自己盯流程。", "w-1/4 bg-[#71d39b]"],
              ["半托管", "0.4-0.8w", "每周2-3小时，材料和文书有人复核。", "w-1/2 bg-[#ffe07a]"],
              ["全包", "1-2w", "学生耗时最低，但合同和账号要看清。", "w-full bg-[#ffb084]"]
            ].map(([title, price, detail, bar]) => (
              <article className="border border-ink bg-surface" key={title}>
                <h3 className="border-b border-ink bg-panel p-3 font-black">{title}</h3>
                <div className="h-11 border-b border-ink bg-paper">
                  <span className={`flex h-full min-w-28 items-center px-3 text-sm font-black ${bar}`}>{price}</span>
                </div>
                <p className="p-3 text-sm font-bold leading-6">{detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 overflow-x-auto border border-ink bg-surface">
            <div className="grid min-w-[44rem] grid-cols-6">
              {["模式", "选校", "材料", "文书", "缴费", "签证"].map((item) => (
                <div className="border-b border-r border-ink bg-panel p-3 text-sm font-black last:border-r-0" key={item}>{item}</div>
              ))}
              {riskRows.flatMap((row) =>
                row.map((cell, index) => (
                  <div
                    className={`border-b border-r border-ink p-3 text-sm last:border-r-0 ${index === 0 ? "bg-panel font-black" : riskColor[cell]}`}
                    key={`${row[0]}-${index}`}
                  >
                    {cell}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mt-9">
          <SectionTitle>合同红线：出现这些就先别付钱</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[
              "承诺保录取、保签证、内部名额。",
              "不写具体学校、专业、申请批次。",
              "申请账号、邮箱、密码不交给学生。",
              "要求转账到个人账户或陌生主体。",
              "第三方费用不列明，后续不断加钱。",
              "退款条件、争议地、违约责任模糊。",
              "说材料可以包装、美化、补做经历。",
              "不让学生看最终提交材料。"
            ].map((item, index) => (
              <article className="grid grid-cols-[2.5rem_1fr] border border-ink bg-surface" key={item}>
                <span className="grid place-items-center border-r border-ink bg-[#f2aaa1] font-black">{index + 1}</span>
                <p className="m-0 p-3 text-sm font-bold leading-6">{item}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-9 border border-ink bg-surface p-4">
          <h2 className="text-lg font-black">资料依据与复核入口</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            流程参考韩国政府 Study in Korea 的留学5步框架，并结合韩国大学国际招生页面常见节点整理。签证部分以 Korea Visa Portal 和管辖韩国使领馆要求为准。
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ["Study in Korea", "https://www.studyinkorea.go.kr/ko/main.do"],
              ["Korea Visa Portal", "https://www.visa.go.kr/openPage.do?LANG_TYPE=EN&MENU_ID=10105"],
              ["韩国大学招生示例", "https://oia.korea.ac.kr/oia/under/admission.do"]
            ].map(([label, href]) => (
              <a className="border border-ink bg-paper px-3 py-2 text-xs font-black" href={href} key={label} rel="noreferrer" target="_blank">
                {label}
              </a>
            ))}
          </div>
        </section>
      </DetailPageContainer>
      <BackToTopButton />
    </main>
  );
}
