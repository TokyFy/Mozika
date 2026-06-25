/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            keyframes: {
                "spin": {
                    from: {
                      transform: "rotate(0deg)"
                    },
                    to: {
                      transform: "rotate(360deg)"
                    },
                }
            },
            animation: {
                "spin": "spin 2.5s linear infinite",

            },
        },
    },
    corePlugins: {
        preflight: false,
    },
    plugins: [],
}
