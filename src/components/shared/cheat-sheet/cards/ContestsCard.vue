<template>
  <article>
    <div class="card-heading card-heading-compact">
      <h2>Wettstreite</h2>
    </div>

    <ul class="compact-list compact-list-tight">
      <li>Wettstreit: <strong class="rule-label">mehrere Austausche ohne direkten Schaden</strong> bei gegensätzlichen Zielen.</li>
      <li><strong class="rule-label">Pro Austausch 1 Wurf</strong>; wer zuerst <strong class="rule-label">3 Siege</strong> hat, gewinnt den Wettstreit.</li>
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

.rule-label {
  color: var(--fate-heading);
  font-weight: 700;
}
</style>
