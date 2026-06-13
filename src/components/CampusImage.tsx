"use client";

import { useEffect, useMemo, useState } from "react";

const campusImageExtensions = ["webp", "jpg", "png", "jpeg"] as const;
const fallbackCampusImage = "/campus-images/yonsei-university.webp";

type CampusImageProps = {
  slug: string;
  name: string;
  className?: string;
};

export function CampusImage({ slug, name, className }: CampusImageProps) {
  const candidates = useMemo(
    () => campusImageExtensions.map((extension) => `/campus-images/${slug}.${extension}`).concat(fallbackCampusImage),
    [slug]
  );
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [slug]);

  return (
    <img
      alt={`${name}校园图片`}
      className={className}
      decoding="async"
      loading="lazy"
      src={candidates[candidateIndex] ?? fallbackCampusImage}
      onError={() => setCandidateIndex((current) => Math.min(current + 1, candidates.length - 1))}
    />
  );
}
