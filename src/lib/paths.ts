export function assetPath(filename: string) {
  return `${import.meta.env.BASE_URL}assets/${filename}`;
}

export function appURL(path: string) {
  return `${window.location.origin}${import.meta.env.BASE_URL}#${path}`;
}
