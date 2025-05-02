import Constants from "expo-constants";

const ENV = {
  dev: {
    apiUrl: "http://10.0.0.97:8000/api",
  },
  prod: {
    apiUrl: "https://your-production-api.com/api",
  },
};

export const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export const API_URL = getEnvVars().apiUrl;

// Add default export
const config = {
  API_URL,
  getEnvVars,
};

export default config;
