export function normalizeAuthResponse(response) {
  const body = response?.data ?? response ?? {}
  const token = body?.token ?? body?.data?.token ?? null
  const user = body?.user ?? body?.data?.user ?? null

  if (!token || !user) {
    const fallbackMessage =
      body?.error ||
      body?.message ||
      (typeof body === 'string' ? body.replace(/<[^>]+>/g, ' ').trim() : '') ||
      'Login response is missing token or user data.'

    throw new Error(fallbackMessage)
  }

  return { token, user }
}
