const { TsJestTransformer } = require("ts-jest");

const tsJestOptions = {
  tsconfig: "tsconfig.test.json",
  diagnostics: false,
};

const tsJest = new TsJestTransformer(tsJestOptions);

module.exports = {
  process(sourceText, sourcePath, transformOptions) {
    const patched = sourceText.replace(/import\.meta\.env/g, "process.env");
    return tsJest.process(patched, sourcePath, transformOptions);
  },
  getCacheKey(...args) {
    return tsJest.getCacheKey(...args);
  },
};
