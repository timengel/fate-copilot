<template>
  <article>
    <div class="card-heading card-heading-compact">
      <h2>Konsequenzen</h2>
    </div>

    <ul class="compact-list compact-list-tight">
      <li>Mild (+2), Moderat (+4), Schwer (+6) reduzieren die Shifts eines Treffers.</li>
      <li>Du kannst <strong class="rule-strong">mehrere Konsequenzen</strong> für einen Treffer nehmen, falls Slots frei sind.</li>
      <li>Konsequenzen sind <strong class="rule-strong">bleibende Aspekte</strong>, bis sie erholt wurden.</li>
      <li>Der Gegner erhält auf jede neue Konsequenz <strong class="rule-strong">1 freien Einsatz</strong>.</li>
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
