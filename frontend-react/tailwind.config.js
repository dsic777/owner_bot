/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy:   '#080d1a',   // 배경 (메인)
        steel:  '#213a56',   // 카드/섹션 배경
        sand:   '#cdaa80',   // 포인트 (버튼, 강조)
        camel:  '#997953',   // 포인트 hover
        darkbrown: '#3D2817', // 버튼 텍스트 (금색 배경용)
        cream:  '#fcfaf8',   // 텍스트
        muted:  '#a8bdd4',   // 보조 텍스트
        border: '#2d4a6b',   // 테두리
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
