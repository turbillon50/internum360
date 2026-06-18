
// SVG icon set — NO emojis, NO lucide
type P = { size?: number; color?: string; strokeWidth?: number };
const ic = (d: string, fill=false) =>
  ({ size=24, color="currentColor", strokeWidth=1.8 }: P) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? color : "none"}
      stroke={fill ? "none" : color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round">
      <path d={d}/>
    </svg>
  );

export const IcHome      = ic("M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z");
export const IcBriefcase = ic("M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2");
export const IcBrain     = ic("M9.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 01-4.96-.44 2.5 2.5 0 01-2.96-3.08 3 3 0 01-.34-5.58 2.5 2.5 0 011.32-4.24 2.5 2.5 0 011.98-3A2.5 2.5 0 019.5 2zM14.5 2A2.5 2.5 0 0112 4.5v15a2.5 2.5 0 004.96-.44 2.5 2.5 0 002.96-3.08 3 3 0 00.34-5.58 2.5 2.5 0 00-1.32-4.24 2.5 2.5 0 00-1.98-3A2.5 2.5 0 0014.5 2z");
export const IcUser      = ic("M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z");
export const IcChevR     = ic("M9 18l6-6-6-6");
export const IcChevL     = ic("M15 18l-6-6 6-6");
export const IcSend      = ic("M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z");
export const IcCheck     = ic("M20 6L9 17l-5-5");
export const IcAlert     = ic("M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01");
export const IcCalendar  = ic("M3 4h18v18H3V4zM16 2v4M8 2v4M3 10h18");
export const IcBarChart  = ic("M18 20V10M12 20V4M6 20v-6");
export const IcBell      = ic("M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0");
export const IcSearch    = ({ size=24, color="currentColor" }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
export const IcDots      = ({ size=24, color="currentColor" }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <circle cx="5"  cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
  </svg>
);
export const IcPlus      = ({ size=24, color="currentColor" }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
