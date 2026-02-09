<script>
  import ZKLayout from './ZKLayout.svelte';
  import { zkFloors } from '../../content/zkFloors';

  const floor = zkFloors.find((f) => f.id === 'floor-05');
  const idx = zkFloors.indexOf(floor);
  const prevHref = idx > 0 ? `#/` + zkFloors[idx - 1].route : '#/zk';
  const nextHref = idx < zkFloors.length - 1 ? `#/` + zkFloors[idx + 1].route : '';
  const accent = floor.accent === 'secondary' ? 'var(--accent-cyan)' : 'var(--accent-blue)';

  let leaves = ['doge', 'akita', 'shiba', 'husky'];

  function hash(value) {
    let h = 0;
    for (let i = 0; i < value.length; i++) {
      h = (h * 31 + value.charCodeAt(i)) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  }

  function buildLayer(list) {
    const layer = [];
    for (let i = 0; i < list.length; i += 2) {
      const left = list[i];
      const right = list[i + 1] || list[i];
      layer.push(hash(left + right));
    }
    return layer;
  }

  function tree() {
    const layers = [];
    let layer = leaves.map((l) => hash(l));
    layers.push(layer);
    while (layer.length > 1) {
      layer = buildLayer(layer);
      layers.push(layer);
    }
    return layers;
  }

  function addLeaf() {
    leaves = [...leaves, `dog-${leaves.length + 1}`];
  }
</script>

<ZKLayout
  title={floor.title}
  accent={accent}
  backHref="#/zk"
  prevHref={prevHref}
  nextHref={nextHref}
  breadcrumb={floor.number}
>
  <div slot="visual" class="tree">
    {#each tree() as layer, layerIndex (layerIndex)}
      <div class="level">
        {#each layer as node, nodeIndex (node)}
          <div class="node">
            <div class="label">L{layerIndex}·{nodeIndex}</div>
            <div class="hash">{node}</div>
          </div>
        {/each}
      </div>
    {/each}
    <div class="controls">
      <button on:click={addLeaf}>Добавить лист</button>
    </div>
  </div>

  <div slot="theory">
    <h1>{floor.title}</h1>
    <p>Меркл-дерево — сторож за стройматериалами. Корень фиксирует всё содержимое.</p>
    <h2>Как это работает</h2>
    <ul>
      <li>Лист — хэш блока данных.</li>
      <li>Каждый уровень склеивает соседние хэши.</li>
      <li>Корень — подпись всего списка.</li>
    </ul>
    <p>Добавь лист и наблюдай, как меняется корень.</p>
  </div>
</ZKLayout>

<style>
  .tree {
    width: 100%;
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .level {
    display: flex;
    justify-content: center;
    gap: 12px;
    width: 100%;
  }

  .node {
    min-width: 120px;
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(255, 215, 0, 0.05);
    border: 1px solid var(--border-dark);
    text-align: center;
  }

  .label {
    color: var(--text-tertiary);
    font-size: 0.85rem;
  }

  .hash {
    font-family: var(--font-mono);
    color: #ffd700;
    margin-top: 6px;
  }

  .controls {
    margin-top: 8px;
  }

  button {
    background: var(--accent);
    color: #0a0a0a;
    padding: 10px 16px;
    border-radius: 10px;
    border: none;
    font-weight: 700;
    letter-spacing: 0.4px;
    transition: transform 0.12s ease, box-shadow 0.12s ease;
  }

  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
  }
</style>
