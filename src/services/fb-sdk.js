export async function submitScore(score) {
  if (!window.FBInstant) {
    console.warn('FBInstant not available — running in browser mode')
    return
  }

  try {
    const leaderboard = await window.FBInstant.getLeaderboardAsync('global_leaderboard')
    await leaderboard.setScoreAsync(score)
    console.log('Score submitted:', score)
  } catch (error) {
    console.error('Failed to submit score:', error.message || error)
  }
}
