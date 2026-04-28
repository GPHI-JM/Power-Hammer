import axios from "axios";
import { CURRENT_GAME_NAME, getCurrentGameLoginGameId } from './gameCatalog'

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_VERIFY_PHONE_ENDPOINT =
  "https://docking-635955947416.asia-east1.run.app/api/auth/game-login";
const DEFAULT_GAME_SECRET_KEY =
  "e4b7c9f1a2d34e8b9f6a1c7d0e5f2a3b4c8d9e7f6a1b2c3d4e5f6a7b8c9d0e1f";
const DEFAULT_GAME_ICON_PATH = "/hammer-cursor.png";


export let GAME_LOGIN_GAME_ID = null;

export function sanitizePhilippineMobileNumber(value) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 10);
}

export function isValidPhilippineMobileNumber(value) {
  return /^9\d{9}$/.test(String(value ?? ""));
}

export async function refreshGameLoginGameId() {
  try {
    const resolvedGameId = await getCurrentGameLoginGameId(CURRENT_GAME_NAME)
    if (resolvedGameId) {
      GAME_LOGIN_GAME_ID = resolvedGameId
    }
  } catch (error) {
    console.warn('Game ID lookup failed.', error)
  }

  return GAME_LOGIN_GAME_ID
}

void refreshGameLoginGameId()

export async function getPhoneVerificationConfig(points) {
  const gameId = await refreshGameLoginGameId()
  return {
    endpoint: DEFAULT_VERIFY_PHONE_ENDPOINT,
    gameId,
    gameSecretKey: DEFAULT_GAME_SECRET_KEY,
    gameIconPath: DEFAULT_GAME_ICON_PATH,
    points,
  }
}

/**
 * Sends the current game's identity together with the mobile number to the
 * verification endpoint. The backend should validate the unique pair of
 * `game_id` + `phone`.
 */
export async function verifyPhoneWithAxios(phone, points) {
  const { endpoint, gameId, gameSecretKey, gameIconPath, points: payloadPoints } =
    await getPhoneVerificationConfig(points)
  const sanitizedPhone = sanitizePhilippineMobileNumber(phone)
  if (payloadPoints === undefined || payloadPoints === null || payloadPoints === '') {
    throw new Error('Missing points value for phone verification.')
  }
  const scoreValue = Number(payloadPoints)
  if (!Number.isFinite(scoreValue)) {
    throw new Error('Invalid points value for phone verification.')
  }

  if (!gameId) {
    throw new Error('Unable to resolve current game_id from game catalog.')
  }

  const response = await axios.post(
    endpoint,
    {
      game_id: String(gameId),
      gamesecretkey: String(gameSecretKey),
      phone: sanitizedPhone,
      game_icon_path: String(gameIconPath),
      points: scoreValue,
    },
    {
      timeout: DEFAULT_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }
  )

  return response.data
}
