import { DetailPageContainer } from "@/components/DetailPageContainer";
import { SiteHeader } from "@/components/SiteHeader";

const costBreakdownParts = [
  { label: "学费", value: 50, amount: "约 4-10万/年", color: "#7d98f2" },
  { label: "住宿费", value: 25, amount: "约 1-6万/年", color: "#5cc8a1" },
  { label: "餐饮费", value: 15, amount: "约 1.2-3万/年", color: "#a678f0" },
  { label: "交通费", value: 5, amount: "约 0.2-0.6万/年", color: "#ff9851" },
  { label: "其他杂费", value: 5, amount: "约 0.5-1.5万/年", color: "#f17878" }
];

const preDepartureRows = [
  {
    item: "韩语学习 / TOPIK",
    budget: "0.3-1.5万 + 400元/次",
    detail:
      "国内TOPIK课程差异大，线上全程班常见约5000-15000元；TOPIK中国报名常见400元/次。若先去韩国读语学堂，官方公开学费约140万-202万韩元/学期。",
    source: "培训市场参考 / TOPIK / 语学堂"
  },
  {
    item: "学校申请费",
    budget: "约450-600元/校",
    detail:
      "韩国大学通常按学校收取网申费，示例：延世大学国际申请费100,000韩元/人。申请3-5所学校时，要把每所申请费单独列出来。",
    source: "大学招生简章"
  },
  {
    item: "材料认证 / 翻译 / 邮寄",
    budget: "约500-3000元",
    detail:
      "成绩单、毕业证明、亲属关系、存款证明、翻译、公证/认证、国际快递等按材料数量浮动。学校要求不同，先按清单逐项核价。",
    source: "申请材料口径"
  },
  {
    item: "自申 vs 留学中介",
    budget: "自申0；中介约0.6-1万",
    detail:
      "自申主要承担申请费和材料费；韩国本科申请中介费市场参考约6000-10000元。签约前要确认是否包含选校、文书、网申、签证和后续加收项。",
    source: "中介市场参考"
  }
];

const scenarioComparisonRows = [
  ["首尔地区私立大学", "14-18万", "15-20万", "16-20万", "text-[#3e55ff]"],
  ["首尔地区国立大学", "12-16万", "13-16万", "14-16万", "text-[#8b35ff]"],
  ["地方私立大学", "8-13万", "9-14万", "10-15万", "text-[#ff6b1a]"],
  ["地方国立大学", "7-11万", "8-12万", "9-12万", "text-[#00a85a]"]
];

const scenarioRows = [
  {
    scene: "首尔地区私立大学",
    budget: "14-20万",
    min: 14,
    max: 20,
    tuition: "4-10万",
    housing: "1.8-7.2万",
    living: "6-9万",
    note: "艺术/医学、校外单间最贵"
  },
  {
    scene: "首尔地区国立大学",
    budget: "12-16万",
    min: 12,
    max: 16,
    tuition: "3.2-5.5万",
    housing: "1.8-3.6万",
    living: "6-9万",
    note: "学费低于同城私立约30%"
  },
  {
    scene: "地方私立大学",
    budget: "8-15万",
    min: 8,
    max: 15,
    tuition: "2.5-6万",
    housing: "1.2-2.4万",
    living: "4-6万",
    note: "预算中等，专业选择更灵活"
  },
  {
    scene: "地方国立大学",
    budget: "7-12万",
    min: 7,
    max: 12,
    tuition: "1.8-4.5万",
    housing: "1-1.8万",
    living: "3.6-6万",
    note: "预算有限优先看这一类"
  }
];

const costCompositions = [
  {
    profile: "地方国立理工",
    total: "约8万",
    parts: [
      { label: "学费", value: 3, color: "bg-[#ffe07a]" },
      { label: "住宿", value: 1.2, color: "bg-[#a4d4c5]" },
      { label: "生活", value: 3, color: "bg-[#71d39b]" },
      { label: "其他", value: 0.8, color: "bg-[#ffd0d8]" }
    ]
  },
  {
    profile: "首尔私立社科",
    total: "约15万",
    parts: [
      { label: "学费", value: 5, color: "bg-[#ffe07a]" },
      { label: "住宿", value: 3.6, color: "bg-[#a4d4c5]" },
      { label: "生活", value: 5.4, color: "bg-[#71d39b]" },
      { label: "其他", value: 1, color: "bg-[#ffd0d8]" }
    ]
  },
  {
    profile: "首尔私立艺术",
    total: "约20万",
    parts: [
      { label: "学费", value: 8, color: "bg-[#ffe07a]" },
      { label: "住宿", value: 5, color: "bg-[#a4d4c5]" },
      { label: "生活", value: 6, color: "bg-[#71d39b]" },
      { label: "其他", value: 1, color: "bg-[#ffd0d8]" }
    ]
  }
];

