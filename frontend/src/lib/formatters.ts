import { CURRENCY } from '../constants/appConstants'

export function formatAmount(value: number): string {
  return `${value.toLocaleString(CURRENCY.LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${CURRENCY.SYMBOL}`
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}
