<template>
  <article>
    <div class="card-heading card-heading-compact">
      <h2>Niederlage einräumen</h2>
    </div>

    <ul class="compact-list compact-list-tight">
      <li><strong class="rule-strong">Vor Wurf:</strong> Gegner bekommt, was er will, er siegt, i.d.R. überlebst du aber.</li>
      <li>Du bekommst <strong class="rule-strong">1 FP</strong>, plus <strong class="rule-strong">1 weiteren FP pro Konsequenz</strong>, die Du erlitten hattest.</li>
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
  margin: 0;
  padding-left: 1rem;
}

.compact-list li {
  margin: 0;
  margin-bottom: 0.22rem;
  padding-left: 0.24rem;
  font-size: 0.72rem;
  line-height: 1.22;
  color: var(--fate-text-light);
}

.compact-list li:last-child {
  margin-bottom: 0;
}

.rule-strong {
  font-weight: 700;
  color: var(--fate-heading);
}

</style>
