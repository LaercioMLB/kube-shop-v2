import React from "react";

export default function ProductArt({ type }) {
  return (
    <svg viewBox="0 0 300 210" role="img" aria-label={`Ilustração: ${type}`}>
      <ellipse cx="150" cy="183" rx="78" ry="12" fill="#15261e" opacity=".09" />
      {type === "headphones" && (
        <g stroke="#282635" strokeWidth="15" fill="none">
          <path d="M85 125V98a65 65 0 0 1 130 0v27" />
          <path
            d="M96 97V82a54 54 0 0 1 108 0v15"
            stroke="#555062"
            strokeWidth="6"
          />
          <rect x="72" y="103" width="35" height="65" rx="16" fill="#393646" />
          <rect x="193" y="103" width="35" height="65" rx="16" fill="#393646" />
          <path d="M84 119v31m132-31v31" stroke="#8c839c" strokeWidth="4" />
        </g>
      )}
      {type === "keyboard" && (
        <g transform="translate(40 62) rotate(-8 110 55)">
          <rect y="12" width="220" height="100" rx="13" fill="#2a3933" />
          <rect
            width="220"
            height="100"
            rx="13"
            fill="#f7f8ed"
            stroke="#bcc6b8"
            strokeWidth="3"
          />
          {Array.from({ length: 36 }, (_, i) => (
            <rect
              key={i}
              x={12 + (i % 12) * 16.5}
              y={12 + Math.floor(i / 12) * 20}
              width="13"
              height="14"
              rx="3"
              fill={i === 11 ? "#b2d16b" : "#d8ded1"}
              stroke="#b9c3b1"
            />
          ))}
          <rect x="61" y="74" width="96" height="13" rx="3" fill="#d8ded1" />
          <rect x="12" y="74" width="36" height="13" rx="3" fill="#d8ded1" />
          <rect x="170" y="74" width="36" height="13" rx="3" fill="#d8ded1" />
        </g>
      )}
      {type === "monitor" && (
        <g>
          <path d="M143 131h14v39l33 9v7h-80v-7l33-9z" fill="#40474a" />
          <rect x="48" y="30" width="204" height="126" rx="9" fill="#293438" />
          <rect x="56" y="38" width="188" height="108" rx="3" fill="#a3bbad" />
          <path d="M56 119L118 63l51 42 32-27 43 48v20H56z" fill="#638c7a" />
          <path d="M56 140l69-39 50 45H56z" fill="#355e51" />
          <circle cx="206" cy="64" r="14" fill="#ecdfad" />
        </g>
      )}
      {type === "backpack" && (
        <g>
          <path
            d="M130 40V28h40v12"
            fill="none"
            stroke="#263b43"
            strokeWidth="8"
          />
          <rect x="89" y="42" width="122" height="139" rx="38" fill="#344e58" />
          <path
            d="M104 91V80a46 46 0 0 1 92 0v11"
            fill="none"
            stroke="#1e3540"
            strokeWidth="4"
          />
          <rect x="102" y="104" width="96" height="64" rx="17" fill="#496772" />
          <path d="M116 118h68" stroke="#a4b5b8" strokeWidth="3" />
          <rect x="139" y="71" width="23" height="17" rx="3" fill="#c2cea6" />
        </g>
      )}
      {type === "mouse" && (
        <g transform="rotate(-18 150 110)">
          <path
            d="M150 34c-39 0-56 31-56 70v25c0 40 23 57 56 57s56-17 56-57v-25c0-39-17-70-56-70z"
            fill="#eae7dd"
            stroke="#b2afa3"
            strokeWidth="3"
          />
          <path d="M150 35v62m-54 8h108" stroke="#c3bfb2" strokeWidth="2" />
          <rect x="143" y="58" width="14" height="30" rx="7" fill="#35443d" />
          <path
            d="M133 163h34"
            stroke="#bbc49d"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      )}
      {type === "speaker" && (
        <g>
          <rect x="98" y="34" width="104" height="150" rx="25" fill="#2c3c36" />
          <circle
            cx="150"
            cy="80"
            r="24"
            fill="#172b23"
            stroke="#5c6c61"
            strokeWidth="5"
          />
          <circle
            cx="150"
            cy="137"
            r="31"
            fill="#192d25"
            stroke="#566b59"
            strokeWidth="5"
          />
          <circle cx="150" cy="137" r="15" fill="#334f3e" />
          <circle cx="181" cy="49" r="3" fill="#c5f56c" />
        </g>
      )}
    </svg>
  );
}
