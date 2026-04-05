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
  counter-reset: checklist-step;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin: 0;
  padding-left: 0;
}

.compact-list li {
  list-style: none;
  margin: 0;
  position: relative;
  padding: 0.34rem 0.42rem 0.34rem 1.55rem;
  border: 1px solid var(--fate-light-border);
  border-radius: 7px;
  background: color-mix(in srgb, var(--fate-white) 95%, var(--fate-blue-light) 5%);
  line-height: 1.27;
  font-size: 0.72rem;
  color: var(--fate-text-light);
}

.compact-list li::before {
  counter-increment: checklist-step;
  content: counter(checklist-step);
  display: grid;
  place-items: center;
  position: absolute;
  left: 0.42rem;
  top: 0.36rem;
  width: 0.84rem;
  height: 0.84rem;
  border: 1px solid color-mix(in srgb, var(--fate-blue) 40%, var(--fate-light-border));
  border-radius: 999px;
  background: color-mix(in srgb, var(--fate-blue-light) 55%, var(--fate-white));
  color: var(--fate-heading);
  font-size: 0.61rem;
  font-weight: 700;
  line-height: 1;
}

</style>
