import axios from 'axios'
import { getCurrentGameLoginGameId } from './gameCatalog'

const DEFAULT_TIMEOUT_MS = 10000
const DEFAULT_TOP_SCORER_URL =
  'https://docking-635955947416.asia-east1.run.app/api/usermobile/masked/topscorer'

function extractRows(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.data?.rows)) {
    return payload.data.rows
  }

  if (Array.isArray(payload?.rows)) {
    return payload.rows
  }

  return []
}

/**
 * Fetches the top scorer rows by posting the current game's `game_id` and
 * maps the top three entries into the leaderboard shape used by the UI.
 */
export async function fetchGameLeaderboardScores() {
  const url = import.meta.env.VITE_TOP_SCORER_URL || DEFAULT_TOP_SCORER_URL
  const currentGameId = await getCurrentGameLoginGameId()

  if (!currentGameId) {
    console.warn('Leaderboard skipped because current game_id could not be resolved.')
    return []
  }

  try {
    const response = await axios.post(
      url,
      {
        game_id: String(currentGameId),
      },
      {
        timeout: DEFAULT_TIMEOUT_MS,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }
    )

    const rows = extractRows(response.data)

    return rows
      .map((row, index) => {
        const phone = String(row?.phone ?? '').trim() || `Player ${index + 1}`
        const numericScore = Number(row?.points ?? 0)
        return {
          name: phone,
          score: Number.isFinite(numericScore) ? numericScore : 0,
        }
      })
      .filter((row) => row.name.length > 0)
      .sort((rowA, rowB) => rowB.score - rowA.score)
      .slice(0, 3)
  } catch (error) {
    if (error?.response?.status !== 404) {
      console.warn('Leaderboard fetch failed.', error)
    }
    return []
  }
}

function randomMaskedPhoneDisplayName() {
  const lastSegment = String(Math.floor(1000 + Math.random() * 9000))
  const patterns = [
    () => `09** *** ${lastSegment.slice(-3)}*`,
    () => `+63 9** *** ${lastSegment.slice(-4)}`,
    () => `09${Math.floor(10 + Math.random() * 89)}* *** ${lastSegment.slice(-3)}`,
  ]
  return patterns[Math.floor(Math.random() * patterns.length)]()
}

/**
 * When the top scorer API returns nothing, show a few placeholder rows.
 */
export function createPlaceholderLeaderboardEntries(entryCount = 3) {
  const entries = []
  for (let index = 0; index < entryCount; index++) {
    entries.push({
      name: randomMaskedPhoneDisplayName(),
      score: Math.floor(1 + Math.random() * 10000),
    })
  }
  return entries
}

export async function fetchPhoneLeaderboardEntries() {
  return fetchGameLeaderboardScores()
}
