const requests = new Map<string, { count: number; resetAt: number }>()

const WINDOW_MS   = 60_000
const MAX_PER_MIN = 20

export function checkRateLimit(userId: string): void {
  const now   = Date.now()
  const entry = requests.get(userId)

  if (!entry || now > entry.resetAt) {
    requests.set(userId, { count: 1, resetAt: now + WINDOW_MS })
    return
  }
  if (entry.count >= MAX_PER_MIN) {
    throw Object.assign(new Error('Rate limit exceeded'), { status: 429 })
  }
  entry.count++
}
