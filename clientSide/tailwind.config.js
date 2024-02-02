/** @type {import('tailwindcss').Config} */
export default {
  content: 
    ['./src/**/*.{js,jsx}']
  ,
  theme: {
    extend: {},
    fontFamily: {
        'sans': ['ui-sans-serif', 'system-ui'],
        'serif': ['ui-serif', 'Georgia'],
        'mono': ['ui-monospace', 'SFMono-Regular'],
        'display': ['Oswald'],
        'body': ["Open Sans"],
      }
  },
  plugins: [],
}

