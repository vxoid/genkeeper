<script lang="ts">
	import { writable, type Writable } from 'svelte/store';
	import PastRequests from './PastRequests.svelte';
	import type { RecordModel } from 'pocketbase';
	import { onDestroy, onMount } from 'svelte';
	import Request from './Request.svelte';
  import { currentToken, pb } from '$lib/pocketbase';

  /** @type {import('./$types').ActionData} */
  export let form = null;
  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  let unsubscribe: () => void;
  let request: Writable<RecordModel | null> = writable(null);

  if (form) {
    onMount(async () => {
      request.set(await pb.collection('requests').getOne(form.request))

      unsubscribe = await pb.collection('requests').subscribe(form.request, async ({ action, record }) => {
        if (action === 'update') {
          request.set(record);
        }
      });
    }); 
  }

  onDestroy(() => {
    unsubscribe?.();
  })
</script>

<svelte:head>
	<title>Import</title>
</svelte:head>

<div class="import">
  <form method="POST" action="?/import">
    <p>Enter YouTube Link</p>
    <div class="importform">
      <input class="importlink" name="link" type="url" placeholder="https://" required>
      <input class="importlink" name="token" type="hidden" value={$currentToken} hidden>
      <div class="submitparent">
        <button class="submitbutton">Import</button>
      </div>
    </div>
  </form>
  <div class="response">
    {#if form}
      {#if form.error}
        <p class="message error">{form.message}</p>
      {/if}
    {/if}
    <div class="requests">
      <div class="currequest">
        {#if $request}
          <Request id={$request.id} resultURL={pb.getFileUrl($request, $request.result)} status={$request.status} message={$request.message}/>
        {/if}
      </div>
      <div class="preqmenuitems">
        <p class="liner">Past Requests</p>
        <button class="preqmenubutton" on:click={toggleMenu}>
          <svg class="arrow {isMenuOpen ? 'up' : ''}" width="25" height="25" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M4.646 5.646a.5.5 0 01.708 0L8 8.293l2.646-2.647a.5.5 0 11.708.708l-3 3a.5.5 0 01-.708 0l-3-3a.5.5 0 010-.708z"/>
          </svg>
        </button>
      </div>
      <div class="preqcontainer {isMenuOpen ? 'show' : ''}">
        <PastRequests cur={$request?.id}/>
      </div>
    </div>
  </div>
</div>

<style>
  .importlink {
    min-width: 100px;
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
    margin-bottom: 6px;
  }
  .message {
    padding-top: 10px;
    font-size: 12px;
  }
  .error {
    color: red;
  }
  .preqmenuitems {
    display: flex;
    justify-content: space-between;
  }
  .preqmenubutton {
    border-radius: 3px;
    border: none;
    background: none;
    color: var(--main-text-color);
    position: relative;
    text-decoration: none;
    padding: 0px;
    height: 25px;
  }
  .arrow {
    transition: transform 0.3s ease;
  }
  .arrow.up {
    transform: rotate(180deg);
  }
  .preqcontainer {
    display: none;
  }
  .preqcontainer.show {
    display: block;
  }
</style>