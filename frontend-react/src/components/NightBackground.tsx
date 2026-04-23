const STARS = [
  { x: 25,  y: 45,  r: 1.2, o: 0.90 }, { x: 68,  y: 18,  r: 0.9, o: 0.75 },
  { x: 112, y: 62,  r: 1.5, o: 0.95 }, { x: 145, y: 25,  r: 0.7, o: 0.60 },
  { x: 189, y: 50,  r: 1.0, o: 0.80 }, { x: 230, y: 15,  r: 1.3, o: 0.85 },
  { x: 275, y: 38,  r: 0.8, o: 0.70 }, { x: 318, y: 22,  r: 1.1, o: 0.75 },
  { x: 355, y: 55,  r: 0.6, o: 0.65 }, { x: 42,  y: 95,  r: 0.8, o: 0.70 },
  { x: 88,  y: 120, r: 1.4, o: 0.90 }, { x: 135, y: 88,  r: 0.9, o: 0.65 },
  { x: 178, y: 110, r: 0.7, o: 0.80 }, { x: 220, y: 78,  r: 1.2, o: 0.85 },
  { x: 260, y: 105, r: 1.0, o: 0.70 }, { x: 305, y: 85,  r: 0.6, o: 0.60 },
  { x: 348, y: 98,  r: 1.3, o: 0.80 }, { x: 15,  y: 155, r: 0.7, o: 0.65 },
  { x: 72,  y: 168, r: 1.1, o: 0.75 }, { x: 118, y: 145, r: 0.8, o: 0.70 },
  { x: 165, y: 172, r: 1.0, o: 0.80 }, { x: 210, y: 148, r: 0.6, o: 0.60 },
  { x: 255, y: 165, r: 1.2, o: 0.75 }, { x: 298, y: 142, r: 0.9, o: 0.65 },
  { x: 342, y: 158, r: 0.7, o: 0.70 }, { x: 55,  y: 218, r: 0.8, o: 0.60 },
  { x: 155, y: 232, r: 0.6, o: 0.55 }, { x: 285, y: 220, r: 1.0, o: 0.65 },
  { x: 380, y: 178, r: 0.7, o: 0.60 }, { x: 8,   y: 198, r: 0.9, o: 0.55 },
]

export default function NightBackground() {
  return (
    <svg
        viewBox="0 0 390 750"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#010407" />
            <stop offset="55%"  stopColor="#06111f" />
            <stop offset="100%" stopColor="#0d1e38" />
          </linearGradient>
          <mask id="moon-crescent">
            <circle cx="325" cy="68" r="26" fill="white" />
            <circle cx="312" cy="62" r="22" fill="black" />
          </mask>
          <radialGradient id="moon-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#c8dff5" stopOpacity="0.32" />
            <stop offset="55%"  stopColor="#c8dff5" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#c8dff5" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 밤하늘 */}
        <rect width="390" height="750" fill="url(#sky)" />

        {/* 초승달 */}
        <circle cx="325" cy="68" r="100" fill="url(#moon-halo)" />
        <circle cx="325" cy="68" r="26" fill="#c8dff5" opacity="0.28" mask="url(#moon-crescent)" />

        {/* 별 */}
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o} />
        ))}
      </svg>
  )
}
