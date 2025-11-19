import { API_BASE } from '../config'

export const api = {
  async getNonce(address: string) {
    const res = await fetch(`${API_BASE}/auth/nonce`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address }),
    })
    if (!res.ok) throw new Error('Failed to get nonce')
    return res.json()
  },

  async verifyAuth(chain: string, address: string, signature: string) {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chain, address, signature }),
    })
    if (!res.ok) throw new Error('Verification failed')
    return res.json()
  },

  async useTrial(token: string) {
    const res = await fetch(`${API_BASE}/trials/use`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
    if (!res.ok) throw new Error('Failed to use trial')
    return res.json()
  },

  async startSession(token: string, game: string) {
    const res = await fetch(`${API_BASE}/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ game }),
    })
    if (!res.ok) throw new Error('Failed to start session')
    return res.json()
  },

  async endSession(token: string, sessionId: string, score: number) {
    const res = await fetch(`${API_BASE}/session/end`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ session_id: sessionId, score }),
    })
    if (!res.ok) throw new Error('Failed to end session')
    return res.json()
  },

  async getLeaderboard(game?: string) {
    const url = game ? `${API_BASE}/leaderboard/${game}` : `${API_BASE}/leaderboard`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch leaderboard')
    return res.json()
  },

  async checkBalance(chain: string, address: string, token: string) {
    const res = await fetch(`${API_BASE}/balance/check/${chain}/${address}/${token}`)
    if (!res.ok) throw new Error('Failed to check balance')
    return res.json()
  },
}















