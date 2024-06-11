<script lang="ts">
  export let id: string;
  export let date: string = "";
  export let message: string = "";
  export let status: "processing" | "succeeded" | "failed";
</script>

<div class="request {status === "processing" ? "loading" : "" }">
  <div class="rlabels">
    <p class="rid rlabel">{id}</p>
    <p class="date rlabel">{date}</p>
  </div>
  <div class="requestcontent">
    {#if status === "processing"}
      <p>Processing...</p>
    {:else if status === "succeeded"}
      <p class="succeeded">Succeeded</p>
    {:else if status === "failed"}
      <p class="failed">Failed with {message}</p> 
    {/if}
  </div>
</div>

<style>
  .loading {
    animation-duration: 2s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: placeHolderShimmer;
    animation-timing-function: linear;
    background: linear-gradient(to right, rgb(26, 26, 26) 8%, #1f1f1f 21%, rgb(26, 26, 26) 33%);
    position: relative;
  }

  @keyframes placeHolderShimmer {
    0% {
      background-position: -800px 0
    }
    100% {
      background-position: 800px 0
    }
  }

  .failed {
    color: rgb(252,69,69);
    padding-bottom: 3px;
  }

  .succeeded {
    position: relative;
    text-decoration: none;
    padding-bottom: 3px;
  }

  .succeeded::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 3px;
    border-radius: 4px;
    background: rgb(131,58,180);
    background: linear-gradient(90deg, rgba(131,58,180,1) 0%, rgba(252,69,69,1) 100%);
    bottom: 0;
    left: 0;
  }

  .request {
    padding-top: 3px;
    border-radius: 3px;
    min-height: 51px;
    background-color: rgb(20, 20, 20);
    width: 50%;
    white-space: nowrap;
    overflow: hidden;
    min-width: 120px;
  }

  .rlabel {
    font-size: smaller;
    background-color: var(--side2-text-color);
    background-clip: text;
    color: transparent;
  }

  .rlabels {
    flex-wrap: wrap;
    display: flex;
    justify-content: space-between;
  }
</style>