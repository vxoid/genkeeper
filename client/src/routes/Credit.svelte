<script lang="ts">
  import Dev from "./Dev.svelte";

  export let value: string;
  export let devs: { name: string, link: string, impact: string }[];
</script>

<div class="credit">
  <b>{value}</b>
  <ul>
    {#each devs as dev}
      <li>
        <Dev name="{dev.name}" link="{dev.link}" impact="{dev.impact}"/>
      </li>
    {/each}
  </ul>
  
</div>