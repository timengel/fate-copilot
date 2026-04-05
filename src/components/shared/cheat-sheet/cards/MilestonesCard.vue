<template>
  <article>
    <div class="card-heading card-heading-compact">
      <h2>Meilensteine</h2>
    </div>

    <ul class="compact-list compact-list-tight">
      <li><strong class="rule-label">Minor:</strong> meist Sitzungsende; <span class="rule-chip">1 kleine Änderung</span>, z. B. Stunt tauschen oder Aspekte umbenennen.</li>
      <li><strong class="rule-label">Significant:</strong> Szenarioende; Minor + <span class="rule-chip">1 Fertigkeitspunkt</span> und schwere Konsequenzen umbenennen.</li>
      <li><strong class="rule-label">Major:</strong> Story-Arc-Ende; Significant + <span class="rule-chip">1 Refresh</span>, extremes umbenennen, High Concept/Skill-Cap anpassen.</li>
    </ul>
  </article>
</template>

<style scoped>
.card-heading {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin-bottom: 0.45rem;
  padding-bottom: 0.3rem;
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
  gap: 0.3rem;
  margin: 0;
  padding-left: 0;
}

.compact-list li {
  list-style: none;
  margin: 0;
  padding: 0.34rem 0.42rem;
  border: 1px solid var(--fate-light-border);
  border-radius: 7px;
  background: color-mix(in srgb, var(--fate-white) 95%, var(--fate-blue-light) 5%);
  line-height: 1.27;
  font-size: 0.72rem;
  color: var(--fate-text-light);
}

.compact-list li:nth-child(1) {
  border-left: 0.2rem solid #f0c040;
}

.compact-list li:nth-child(2) {
  border-left: 0.2rem solid var(--fate-blue);
}

.compact-list li:nth-child(3) {
  border-left: 0.2rem solid var(--fate-green);
}

.rule-label {
  color: var(--fate-heading);
  font-weight: 700;
}

.rule-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.02rem 0.32rem;
  border: 1px solid color-mix(in srgb, var(--fate-blue) 28%, var(--fate-light-border));
  border-radius: 999px;
  background: color-mix(in srgb, var(--fate-blue-light) 55%, var(--fate-white));
  color: var(--fate-heading);
  font-size: 0.68rem;
  line-height: 1.1;
  font-weight: 700;
}
</style>