const preparationRows = [
  ["语言培训", "3000-15000元", "线上更低，线下小班更高；语学院一年可达5-8万。"],
  ["TOPIK考试", "400-800元", "国内报名费400元/次，多数学生考1-2次。"],
  ["申请服务", "0-10000元+", "自申可为0；主流机构约3000-8000元。"],
  ["材料/签证/体检", "约1500-5000元", "公证认证、申请费、护照、D-2签证、体检等。"],
  ["机票与保险", "约1500-5000元", "平峰直飞1000-2000元；健康保险约400元/月。"]
];

const monthlyRows = [
  ["校内宿舍", "首尔 2000-4000", "地方 1000-2500", "优先申请，通常最稳"],
  ["校外单间", "首尔 3000-6000", "地方 1500-3000", "需准备保证金"],
  ["合租", "首尔 1500-3000", "地方 800-1500", "可比单间低约30%"],
  ["餐饮", "首尔 1800-3000", "地方 1200-2000", "食堂/做饭最省"],
  ["交通", "首尔 300-500", "地方 200-300", "住得近可接近0"],
  ["杂费", "首尔 1000-2000", "地方 500-1500", "含社交、购物、通讯等"]
];

const savingRows = [
  { label: "奖学金", value: "25-50%", detail: "TOPIK、成绩、申请材料一起准备；优秀者可冲全免。" },
  { label: "住宿", value: "约30%", detail: "校内宿舍或合租优先，避开热门学区。" },
  { label: "餐饮", value: "约50%", detail: "校内食堂比校外餐馆便宜，做饭还能再降。" },
  { label: "消费", value: "约20%", detail: "量贩店、传统市场、学生折扣比临时购买更稳。" },
  { label: "兼职", value: "10-15h/周", detail: "先办许可，别影响出勤、成绩和奖学金。" }
];

const budgetRoutes = [
  ["7-10万", "地方国立大学", "预算有限；先看宿舍、奖学金和地方城市。"],
  ["10-14万", "地方私立/首尔国立", "预算适中；兼顾专业、排名和生活成本。"],
  ["14-20万", "首尔顶尖私立", "预算充足；热门专业、艺术类需额外留余量。"]
];

function RangeBar({ min, max, ceiling = 20 }: { min: number; max: number; ceiling?: number }) {
  const rangeLabel = `${min}-${max}万`;

  return (
    <div className="relative h-10 w-full border border-ink bg-paper">
      <div
        className="absolute top-0 flex h-full items-center justify-center border-x border-ink bg-[#71d39b] text-[0.8rem] font-black"
        style={{ left: `${(min / ceiling) * 100}%`, width: `${((max - min) / ceiling) * 100}%` }}
      >
        {rangeLabel}
      </div>
    </div>
  );
}

function StackedBar({ parts }: { parts: Array<{ label: string; value: number; color: string }> }) {
  const total = parts.reduce((sum, part) => sum + part.value, 0);

  return (
    <div className="flex h-7 overflow-hidden border border-ink bg-paper">
      {parts.map((part) => (
        <div
          className={`h-full border-r border-ink last:border-r-0 ${part.color}`}
          key={part.label}
          style={{ width: `${(part.value / total) * 100}%` }}
          title={`${part.label} ${part.value}万`}
        />
      ))}
    </div>
  );
}

