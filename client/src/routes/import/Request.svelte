<script lang="ts">
  export let id: string;
  export let resultURL: string;
  export let date: string = "";
  export let message: string = "";
  export let status: "processing" | "succeeded" | "failed";

  async function download() {
    let res = await fetch(resultURL, {
      method: 'GET',
    });

    let blob = await res.blob();
    var url = window.URL || window.webkitURL;
    let link = url.createObjectURL(blob);

    let a = document.createElement("a");
    a.setAttribute("download", `result.mp4`);
    a.setAttribute("href", link);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
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
    <div class="succededdiv">
      <p class="succeeded">Succeeded</p>
      <button class="downloadbutton" on:click={download}>
        <svg class="downloadicon" width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 21H18M12 3V17M12 17L17 12M12 17L7 12" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    {:else if status === "failed"}
      <p class="failed">Failed with {message}</p> 
    {/if}
  </div>
</div>

<style>
  .downloadbutton {
    border-radius: 3px;
    border: none;
    background: none;
    color: var(--main-text-color);
    position: relative;
    text-decoration: none;
    padding: 0px;
    height: 25px;
  }
  .downloadicon {
    vertical-align: middle;
    stroke: rgb(136 136 136 / 82%);
    fill: none;
  }
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

  .succededdiv {
    display: flex;
    justify-content: space-between;
    position: relative;
    text-decoration: none;
    padding-bottom: 3px;
  }

  .succededdiv::before {
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