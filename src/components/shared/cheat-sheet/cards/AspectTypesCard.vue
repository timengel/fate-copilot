<template>
  <article>
    <div class="card-heading card-heading-compact">
      <h2>Aspektarten</h2>
    </div>

    <ul class="compact-list compact-list-tight">
      <li><strong class="aspect-type">Spielaspekte:</strong> Permanent</li>
      <li><strong class="aspect-type">Charakteraspekte:</strong> Permanent</li>
      <li><strong class="aspect-type">Situationsaspekte:</strong> Halten an bis Ende der Szene oder bis irrelevant.</li>
      <li><strong class="aspect-type">Boosts:</strong> Halten an bis Ende der Szene, bis irrelevant oder bis einmal genutzt.</li>
      <li><strong class="aspect-type">Konsequenzen:</strong> Halten an, bis sie erholt wurden.</li>
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
  border-left: 0.16rem solid transparent;
  font-size: 0.72rem;
  line-height: 1.22;
  color: var(--fate-text-light);
}

.compact-list li:last-child {
  margin-bottom: 0;
}

.compact-list li::marker {
  font-weight: 700;
}

.aspect-type {
  font-weight: 700;
}

.compact-list li:nth-child(1) {
  border-left-color: #568fbe;
}

.compact-list li:nth-child(1)::marker {
  color: #568fbe;
}

.compact-list li:nth-child(1) .aspect-type {
  color: #568fbe;
}

.compact-list li:nth-child(2) {
  border-left-color: var(--fate-blue);
}

.compact-list li:nth-child(2)::marker {
  color: var(--fate-blue);
}

.compact-list li:nth-child(2) .aspect-type {
  color: var(--fate-blue);
}

.compact-list li:nth-child(3) {
  border-left-color: #279f8d;
}

.compact-list li:nth-child(3)::marker {
  color: #279f8d;
}

.compact-list li:nth-child(3) .aspect-type {
  color: #279f8d;
}

.compact-list li:nth-child(4) {
  border-left-color: #8a5fd3;
}

.compact-list li:nth-child(4)::marker {
  color: #8a5fd3;
}

.compact-list li:nth-child(4) .aspect-type {
  color: #8a5fd3;
}

.compact-list li:nth-child(5) {
  border-left-color: #d17e2d;
}

.compact-list li:nth-child(5)::marker {
  color: #d17e2d;
}

.compact-list li:nth-child(5) .aspect-type {
  color: #d17e2d;
}

</style>
