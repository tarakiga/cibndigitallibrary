export function getErrorMessage(error: any, fallback: string): string {
  const detail =
    error?.response?.data?.detail ??
    error?.data?.detail ??
    error?.response?.data?.message ??
    error?.data?.message

  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item) => {
        if (typeof item === 'string') return item
        if (item?.msg) {
          const loc = Array.isArray(item.loc) ? item.loc.join('.') : item.loc
          return loc ? `${loc}: ${item.msg}` : item.msg
        }
        return null
      })
      .filter(Boolean)
    if (parts.length) return parts.join(' ')
  }
  if (detail && typeof detail === 'object') {
    const msg = (detail as any).msg
    const loc = (detail as any).loc
    if (typeof msg === 'string') {
      const locText = Array.isArray(loc) ? loc.join('.') : loc
      return locText ? `${locText}: ${msg}` : msg
    }
  }
  if (typeof error?.message === 'string') return error.message
  if (typeof error?.data?.message === 'string') return error.data.message
  return fallback
}

export function isNetworkError(error: any): boolean {
  return !error?.response || error?.code === 'ERR_NETWORK'
}
