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
        <radialGradient id="lamp1" cx="50%" cy="25%" r="50%">
          <stop offset="0%"   stopColor="#ffe085" stopOpacity="0.65" />
          <stop offset="40%"  stopColor="#ffb347" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lamp2" cx="50%" cy="25%" r="50%">
          <stop offset="0%"   stopColor="#ffe085" stopOpacity="0.65" />
          <stop offset="40%"  stopColor="#ffb347" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="btm-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#020609" stopOpacity="0" />
          <stop offset="100%" stopColor="#020609" stopOpacity="0.4" />
        </linearGradient>
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

      {/* 가로등 좌 */}
      <ellipse cx="118" cy="318" rx="85" ry="65" fill="url(#lamp1)" />
      <rect x="93" y="318" width="4" height="432" fill="#1e3558" />
      <path d="M95 323 Q106 305 120 302" stroke="#132238" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <rect x="114" y="297" width="14" height="8" rx="3" fill="#1e3a5a" />
      <rect x="117" y="299" width="8" height="5" rx="1" fill="#ffe085" opacity="0.95" />
      <line x1="97" y1="340" x2="292" y2="332" stroke="#0d1e38" strokeWidth="0.8" opacity="0.5" />

      {/* 가로등 우 */}
      <ellipse cx="270" cy="300" rx="85" ry="65" fill="url(#lamp2)" />
      <rect x="291" y="300" width="4" height="450" fill="#1e3558" />
      <path d="M293 305 Q282 287 268 284" stroke="#132238" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <rect x="260" y="279" width="14" height="8" rx="3" fill="#1e3a5a" />
      <rect x="263" y="281" width="8" height="5" rx="1" fill="#ffe085" opacity="0.95" />

      {/* 건물들 */}
      <g transform="translate(0,170)" opacity="0.65">
        <rect x="0"   y="452" width="70"  height="10"  fill="#0c1c35" />
        <rect x="0"   y="460" width="68"  height="290" fill="#2d508c" />
        <rect x="2"   y="462" width="64"  height="19"  fill="#101f3a" rx="1" />
        <rect x="5"   y="464" width="58"  height="15"  fill="#1a3358" opacity="0.55" />
        <rect x="0"   y="481" width="70"  height="11"  fill="#cdaa80" opacity="0.38" />
        <rect x="0"   y="481" width="70"  height="3"   fill="#997953" opacity="0.55" />
        <rect x="5"   y="504" width="25"  height="27"  fill="#ffd166" opacity="0.22" rx="2" />
        <rect x="7"   y="506" width="21"  height="23"  fill="#ffd166" opacity="0.95" rx="1" />
        <rect x="38"  y="504" width="25"  height="27"  fill="#ffd166" opacity="0.22" rx="2" />
        <rect x="40"  y="506" width="21"  height="23"  fill="#ff9933" opacity="0.90" rx="1" />
        <rect x="19"  y="542" width="30"  height="52"  fill="#07101f" rx="2" />

        <rect x="66"  y="432" width="88"  height="11"  fill="#0a1828" />
        <rect x="66"  y="440" width="86"  height="310" fill="#264478" />
        <rect x="69"  y="442" width="80"  height="22"  fill="#0f2442" />
        <rect x="72"  y="444" width="32"  height="18"  fill="#cdaa80" opacity="0.18" />
        <rect x="66"  y="464" width="86"  height="13"  fill="#1e3558" />
        {[70,82,94,106,118,130,140].map((x, i) => (
          <rect key={i} x={x} y={464} width="7" height="13" fill="#cdaa80" opacity="0.28" />
        ))}
        <rect x="70"  y="486" width="78"  height="44"  fill="#ffd166" opacity="0.18" rx="2" />
        <rect x="72"  y="488" width="74"  height="40"  fill="#ffd166" opacity="0.68" rx="1" />
        <line x1="109" y1="488" x2="109" y2="528" stroke="#182e50" strokeWidth="2" />
        <rect x="87"  y="540" width="34"  height="56"  fill="#050d1c" rx="2" />
        <rect x="89"  y="542" width="14"  height="35"  fill="#ffd166" opacity="0.20" />
        <rect x="105" y="542" width="14"  height="35"  fill="#ffd166" opacity="0.20" />

        <rect x="150" y="447" width="54"  height="11"  fill="#0c1c35" />
        <rect x="150" y="455" width="52"  height="295" fill="#2d508c" />
        <rect x="153" y="457" width="46"  height="19"  fill="#101f3a" />
        <rect x="154" y="476" width="6"   height="30"  fill="#2d508c" rx="1" />
        {[0,6,12,18,24].map((dy, i) => (
          <rect key={i} x={154} y={476+dy} width="6" height="5"
            fill={i%3===0 ? '#e63946' : i%3===1 ? '#fcfaf8' : '#457b9d'} opacity="0.7" />
        ))}
        <rect x="163" y="478" width="33"  height="40"  fill="#ffd166" opacity="0.20" rx="2" />
        <rect x="165" y="480" width="29"  height="36"  fill="#ffd166" opacity="0.85" rx="1" />
        <line x1="179" y1="480" x2="179" y2="516" stroke="#1e3460" strokeWidth="1.5" />
        <rect x="163" y="550" width="28"  height="50"  fill="#050d1c" rx="2" />

        <rect x="200" y="420" width="94"  height="11"  fill="#0a1828" />
        <rect x="200" y="428" width="92"  height="322" fill="#264478" />
        <rect x="203" y="430" width="86"  height="26"  fill="#14274a" rx="1" />
        <rect x="206" y="432" width="80"  height="22"  fill="#1d3d66" opacity="0.65" />
        <rect x="210" y="435" width="72"  height="16"  fill="#cdaa80" opacity="0.15" rx="1" />
        <rect x="200" y="456" width="92"  height="14"  fill="#cdaa80" opacity="0.40" />
        <rect x="200" y="456" width="92"  height="4"   fill="#997953" opacity="0.55" />
        <rect x="204" y="478" width="40"  height="46"  fill="#ffd166" opacity="0.22" rx="2" />
        <rect x="206" y="480" width="36"  height="42"  fill="#ffd166" opacity="0.85" rx="1" />
        <rect x="252" y="478" width="36"  height="46"  fill="#ffd166" opacity="0.22" rx="2" />
        <rect x="254" y="480" width="32"  height="42"  fill="#ff9933" opacity="0.85" rx="1" />
        <rect x="222" y="534" width="48"  height="62"  fill="#050d1c" rx="2" />
        <rect x="224" y="536" width="21"  height="42"  fill="#ffd166" opacity="0.22" />
        <rect x="247" y="536" width="21"  height="42"  fill="#ffd166" opacity="0.22" />

        <rect x="290" y="437" width="56"  height="11"  fill="#0c1c35" />
        <rect x="290" y="445" width="54"  height="305" fill="#2d508c" />
        <rect x="293" y="447" width="48"  height="20"  fill="#1a3d6a" />
        <rect x="295" y="449" width="44"  height="16"  fill="#2a5a90" opacity="0.45" />
        <rect x="292" y="475" width="50"  height="57"  fill="#ffd166" opacity="0.18" rx="1" />
        <rect x="294" y="477" width="46"  height="53"  fill="#ffd166" opacity="0.85" rx="1" />
        <line x1="317" y1="477" x2="317" y2="530" stroke="#1e3460" strokeWidth="1.5" />
        <rect x="303" y="540" width="30"  height="52"  fill="#050d1c" rx="1" />

        <rect x="342" y="445" width="50"  height="11"  fill="#0a1828" />
        <rect x="342" y="453" width="48"  height="297" fill="#264478" />
        <rect x="345" y="455" width="42"  height="18"  fill="#0f2240" />
        <rect x="342" y="473" width="50"  height="9"   fill="#1e3558" opacity="0.8" />
        <rect x="346" y="490" width="17"  height="20"  fill="#ffd166" opacity="0.22" rx="1" />
        <rect x="348" y="492" width="13"  height="16"  fill="#ffd166" opacity="0.85" rx="1" />
        <rect x="369" y="490" width="17"  height="20"  fill="#ffd166" opacity="0.22" rx="1" />
        <rect x="371" y="492" width="13"  height="16"  fill="#ffd166" opacity="0.85" rx="1" />

        <rect x="150" y="445" width="2"   height="305" fill="#0d1e38" />
        <rect x="198" y="418" width="4"   height="332" fill="#0d1e38" />
        <rect x="290" y="435" width="2"   height="315" fill="#0d1e38" />
        <rect x="340" y="443" width="4"   height="307" fill="#0d1e38" />
        <ellipse cx="118" cy="463" rx="28" ry="4" fill="#ffe085" opacity="0.05" />
        <ellipse cx="268" cy="450" rx="28" ry="4" fill="#ffe085" opacity="0.05" />
      </g>

      {/* 하단 페이드 */}
      <rect x="0" y="580" width="390" height="170" fill="url(#btm-fade)" />
    </svg>
  )
}
