import next from "eslint-config-next";

export default [
  next(),
  {
    rules: {
      "react/react-in-jsx-scope": "off", // Not needed with React 17+
      "no-console": "warn" // Example rule to warn on console usage
    }
  }
];
