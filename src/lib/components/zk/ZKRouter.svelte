<script>
  import ZKTowerLanding from './ZKTowerLanding.svelte';
  import Floor00Intro from './Floor00Intro.svelte';
  import FloorPlayground from './FloorPlayground.svelte';
  import Floor01NoDivision from './Floor01NoDivision.svelte';
  import Floor02Pinball from './Floor02Pinball.svelte';
  import Floor03Polynomial from './Floor03Polynomial.svelte';
  import Floor04Trace from './Floor04Trace.svelte';
  import Floor05Merkle from './Floor05Merkle.svelte';
  import Floor06Decompression from './Floor06Decompression.svelte';
  import Floor07FRI from './Floor07FRI.svelte';
  import Floor08Citadel from './Floor08Citadel.svelte';

  export let route = 'zk';

  const map = {
    'zk': ZKTowerLanding,
    'zk/intro': Floor00Intro,
    'zk/playground': FloorPlayground,
    'zk/floor-01': Floor01NoDivision,
    'zk/floor-02': Floor02Pinball,
    'zk/floor-03': Floor03Polynomial,
    'zk/floor-04': Floor04Trace,
    'zk/floor-05': Floor05Merkle,
    'zk/floor-06': Floor06Decompression,
    'zk/floor-07': Floor07FRI,
    'zk/floor-08': Floor08Citadel,
  };

  $: Component = map[route] || null;
</script>

{#if Component}
  <svelte:component this={Component} />
{:else}
  <div class="fallback">
    <h2>Этаж не найден</h2>
    <a href="#/zk">← Вернуться в Крепость</a>
  </div>
{/if}

<style>
  .fallback {
    min-height: 60vh;
    display: grid;
    place-items: center;
    text-align: center;
    color: var(--text-primary);
  }

  a {
    margin-top: 12px;
    color: var(--accent-blue);
    text-decoration: none;
  }
</style>
