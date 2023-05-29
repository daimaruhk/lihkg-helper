const typescript = require("@rollup/plugin-typescript");

const tsConfig = {
  compilerOptions: {
    target: "es2015",
    lib: ["dom", "esnext"]
  }
};

module.exports = [
  {
    input: 'scripts/content.ts',
    output: {
      dir: 'dist/scripts',
      format: 'iife'
    },
    plugins: [typescript(tsConfig)]
  },
  {
    input: 'scripts/fetch.ts',
    output: {
      dir: 'dist/scripts',
      format: 'iife'
    },
    plugins: [typescript(tsConfig)]
  },
  {
    input: 'scripts/background.ts',
    output: {
      dir: 'dist/scripts',
      format: 'es'
    },
    plugins: [typescript(tsConfig)]
  }
]