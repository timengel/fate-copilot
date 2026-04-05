<template>
  <article>
    <div class="card-heading card-heading-compact">
      <h2>Niederlage einräumen</h2>
    </div>

    <ul class="compact-list compact-list-tight">
      <li>Vor Wurf: Gegner bekommt, was er will, er siegt, Du überlebst aber.</li>
      <li>Du bekommst 1 FP, plus 1 weiteren pro Konsequenz, die Du erlitten hattest.</li>
    </ul>
  </article>
</template>

<style scoped>
.card-heading {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-bottom: 0.45rem;
}

.card-heading h2 {
  margin: 0;
  font-size: 0.86rem;
  line-height: 1.2;
  color: var(--fate-heading);
}

.compact-list {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  margin: 0;
  padding-left: 1rem;
}

.compact-list li {
  font-size: 0.72rem;
  line-height: 1.25;
  color: var(--fate-text-light);
}
</style>
