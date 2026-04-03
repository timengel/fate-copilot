<template>
  <article>
    <div class="card-heading card-heading-compact">
      <h2>Szenen-Setup-Checkliste</h2>
    </div>

    <ul class="compact-list compact-list-tight">
      <li>Was steht auf dem Spiel?</li>
      <li>Welche 2-3 Situationsaspekte gibt es?</li>
      <li>Wie sind die Zonen aufgeteilt?</li>
      <li>Wer steht wem gegenüber?</li>
      <li>Ist das ein Konflikt, eine Herausforderung oder nur ein einzelner Wurf?</li>
    </ul>
  </article>
</template>

<style scoped>
.card-heading {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-bottom: 0.55rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid var(--fate-blue-light);
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
  gap: 0.32rem;
  margin: 0;
  padding-left: 0;
}

.compact-list li {
  list-style: none;
  margin: 0;
  position: relative;
  padding: 0.38rem 0.45rem 0.38rem 1.45rem;
  border: 1px solid var(--fate-light-border);
  border-radius: 7px;
  background: color-mix(in srgb, var(--fate-white) 94%, var(--fate-blue-light) 6%);
  line-height: 1.28;
  font-size: 0.72rem;
  color: var(--fate-text-light);
}

.compact-list li::before {
  content: '';
  position: absolute;
  left: 0.5rem;
  top: 0.52rem;
  width: 0.52rem;
  height: 0.52rem;
  border: 1.5px solid var(--fate-blue);
  border-radius: 2px;
  background: var(--fate-white);
}
</style>
