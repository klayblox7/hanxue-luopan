export type UniversityRanking = {
  sort: number;
  tableLabel: string;
  noteLabel: string;
};

function koreaRank(sort: number, tableLabel = String(sort)): UniversityRanking {
  const isTie = tableLabel.startsWith("=");
  const rankNumber = isTie ? tableLabel.slice(1) : tableLabel;

  return {
    sort,
    tableLabel,
    noteLabel: `${isTie ? "并列" : ""}第${rankNumber}名`
  };
}

const koreaRankings = new Map<string, UniversityRanking>([
  ["seoul-national-university", koreaRank(1)],
  ["kaist", koreaRank(2)],
  ["yonsei-university", koreaRank(3)],
  ["sungkyunkwan-university", koreaRank(4)],
  ["korea-university", koreaRank(6)],
  ["hanyang-university", koreaRank(8, "=8")],
  ["kyung-hee-university", koreaRank(8, "=8")],
  ["sejong-university", koreaRank(8, "=8")],
  ["ajou-university", koreaRank(12, "=12")],
  ["chung-ang-university", koreaRank(12, "=12")],
  ["ewha-womans-university", koreaRank(15, "=15")],
  ["gachon-university", koreaRank(15, "=15")],
  ["konkuk-university", koreaRank(15, "=15")],
  ["kyungpook-national-university", koreaRank(15, "=15")],
  ["pusan-national-university", koreaRank(15, "=15")],
  ["university-of-ulsan", koreaRank(15, "=15")],
  ["yeungnam-university", koreaRank(15, "=15")],
  ["catholic-university-of-korea", koreaRank(22)],
  ["chonnam-national-university", koreaRank(23, "=23")],
  ["inha-university", koreaRank(23, "=23")],
  ["jeonbuk-national-university", koreaRank(23, "=23")],
  ["sogang-university", koreaRank(23, "=23")],
  ["chungbuk-national-university", koreaRank(27, "=27")],
  ["chungnam-national-university", koreaRank(27, "=27")],
  ["university-of-seoul", koreaRank(27, "=27")],
  ["jeju-national-university", koreaRank(30, "=30")],
  ["kangwon-national-university", koreaRank(30, "=30")],
  ["kookmin-university", koreaRank(30, "=30")],
  ["pukyong-national-university", koreaRank(30, "=30")],
  ["seoultech", koreaRank(30, "=30")],
  ["soonchunhyang-university", koreaRank(30, "=30")],
  ["dankook-university", koreaRank(40, "=40")]
]);

export function getKoreaRankingNote(schoolSlug: string): string {
  return koreaRankings.get(schoolSlug)?.noteLabel ?? "*";
}
