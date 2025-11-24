// Frontend logger helper — enable debug output only when REACT_APP_ENABLE_DEBUG='true'
const isDebug = (process.env.REACT_APP_ENABLE_DEBUG === 'true') && process.env.NODE_ENV !== 'production';

export function debug(...args) {
  if (isDebug) console.log(...args);
}

export function info(...args) {
  console.info(...args);
}

export function warn(...args) {
  if (isDebug) console.warn(...args);
}

export function error(...args) {
  console.error(...args);
}

export default { debug, info, warn, error };
