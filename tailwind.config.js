/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Instagram-inspired color palette
        "instagram-blue": "#405de6",
        "instagram-purple": "#5b51d8",
        "instagram-pink": "#833ab4",
        "instagram-orange": "#fd1d1d",
        "instagram-yellow": "#fcb045",
      },
      fontFamily: {
        instagram: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      maxWidth: {
        instagram: "935px",
      },
      borderRadius: {
        instagram: "8px",
      },
      animation: {
        "slide-in": "slideIn 2s 4s forwards",
        "fade-in": "fadeIn 5s 3s forwards",
        "fade-out": "fadeOut 0.5s forwards",
        fadeIn: "simpleFadeIn 0.5s forwards",
        "spin-slow": "spin 3s linear infinite",
        "bounce-slow": "bounce 2s infinite",
        "y-translate": "yTranslate 2s alternate infinite",
        "y-translate-rev": "yTranslateRev 2s alternate infinite",
        "y-translate-small": "yTranslateSmall 2s alternate infinite",
        "y-translate-rev-small": "yTranslateRevSmall 2s alternate infinite",
        "rotate-0": "rotate0 4s infinite",
        "rotate-45": "rotate45 4s infinite",
        "rotate-90": "rotate90 4s infinite",
        "rotate-135": "rotate135 4s infinite",
      },
      keyframes: {
        slideIn: {
          from: {
            transform: "translateX(500px)",
          },
          to: {
            transform: "translateX(0px)",
          },
        },
        fadeIn: {
          from: {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0px)",
          },
        },
        fadeOut: {
          from: {
            opacity: "1",
          },
          to: {
            opacity: "0",
          },
        },
        simpleFadeIn: {
          from: {
            opacity: "0",
          },
          to: {
            opacity: "1",
          },
        },
        yTranslate: {
          "0%": {
            transform: "translateY(150px)",
          },
          "100%": {
            transform: "translateY(100px)",
          },
        },
        yTranslateRev: {
          "0%": {
            transform: "translateY(150px)",
          },
          "100%": {
            transform: "translateY(200px)",
          },
        },
        rotate0: {
          "0%": {
            transform: "rotateZ(0deg)",
          },
          "100%": {
            transform: "rotateZ(180deg)",
          },
        },
        rotate45: {
          "0%": {
            transform: "rotateZ(45deg)",
          },
          "100%": {
            transform: "rotateZ(225deg)",
          },
        },
        rotate90: {
          "0%": {
            transform: "rotateZ(90deg)",
          },
          "100%": {
            transform: "rotateZ(270deg)",
          },
        },
        rotate135: {
          "0%": {
            transform: "rotateZ(135deg)",
          },
          "100%": {
            transform: "rotateZ(315deg)",
          },
        },
        yTranslateSmall: {
          "0%": {
            transform: "translateY(60px)",
          },
          "100%": {
            transform: "translateY(40px)",
          },
        },
        yTranslateRevSmall: {
          "0%": {
            transform: "translateY(60px)",
          },
          "100%": {
            transform: "translateY(80px)",
          },
        },
      },
    },
  },
  plugins: ["@tailwindcss/forms", "@tailwindcss/typography"],
};
