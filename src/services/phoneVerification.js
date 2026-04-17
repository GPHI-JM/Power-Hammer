import axios from "axios";

const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Sends the mobile number and current game points to your verification endpoint.
 * Set endpoint from Vite env: VITE_VERIFY_PHONE_ENDPOINT
 */
export async function verifyPhoneWithAxios(phone, points = 0) {
  const endpoint =
    import.meta.env.VITE_VERIFY_PHONE_ENDPOINT ||
    "https://docking-635955947416.asia-east1.run.app/api/auth/game-login";

  if (!endpoint) {
    // Keep local development safe if endpoint is not configured yet.
    return { ok: true, phone, mock: true };
  }

  const pointsRounded = Math.round(Number(points))
  const safePoints = Number.isFinite(pointsRounded) ? pointsRounded : 0

  const response = await axios.post(
    endpoint,
    {
      game_id: "power-hammer-123",
      gamesecretkey: "secret123545", // 64-char hex string
      phone: phone,
      points: safePoints,
    },
    {
      timeout: DEFAULT_TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
}
