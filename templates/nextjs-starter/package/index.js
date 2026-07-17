module.exports = function resolvePackage(_setup, { appName }) {
  return {
    name: appName,
    version: "0.1.0",
    private: true,
    scripts: {
          "dev": "next dev",
          "build": "next build",
          "start": "next start",
          "format": "prettier --ignore-path .gitignore --write .",
          "lint": "eslint .",
          "lint:fix": "eslint . --fix",
          "type-check": "tsc --noEmit"
    },
    dependencies: {
          "next": "^16.2.10",
          "react": "^19.2.7",
          "react-dom": "^19.2.7",
          "zod": "^4.4.3"
    },
    devDependencies: {
          "@next/eslint-plugin-next": "^16.2.10",
          "@types/node": "^26.1.0",
          "@types/react": "^19.2.17",
          "@types/react-dom": "^19.2.3",
          "@typescript-eslint/eslint-plugin": "^8.62.1",
          "autoprefixer": "^10.5.2",
          "eslint": "^9.39.4",
          "eslint-config-next": "^16.2.10",
          "eslint-config-prettier": "^10.1.8",
          "eslint-plugin-import": "^2.32.0",
          "eslint-plugin-jsx-a11y": "^6.10.2",
          "prettier": "^3.9.4",
          "typescript": "^6.0.3",
          "typescript-eslint": "^8.62.1"
    },
  };
};
