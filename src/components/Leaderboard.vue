<template>
  <div class="leaderboard">
    <h2 class="leaderboard__title">Leaderboard</h2>
    <ul class="leaderboard__list">
      <li
        v-for="entry in entries"
        :key="entry.name"
        class="leaderboard__item"
        :class="{ 'leaderboard__item--you': entry.name === 'You' }"
      >
        <span class="leaderboard__rank">#{{ entry.rank }}</span>
        <span class="leaderboard__name">{{ entry.name }}</span>
        <span class="leaderboard__score">{{ entry.score }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  entries: {
    type: Array,
    default: () => [],
  },
})
</script>

<style scoped>
.leaderboard {
  padding: 0.5rem 0.6rem;
  background: rgba(26, 10, 36, 0.92);
  border: 1px solid rgba(0, 255, 136, 0.5);
  border-radius: 8px;
  box-shadow: 0 0 16px rgba(0, 255, 136, 0.15);
}

.leaderboard__title {
  margin: 0 0 0.4rem 0;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--neon-green);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.leaderboard__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.leaderboard__item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid rgba(0, 255, 136, 0.2);
  font-size: 0.75rem;
}

.leaderboard__item:last-child {
  border-bottom: none;
}

.leaderboard__item--you {
  color: var(--neon-yellow);
}

.leaderboard__rank {
  flex: 0 0 1.5rem;
  color: var(--neon-cyan);
  font-weight: 600;
}

.leaderboard__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.leaderboard__score {
  flex: 0 0 2.75rem;
  text-align: right;
  color: var(--neon-green);
  font-weight: 600;
}
</style>
