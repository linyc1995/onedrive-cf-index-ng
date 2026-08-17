const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      white: colors.white,
      gray: colors.zinc,
      red: colors.rose,
      yellow: colors.amber,
      green: colors.green,
      blue: colors.sky,
      indigo: colors.indigo,
      purple: colors.purple,
      pink: colors.pink,
      teal: colors.teal,
      cyan: colors.cyan,
      orange: colors.orange,
    },
    extend: {
      fontFamily: {
        // 系统原生中文字体栈，无外部依赖，加载更快
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          ...defaultTheme.fontFamily.sans
        ],
        mono: ['"JetBrains Mono"', '"Consolas"', ...defaultTheme.fontFamily.mono]
      },
      colors: {
        gray: {
          850: '#222226'
        }
      },
      animation: {
        'spin-slow': 'spin 5s linear infinite',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.04)',
      },
      borderRadius: {
        md: '6px',
        lg: '8px',
      }
    },
  },
  plugins: [],
}
