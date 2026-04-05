<template>
  <article>
    <div class="card-heading card-heading-compact">
      <h2>Konsequenzen</h2>
    </div>

    <ul class="compact-list compact-list-tight">
      <li>Mild (+2), Moderat (+4), Schwer (+6) reduzieren die Shifts eines Treffers.</li>
      <li>Du kannst mehrere Konsequenzen für einen Treffer nehmen, falls Slots frei sind.</li>
      <li>Der Gegner erhält auf jede neue Konsequenz 1 freien Invoke.</li>
      <li>Konsequenzen sind bleibende Aspekte, bis sie erholt wurden.</li>
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
