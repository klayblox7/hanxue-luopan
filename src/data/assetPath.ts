const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetPath(src: string) {
  if (!basePath || src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  return `${basePath}${src.startsWith("/") ? src : `/${src}`}`;
}
