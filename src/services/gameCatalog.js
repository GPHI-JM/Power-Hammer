import axios from 'axios'

const DEFAULT_TIMEOUT_MS = 10000
const DEFAULT_GAMES_URL =
  'https://docking-635955947416.asia-east1.run.app/api/games?featured_limit=3&new_limit=3'
const DEFAULT_GAMES_FALLBACK_URL =
  'https://docking-635955947416.asia-east1.run.app/api/games/'
export const CURRENT_GAME_NAME = 'Power Hammer'
const DEFAULT_CURRENT_GAME_ALIASES = [
  'Power Hammer',
  'Hammer Challenge',
  'Power Hammer Challenge',
  'power-hammer',
  'hammer-challenge',
]

let cachedGamesPromise = null
let cachedGames = null

function normalizeName(value) {
  return String(value ?? '').trim().toLowerCase()
}

function toSlug(value) {
  return normalizeName(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function extractGames(payload) {
  const collected = []

  if (Array.isArray(payload)) {
    collected.push(...payload)
  }

  if (Array.isArray(payload?.games)) {
    collected.push(...payload.games)
  }

  if (Array.isArray(payload?.data?.games)) {
    collected.push(...payload.data.games)
  }

  if (Array.isArray(payload?.data?.featured_games)) {
    collected.push(...payload.data.featured_games)
  }

  if (Array.isArray(payload?.data?.new_games)) {
    collected.push(...payload.data.new_games)
  }

  if (Array.isArray(payload?.data?.data?.games)) {
    collected.push(...payload.data.data.games)
  }

  if (Array.isArray(payload?.data?.data?.featured_games)) {
    collected.push(...payload.data.data.featured_games)
  }

  if (Array.isArray(payload?.data?.data?.new_games)) {
    collected.push(...payload.data.data.new_games)
  }

  if (Array.isArray(payload?.data)) {
    collected.push(...payload.data)
  }

  return collected.filter((game, index, list) => {
    const gameId = String(game?.game_id ?? game?.id ?? '').trim()
    if (!gameId) {
      return false
    }
    return list.findIndex((item) => String(item?.game_id ?? item?.id ?? '').trim() === gameId) === index
  })
}

async function loadGames() {
  if (Array.isArray(cachedGames) && cachedGames.length > 0) {
    return cachedGames
  }

  if (cachedGamesPromise) {
    return cachedGamesPromise
  }

  cachedGamesPromise = (async () => {
    const urls = [
      import.meta.env.VITE_GAMES_URL || DEFAULT_GAMES_URL,
      DEFAULT_GAMES_FALLBACK_URL,
    ]

    let lastError = null

    for (const url of urls) {
      try {
        const response = await axios.get(url, {
          timeout: DEFAULT_TIMEOUT_MS,
          headers: {
            Accept: 'application/json',
          },
        })
        const games = extractGames(response.data)
        if (games.length > 0) {
          cachedGames = games
          return cachedGames
        }
      } catch (error) {
        lastError = error
      }
    }

    cachedGamesPromise = null
    cachedGames = null
    if (lastError) {
      throw lastError
    }
    return []
  })()

  return cachedGamesPromise
}

export async function getCurrentGameLoginGameId(
  gameName = CURRENT_GAME_NAME
) {
  const requestedNames = Array.isArray(gameName)
    ? gameName
    : [gameName, ...DEFAULT_CURRENT_GAME_ALIASES]

  const normalizedNames = requestedNames
    .map((name) => String(name ?? '').trim())
    .filter(Boolean)

  const games = await loadGames()
  const match = games.find((game) => {
    const gameNameNormalized = normalizeName(game?.name)
    const gameSlugNormalized = normalizeName(game?.slug)
    const gameSlugFromName = toSlug(game?.name)

    return normalizedNames.some((name) => {
      const normalizedRequestedName = normalizeName(name)
      const normalizedRequestedSlug = toSlug(name)

      return (
        gameNameNormalized === normalizedRequestedName ||
        gameSlugNormalized === normalizedRequestedSlug ||
        gameSlugFromName === normalizedRequestedSlug
      )
    })
  })

  if (!match) {
    console.warn(`Game lookup failed for "${gameName}".`)
    return null
  }

  const rawGameId = match.game_id ?? match.id
  const resolvedGameId = String(rawGameId ?? '').trim()
  return resolvedGameId || null
}
