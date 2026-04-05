<template>
  <article>
    <div class="card-heading card-heading-compact">
      <h2>Konsequenzen</h2>
    </div>

    <ul class="compact-list compact-list-tight">
      <li>
        <strong class="consequence consequence-light">Leicht</strong> (+2),
        <strong class="consequence consequence-medium">Mittel</strong> (+4),
        <strong class="consequence consequence-severe">Schwer</strong> (+6) reduzieren die Shifts eines Treffers.
      </li>
      <li>Du kannst <strong class="rule-strong">mehrere Konsequenzen</strong> für einen Treffer nehmen, falls Slots frei sind.</li>
      <li>
        Konsequenzen sind <strong class="rule-strong">bleibende Aspekte</strong>, bis sie erholt wurden.
        <ul class="nested-list">
          <li>Erholung nach gelungener <strong class="rule-strong">Überwinden-Aktion</strong> (gegen Widerstand 2, 4, oder 6)</li>
          <li><strong class="consequence consequence-light">Leicht</strong>: 1 Szene</li>
          <li><strong class="consequence consequence-medium">Mittel</strong>: 1 Sitzung</li>
          <li><strong class="consequence consequence-severe">Schwer</strong>: 1 Szenario</li>
        </ul>
      </li>
      <li>Der Gegner erhält auf jede neue Konsequenz <strong class="rule-strong">1 freien Einsatz</strong>!</li>
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

.nested-list {
  margin: 0.18rem 0 0;
  padding-left: 0.95rem;
}

.nested-list li {
  margin-bottom: 0.16rem;
  font-size: 0.7rem;
  line-height: 1.2;
}

.nested-list li:last-child {
  margin-bottom: 0;
}

.rule-strong {
  font-weight: 700;
  color: var(--fate-heading);
}

.consequence {
  font-weight: 700;
}

.consequence-light {
  color: var(--fate-green);
}

.consequence-medium {
  color: #d48a00;
}

.consequence-severe {
  color: var(--fate-red);
}

</style>
