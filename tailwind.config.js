/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 950: '#071a3d', 900: '#0a2a5c', 800: '#0f3a7d', 700: '#16489a', 600: '#1f5bb8' },
        sky: { 50: '#f1f6fc', 100: '#e4eefa', 200: '#c9ddf4', 300: '#a3c4eb' },
        hred: { 600: '#c8102e', 700: '#a50d26', 50: '#fdecee' },
        ok: { 600: '#12805c', 50: '#e6f5ef' },
        warn: { 600: '#b7791f', 50: '#fdf3df' },
      },
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'] },
      keyframes: {
        flow: { '0%': { transform: 'translateY(-4px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseRing: { '0%,100%': { boxShadow: '0 0 0 0 rgba(31,91,184,.35)' }, '50%': { boxShadow: '0 0 0 6px rgba(31,91,184,0)' } },
      },
      animation: { flow: 'flow .35s ease-out both', pulseRing: 'pulseRing 1.4s ease-in-out infinite' },
    },
  },
  plugins: [],
}
