import axios from 'axios'

const DEFAULT_TIMEOUT_MS = 10000

const DEFAULT_SCORES_URL =
  'https://docking-635955947416.asia-east1.run.app/api/game-score/power-hammer/scores'

/**
 * Fetches leaderboard rows for power-hammer. Response may be a raw array
 * or wrapped in { data }, { scores }, { results }.
 */
export async function fetchGameLeaderboardScores() {
  const url = import.meta.env.VITE_GAME_SCORES_URL || DEFAULT_SCORES_URL

  try {
    const response = await axios.get(url, {
      timeout: DEFAULT_TIMEOUT_MS,
      headers: {
        Accept: 'application/json',
      },
    })

    const payload = response.data
    let list = []
    if (Array.isArray(payload)) {
      list = payload
    } else if (Array.isArray(payload?.scores)) {
      list = payload.scores
    } else if (Array.isArray(payload?.data)) {
      list = payload.data
    } else if (Array.isArray(payload?.results)) {
      list = payload.results
    } else {
      return []
    }

    return list
      .map((row, index) => {
        const rawName =
          row.name ??
          row.player_name ??
          row.username ??
          row.nickname ??
          row.display_name ??
          `Player ${index + 1}`
        const rawScore = row.score ?? row.points ?? row.value ?? row.total ?? 0
        const numericScore = Number(rawScore)
        return {
          name: String(rawName).trim() || `Player ${index + 1}`,
          score: Number.isFinite(numericScore) ? numericScore : 0,
        }
      })
      .filter((row) => row.name.length > 0)
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
 * When the scores API returns nothing, show a couple of plausible masked-phone rows
 * with random scores in the 1–10000 range.
 */
export function createPlaceholderLeaderboardEntries(entryCount = 2) {
  const entries = []
  for (let index = 0; index < entryCount; index++) {
    entries.push({
      name: randomMaskedPhoneDisplayName(),
      score: Math.floor(1 + Math.random() * 10000),
    })
  }
  return entries
}
