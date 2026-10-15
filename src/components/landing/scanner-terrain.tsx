export function ScannerTerrain() {
  return (
    <svg
      className="scanner-terrain"
      viewBox="0 0 760 240"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="terrain-fill"
          x1="380"
          y1="40"
          x2="380"
          y2="220"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#24363b" />
          <stop offset="1" stopColor="#080e10" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="terrain-light">
          <stop stopColor="#a6e0cb" stopOpacity=".7" />
          <stop offset="1" stopColor="#38585a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx="425"
        cy="116"
        rx="310"
        ry="105"
        fill="url(#terrain-light)"
        opacity=".15"
      />
      <path
        d="m0 185 66-20 38-33 51 3 36-38 58 16 46-48 38 21 45-39 68 30 44-16 44 38 55-11 44 29 45 8 79 47 68 12v61H0Z"
        fill="url(#terrain-fill)"
      />
      {Array.from({ length: 17 }, (_, i) => {
        const y = 92 + i * 7;
        return (
          <path
            key={i}
            d={`M${13 + i * 2} ${y + 94} 82 ${y + 68} 137 ${y + 77} 194 ${y + 36} 241 ${y + 47} 289 ${y + 10} 334 ${y + 30} 383 ${y} 429 ${y + 26} 482 ${y + 15} 536 ${y + 50} 586 ${y + 43} 643 ${y + 75} 702 ${y + 83} 760 ${y + 102}`}
            stroke={i % 4 === 0 ? "#7a9798" : "#475e65"}
            strokeOpacity={0.34 - i * 0.014}
            strokeWidth={i % 4 === 0 ? ".8" : ".5"}
          />
        );
      })}
      <path
        d="m137 168 52-29 59 10 49-45 36 21 47-36 47 25 48-13 60 32 48-5 60 39"
        stroke="#a6e0cb"
        strokeOpacity=".28"
        strokeWidth=".8"
      />
    </svg>
  );
}
