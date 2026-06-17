import foundedYearsBySlug from "./universityFoundedYears.json";

export const universityFoundedYearsBySlug = foundedYearsBySlug as Record<string, string>;

export function universityFoundedYear(slug: string) {
  return universityFoundedYearsBySlug[slug] || "";
}
