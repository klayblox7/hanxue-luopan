import alumniData from "./universityAlumni.json";

export const noPublicAlumniText = "暂无公开知名校友资料";

export const universityAlumniBySlug = alumniData as Record<string, string[]>;

export function getUniversityAlumni(slug: string) {
  return universityAlumniBySlug[slug] ?? [];
}

export function universityAlumniText(slug: string) {
  const names = getUniversityAlumni(slug);
  return names.length > 0 ? names.join("、") : noPublicAlumniText;
}
