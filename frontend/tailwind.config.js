// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",  // ← ここを追加
    "./public/index.html"          // HTML 内でクラスを使うなら必要
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
