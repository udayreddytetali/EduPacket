// Simple logger wrapper to gate debug/info logs by NODE_ENV
const isProd = process.env.NODE_ENV === 'production';

function debug(...args) {
  if (!isProd) console.log(...args);
}

function info(...args) {
  console.log(...args);
}

function warn(...args) {
  if (!isProd) console.warn(...args);
}

function error(...args) {
  console.error(...args);
}

module.exports = { debug, info, warn, error };
