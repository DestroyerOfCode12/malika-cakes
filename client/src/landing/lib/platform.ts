export type NativeTheme = 'ios' | 'material';

/**
 * iOS styling on iPhone / iPad (including iPadOS, which reports as a Mac with touch)
 * and on Macs; Material styling on Android and everything else.
 * Only affects the mobile/tablet chrome — desktop uses the editorial header.
 */
export function detectNativeTheme(): NativeTheme {
  if (typeof navigator === 'undefined') return 'ios';
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'material';
  const isAppleTouch = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (isAppleTouch || /Macintosh/.test(ua)) return 'ios';
  return 'material';
}
