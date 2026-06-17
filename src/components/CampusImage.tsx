"use client";

import { useEffect, useMemo, useState } from "react";

import { assetPath } from "@/data/assetPath";

const campusImageExtensions = ["webp", "jpg", "png", "jpeg"] as const;
const fallbackCampusImage = "/campus-images/yonsei-university.webp";

type CampusImageProps = {
  slug: string;
  name: string;
  className?: string;
  folder?: string;
};

function normalizedImageFolder(folder?: string) {
  return (folder || "campus-images").replace(/^\/+|\/+$/g, "");
}

export function CampusImage({ slug, name, className, folder }: CampusImageProps) {
  const imageFolder = normalizedImageFolder(folder);
  const candidates = useMemo(
    () => {
      const primaryCandidates = campusImageExtensions.map((extension) => assetPath(`/${imageFolder}/${slug}.${extension}`));
      const fallbackCandidates =
        imageFolder === "campus-images" ? [] : campusImageExtensions.map((extension) => assetPath(`/campus-images/${slug}.${extension}`));

      return primaryCandidates.concat(fallbackCandidates, assetPath(fallbackCampusImage));
    },
    [imageFolder, slug]
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
      src={candidates[candidateIndex] ?? assetPath(fallbackCampusImage)}
      onError={() => setCandidateIndex((current) => Math.min(current + 1, candidates.length - 1))}
    />
  );
}
