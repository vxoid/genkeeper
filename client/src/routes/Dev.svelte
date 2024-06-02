<script lang="ts">
  export let name: string;
  export let link: string;
  export let impact: string;
</script>

<div class="dev">
  <a class="dev-credit" href={link}>{name}</a>
  <span class="span">{impact}</span>
</div>


<style>
  .dev-credit {
    color: var(--side-text-color);
  }

  .span {
    background-color: var(--side2-text-color);
    background-clip: text;
    color: transparent;
    font-size: smaller;
  }
</style>

