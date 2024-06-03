<script lang="ts">
  /** @type {import('./$types').ActionData} */
  export let form = null;
</script>


<svelte:head>
	<title>Import</title>
</svelte:head>

<div class="page">
  <form method="POST" action="?/import">
    <p>Enter YouTube Link</p>
    <div class="importform">
      <input class="importlink" name="link" type="url" placeholder="https://" required>
      <div class="submitparent">
        <button class="submitbutton">Import</button>
      </div>
      {#if form}
        {#if form.error}
          <p class="message error">{form.message}</p>
        {:else}
          <div class="videos">
            <p>Videos</p>
            {#each form.videos as video}
              <p>{video}</p>
            {/each}
          </div>
        {/if}
      {/if}
    </div>
  </form>
</div>

<style>
  .importlink {
    min-width: 200px;
    padding: 5px;
    margin-top: 5px;
    box-sizing: border-box;
    border: 2px solid #ccc;
    border-radius: 4px;
    font-size: 13px;
  }
  .importlink:focus {
    outline: none;
  }
  .importform {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-end;
    gap: 10px;
  }
  .message {
    padding-top: 10px;
    font-size: 12px;
  }
  .error {
    color: red;
  }
</style>