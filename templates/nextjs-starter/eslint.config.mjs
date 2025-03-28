import next from "eslint-config-next";

export default [
  next(),
  {
    ignores: [
      "node_modules", // Ignore node_modules
      "coverage",     // Ignore coverage artifacts
      "dist",         // Ignore build output
      "dev-dist",     // Ignore development build output
      "public",       // Ignore public assets
      "__mocks__",    // Ignore mocks directory
      "tools",        // Ignore tools directory
      "jest.config.js", // Ignore Jest configuration
      "postcss.config.js", // Ignore PostCSS configuration
      "*.d.ts"        // Ignore TypeScript declaration files
    ],
    rules: {
      "react/react-in-jsx-scope": "off", // Not needed with React 17+
      "no-console": "warn"              // Example rule to warn on console usage
    }
  }
];
