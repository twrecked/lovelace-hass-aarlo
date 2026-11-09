import resolve from "@rollup/plugin-node-resolve";

const dev = process.env.ROLLUP_WATCH;

export default {
  input: "src/index.js",
  output: {
    file: "dist/hass-aarlo.js",
    format: "es",
    sourcemap: dev ? "inline" : false,
  },
  plugins: [
    resolve(),
  ],
};
