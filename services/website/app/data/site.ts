export const siteOrigin = 'https://www.craigwatt.co.uk';

export function siteUrl(path: string) {
  return new URL(path, siteOrigin).toString();
}
