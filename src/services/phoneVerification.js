import axios from "axios";

const DEFAULT_TIMEOUT_MS = 10000;
const DEFAULT_VERIFY_PHONE_ENDPOINT =
  "https://docking-635955947416.asia-east1.run.app/api/auth/game-login";
const DEFAULT_GAME_ID = "2";
const DEFAULT_GAME_SECRET_KEY =
  "e4b7c9f1a2d34e8b9f6a1c7d0e5f2a3b4c8d9e7f6a1b2c3d4e5f6a7b8c9d0e1f";
const DEFAULT_GAME_ICON_PATH = "/hammer-cursor.png";

export function sanitizePhilippineMobileNumber(value) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 10);
}

export function isValidPhilippineMobileNumber(value) {
  return /^9\d{9}$/.test(String(value ?? ""));
}

export function getPhoneVerificationConfig() {
  return {
    endpoint: DEFAULT_VERIFY_PHONE_ENDPOINT,
    gameId: DEFAULT_GAME_ID,
    gameSecretKey: DEFAULT_GAME_SECRET_KEY,
    gameIconPath: DEFAULT_GAME_ICON_PATH,
  }
}

/**
 * Sends the current game's identity together with the mobile number to the
 * verification endpoint. The backend should validate the unique pair of
 * `game_id` + `phone`.
 */
export async function verifyPhoneWithAxios(phone, points = 0) {
  const { endpoint, gameId, gameSecretKey, gameIconPath } = getPhoneVerificationConfig()
  const sanitizedPhone = sanitizePhilippineMobileNumber(phone)
  const pointsRounded = Math.round(Number(points))
  const safePoints = Number.isFinite(pointsRounded) ? String(pointsRounded) : "0"

  const response = await axios.post(
    endpoint,
    {
      game_id: String(gameId),
      gamesecretkey: String(gameSecretKey),
      phone: sanitizedPhone,
      game_icon_path: String(gameIconPath),
      points: safePoints,
    },
    {
      timeout: DEFAULT_TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  )

  return response.data
}
