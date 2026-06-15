const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetPath(src: string) {
  if (!basePath || src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  return `${basePath}${src.startsWith("/") ? src : `/${src}`}`;
}

export function routePath(href: string) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)) {
    return href;
  }

  const [pathAndQuery, hash = ""] = href.split("#", 2);
  const [pathname, query = ""] = pathAndQuery.split("?", 2);
  const normalizedPathname =
    pathname && pathname !== "/" && !pathname.endsWith("/") && !/\.[^/]+$/.test(pathname)
      ? `${pathname}/`
      : pathname;
  const normalizedHref = `${normalizedPathname}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;

  if (!basePath) return normalizedHref;

  return `${basePath}${normalizedHref.startsWith("/") ? normalizedHref : `/${normalizedHref}`}`;
}
