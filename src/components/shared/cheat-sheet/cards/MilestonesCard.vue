<template>
  <article>
    <div class="card-heading card-heading-compact">
      <h2>Meilensteine</h2>
    </div>

    <ul class="compact-list compact-list-tight">
      <li><strong>Minor:</strong> meist Sitzungsende; 1 kleine Änderung, z. B. Stunt tauschen oder Aspekte umbenennen.</li>
      <li><strong>Significant:</strong> Szenarioende; Minor + 1 Fertigkeitspunkt und schwere Konsequenzen umbenennen.</li>
      <li><strong>Major:</strong> Story-Arc-Ende; Significant + 1 Refresh, extremes umbenennen, High Concept/Skill-Cap anpassen.</li>
    </ul>
  </article>
</template>

<style scoped>
.card-heading {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-bottom: 0.6rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--fate-blue-light);
}

.card-heading h2 {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.2;
  color: var(--fate-heading);
  letter-spacing: 0.015em;
}

.compact-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
  padding-left: 0;
}

.compact-list li {
  list-style: none;
  margin: 0;
  padding: 0.45rem 0.5rem;
  border: 1px solid var(--fate-blue-light);
  border-left-width: 0.23rem;
  border-radius: 8px;
  background: var(--fate-white);
  line-height: 1.3;
  font-size: 0.72rem;
  color: var(--fate-text-light);
}

.compact-list li:nth-child(1) {
  border-left-color: #f0c040;
}

.compact-list li:nth-child(2) {
  border-left-color: var(--fate-blue);
}

.compact-list li:nth-child(3) {
  border-left-color: var(--fate-green);
}
</style>
