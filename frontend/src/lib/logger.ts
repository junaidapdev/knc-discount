const isProd = import.meta.env.PROD

const logger = {
  log: (...args: unknown[]): void => {
    if (!isProd) console.log('[KNC]', ...args)
  },
  warn: (...args: unknown[]): void => {
    if (!isProd) console.warn('[KNC]', ...args)
  },
  error: (...args: unknown[]): void => {
    if (!isProd) console.error('[KNC]', ...args)
  },
  info: (...args: unknown[]): void => {
    if (!isProd) console.info('[KNC]', ...args)
  },
}

export default logger