function PreDepartureCosts() {
  return (
    <section className="mb-8">
      <h2 className="mb-4 inline-flex self-start border border-ink bg-yellow px-4 py-2 text-[0.8rem] font-black leading-none text-ink sm:text-[0.9rem]">
        赴韩前准备费用
      </h2>
      <div className="overflow-x-auto border border-ink bg-surface p-4 sm:p-5">
        <table className="w-full min-w-[980px] border-collapse bg-white text-sm text-ink">
          <thead>
            <tr>
              <th className="w-[15%] border border-ink bg-[#f1f1ee] px-3 py-2 text-left font-black">项目</th>
              <th className="w-[18%] border border-ink bg-[#f1f1ee] px-3 py-2 text-center font-black">常见预算</th>
              <th className="border border-ink bg-[#f1f1ee] px-3 py-2 text-left font-black">怎么理解</th>
              <th className="w-[16%] border border-ink bg-[#f1f1ee] px-3 py-2 text-center font-black">资料口径</th>
            </tr>
          </thead>
          <tbody>
            {preDepartureRows.map((row) => (
              <tr key={row.item}>
                <td className="border border-ink bg-white px-3 py-3 font-black">{row.item}</td>
                <td className="whitespace-nowrap border border-ink bg-white px-3 py-3 text-center font-black">{row.budget}</td>
                <td className="border border-ink bg-white px-3 py-3 leading-6 text-ink">{row.detail}</td>
                <td className="border border-ink bg-white px-3 py-3 text-center text-xs font-bold text-muted">{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs font-bold leading-5 text-muted">
          口径：这里是出发前现金预算，不含第一年正式大学学费和韩国生活费。韩元折算按近期 1万韩元≈45-50元人民币粗估，最终以银行汇率和学校最新简章为准。
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[0.72rem] font-bold text-muted">
          <a className="border border-ink bg-white px-2 py-1" href="https://topik.neea.cn/" rel="noreferrer" target="_blank">TOPIK报名平台</a>
          <a className="border border-ink bg-white px-2 py-1" href="https://international.pusan.ac.kr/international/15206/subview.do" rel="noreferrer" target="_blank">釜山大学语学堂</a>
          <a className="border border-ink bg-white px-2 py-1" href="https://www.yskli.com/course.php?mid=E01_02" rel="noreferrer" target="_blank">延世KLI费用</a>
          <a className="border border-ink bg-white px-2 py-1" href="https://eic.yonsei.ac.kr/eic/admission/eic_international.do" rel="noreferrer" target="_blank">延世申请费</a>
        </div>
      </div>
    </section>
  );
}

function CostDonut() {
  let cursor = 0;
  const gradientStops = costBreakdownParts
    .map((part) => {
      const start = cursor;
      cursor += part.value;
      return `${part.color} ${start}% ${cursor}%`;
    })
    .join(", ");

  return (
    <div className="grid h-full flex-1 gap-7 rounded-lg border border-ink bg-surface p-4 sm:p-5 lg:grid-cols-[auto_minmax(20rem,1fr)] lg:items-center">
      <div className="grid place-items-center">
        <div
          className="relative h-[11.9rem] w-[11.9rem] rounded-full border border-ink"
          style={{ background: `conic-gradient(${gradientStops})` }}
          aria-label="韩国本科留学费用构成：学费50%，住宿费25%，餐饮费15%，交通费5%，其他杂费5%"
          role="img"
        >
          <div className="absolute inset-[28%] rounded-full border border-ink bg-surface" />
        </div>
      </div>
      <div className="min-w-0">
        <table className="w-full border-collapse border border-ink bg-white text-sm text-ink">
          <thead>
            <tr>
              <th className="border border-ink bg-[#f1f1ee] px-3 py-2 text-left font-black">项目</th>
              <th className="border border-ink bg-[#f1f1ee] px-3 py-2 text-center font-black">占比</th>
              <th className="border border-ink bg-[#f1f1ee] px-3 py-2 text-center font-black">年费用</th>
            </tr>
          </thead>
          <tbody>
            {costBreakdownParts.map((part) => (
              <tr key={part.label}>
                <td className="border border-ink bg-white px-3 py-2 font-black text-ink">
                  <span className="flex items-center gap-2 whitespace-nowrap">
                    <span className="h-4 w-4 border border-ink" style={{ background: part.color }} />
                    {part.label}
                  </span>
                </td>
                <td className="whitespace-nowrap border border-ink bg-white px-3 py-2 text-center font-normal text-ink">{part.value}%</td>
                <td className="whitespace-nowrap border border-ink bg-white px-3 py-2 text-center text-[0.9rem] font-normal text-ink">{part.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MobilePreparationCards() {
  return (
    <div className="grid gap-3 md:hidden">
      {preparationRows.map((row) => (
        <article className="rounded-lg border border-ink bg-surface p-3" key={row[0]}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-black">{row[0]}</h3>
            <strong className="shrink-0 rounded-full border border-ink bg-[#ffe07a] px-2 py-1 text-xs font-black">
              {row[1]}
            </strong>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">{row[2]}</p>
        </article>
      ))}
    </div>
  );
}

function MobileMonthlyCards() {
  return (
    <div className="grid gap-3 md:hidden">
      {monthlyRows.map((row) => (
        <article className="rounded-lg border border-ink bg-surface p-3" key={row[0]}>
          <h3 className="text-base font-black">{row[0]}</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-black">
            <span className="rounded-lg border border-ink bg-[#ffe07a] px-2 py-2">{row[1]}</span>
            <span className="rounded-lg border border-ink bg-[#a4d4c5] px-2 py-2">{row[2]}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">{row[3]}</p>
        </article>
      ))}
    </div>
  );
}

export default function CostPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <SiteHeader pageTitle="留学费用（奖学金）" />

      <DetailPageContainer className="pb-16 pt-5 sm:pt-8 lg:pt-12">
        <PreDepartureCosts />

        <div className="grid gap-6 xl:grid-cols-2 xl:items-stretch">
          <section className="flex flex-col">
            <h2 className="mb-4 inline-flex self-start border border-ink bg-yellow px-4 py-2 text-[0.8rem] font-black leading-none text-ink sm:text-[0.9rem]">
              韩国本科留学费用构成分析
            </h2>
            <CostDonut />
          </section>

          <section className="flex flex-col">
            <h2 className="mb-4 inline-flex self-start border border-ink bg-yellow px-4 py-2 text-[0.8rem] font-black leading-none text-ink sm:text-[0.9rem]">
              不同场景下的年均总费用对比（人民币）
            </h2>
            <div className="flex flex-1 overflow-hidden rounded-lg border border-ink bg-white p-4 text-ink sm:p-5">
              <table className="h-full w-full min-w-0 table-fixed border-collapse border border-ink bg-white text-center text-sm text-ink">
                <thead>
                  <tr>
                    <th className="border border-ink bg-[#f1f1ee] px-4 py-3 text-center font-black text-ink">院校类型</th>
                    <th className="border border-ink bg-[#f1f1ee] px-4 py-3 text-center font-black text-ink">人文社科</th>
                    <th className="border border-ink bg-[#f1f1ee] px-4 py-3 text-center font-black text-ink">理工科</th>
                    <th className="border border-ink bg-[#f1f1ee] px-4 py-3 text-center font-black text-ink">艺术类/医学类</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarioComparisonRows.map(([type, humanities, stem, arts]) => {
                    const rowBg = type.includes("国立") ? "bg-[#f0fbf4]" : "bg-white";

                    return (
                    <tr className={`text-ink ${rowBg}`} key={type}>
                      <td className={`${rowBg} border border-ink px-4 py-4 text-center font-black text-ink`}>{type}</td>
                      <td className={`${rowBg} border border-ink px-4 py-4 text-center font-bold text-ink`}>{humanities}</td>
                      <td className={`${rowBg} border border-ink px-4 py-4 text-center font-bold text-ink`}>{stem}</td>
                      <td className={`${rowBg} border border-ink px-4 py-4 text-center font-bold text-ink`}>{arts}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 inline-flex border border-ink bg-yellow px-4 py-2 text-[0.8rem] font-black leading-none text-ink sm:text-[0.9rem]">
            年度预算场景对比
          </h2>
          <div className="border border-ink bg-surface p-4 sm:p-5">
            <div className="hidden grid-cols-[12rem_1fr_16rem] gap-5 border-b border-ink pb-3 text-[0.72rem] font-black text-muted lg:grid">
              <span>学校类型</span>
              <div className="grid grid-cols-5">
                <span>0万</span>
                <span className="text-center">5万</span>
                <span className="text-center">10万</span>
                <span className="text-center">15万</span>
                <span className="text-right">20万</span>
              </div>
              <span>主要成本</span>
            </div>
            <div className="grid">
              {scenarioRows.map((row) => (
                <article className="grid gap-4 border-b border-ink py-5 last:border-b-0 lg:grid-cols-[12rem_1fr_16rem] lg:gap-5" key={row.scene}>
                  <div>
                    <h3 className="text-base font-black">{row.scene}</h3>
                    <p className="mt-2 text-2xl font-black leading-none">{row.budget}</p>
                    <p className="mt-2 text-[0.72rem] font-bold text-muted">人民币/年</p>
                  </div>
                  <div className="grid content-center gap-2">
                    <RangeBar min={row.min} max={row.max} />
                    <div className="grid grid-cols-5 text-[0.68rem] font-bold text-muted lg:hidden">
                      <span>0万</span>
                      <span className="text-center">5万</span>
                      <span className="text-center">10万</span>
                      <span className="text-center">15万</span>
                      <span className="text-right">20万</span>
                    </div>
                  </div>
                  <div className="grid gap-2 text-[0.8rem]">
                    <div className="grid grid-cols-3 border border-ink">
                      <span className="border-r border-ink px-2 py-1"><b>学费</b><br />{row.tuition}</span>
                      <span className="border-r border-ink px-2 py-1"><b>住宿</b><br />{row.housing}</span>
                      <span className="px-2 py-1"><b>生活</b><br />{row.living}</span>
                    </div>
                    <p className="text-muted">{row.note}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <h2 className="mb-4 inline-flex border border-ink bg-yellow px-4 py-2 text-[0.8rem] font-black leading-none text-ink sm:text-[0.9rem]">
              典型案例费用构成
            </h2>
            <div className="grid gap-3">
              {costCompositions.map((item) => (
                <article className="border border-ink bg-surface p-4" key={item.profile}>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <h3 className="text-base font-black">{item.profile}</h3>
                    <strong className="text-xl">{item.total}</strong>
                  </div>
                  <StackedBar parts={item.parts} />
                  <div className="mt-3 grid grid-cols-4 gap-2 text-xs font-bold text-muted">
                    {item.parts.map((part) => (
                      <span key={part.label}>{part.label} {part.value}万</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 inline-flex border border-ink bg-yellow px-4 py-2 text-[0.8rem] font-black leading-none text-ink sm:text-[0.9rem]">
              前期一次性准备费
            </h2>
            <MobilePreparationCards />
            <div className="hidden overflow-x-auto border border-ink bg-surface md:block">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead className="bg-[#f1f1ee]">
                  <tr>
                    <th className="border-b border-ink px-4 py-3 font-black">项目</th>
                    <th className="border-b border-ink px-4 py-3 font-black">参考费用</th>
                    <th className="border-b border-ink px-4 py-3 font-black">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {preparationRows.map((row) => (
                    <tr className="border-b border-ink last:border-b-0" key={row[0]}>
                      <td className="px-4 py-3 font-black">{row[0]}</td>
                      <td className="whitespace-nowrap px-4 py-3 font-black">{row[1]}</td>
                      <td className="px-4 py-3 text-muted">{row[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-4 inline-flex border border-ink bg-yellow px-4 py-2 text-[0.8rem] font-black leading-none text-ink sm:text-[0.9rem]">
            每月生活成本速查
          </h2>
          <MobileMonthlyCards />
          <div className="hidden overflow-x-auto border border-ink bg-surface md:block">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead className="bg-[#f1f1ee]">
                <tr>
                  <th className="border-b border-ink px-4 py-3 font-black">项目</th>
                  <th className="border-b border-ink px-4 py-3 font-black">首尔地区/月</th>
                  <th className="border-b border-ink px-4 py-3 font-black">地方城市/月</th>
                  <th className="border-b border-ink px-4 py-3 font-black">怎么判断</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRows.map((row) => (
                  <tr className="border-b border-ink last:border-b-0" key={row[0]}>
                    <td className="px-4 py-3 font-black">{row[0]}</td>
                    <td className="px-4 py-3">{row[1]}</td>
                    <td className="px-4 py-3">{row[2]}</td>
                    <td className="px-4 py-3 text-muted">{row[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div>
            <h2 className="mb-4 inline-flex border border-ink bg-yellow px-4 py-2 text-[0.8rem] font-black leading-none text-ink sm:text-[0.9rem]">
              降低成本优先级
            </h2>
            <div className="grid gap-3">
              {savingRows.map((item) => (
                <article className="grid items-center border border-ink bg-surface text-sm sm:grid-cols-[8rem_8rem_1fr]" key={item.label}>
                  <div className="border-b border-ink px-4 py-3 font-black sm:border-b-0 sm:border-r">{item.label}</div>
                  <div className="border-b border-ink px-4 py-3 text-xl font-black sm:border-b-0 sm:border-r">{item.value}</div>
                  <div className="px-4 py-3 text-muted">{item.detail}</div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 inline-flex border border-ink bg-yellow px-4 py-2 text-[0.8rem] font-black leading-none text-ink sm:text-[0.9rem]">
              按预算选路线
            </h2>
            <div className="overflow-hidden border border-ink bg-surface">
              {budgetRoutes.map((row) => (
                <article className="grid border-b border-ink last:border-b-0 sm:grid-cols-[7rem_1fr]" key={row[0]}>
                  <div className="border-b border-ink bg-[#ffe07a] px-4 py-4 text-xl font-black sm:border-b-0 sm:border-r">{row[0]}</div>
                  <div className="px-4 py-4">
                    <strong className="block">{row[1]}</strong>
                    <span className="mt-1 block text-sm leading-6 text-muted">{row[2]}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <p className="mt-12 border-t border-ink pt-5 text-sm leading-7 text-muted">
          说明：本页由《2025年韩国本科留学费用研究报告（基于100+真实案例）》压缩整理。费用均为人民币估算，学校政策、专业、汇率和个人消费会造成浮动，最终以学校官方学费表、宿舍通知和签证/保险要求为准。
        </p>
      </DetailPageContainer>
    </main>
  );
}
