export type LabSearchParams = Promise<Record<string, string | string[] | undefined>>;

export const PREVIEW_PARAM = "preview";

export function previewHref(href: string): string {
  return `${href}?${PREVIEW_PARAM}=1`;
}

export async function isPreview(searchParams: LabSearchParams): Promise<boolean> {
  const value = (await searchParams)[PREVIEW_PARAM];
  return (Array.isArray(value) ? value[0] : value) === "1";
}
