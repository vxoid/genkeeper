<script lang="ts">
	import type { RecordModel } from 'pocketbase';
	import Request from './Request.svelte';
  import { pb } from '$lib/pocketbase';
	import { onMount } from 'svelte';

  export let cur: string | undefined = undefined;
  let requests: RecordModel[] = [];
  let page = 1;
  let isNextAvailable = false; 
  let isPrevAvailable = false; 
  let perPage = 10;
  let totalPages: number;

  onMount(async () => {
    await updateRequests();
    updateAvailability();
  });

  function formatCreatedDate(created: string): string {
    const date = new Date(created);
    const formatter = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return formatter.format(date);
  }

  function updateAvailability() {
    isNextAvailable = page < totalPages;
    isPrevAvailable = page > 1;
  }

  async function updateRequests() {
    const fetchedRequests = await pb.collection('requests').getList(page, perPage, { 
      filter: "owner = 'b34m5czzv4gz1ow'"
    });
    totalPages = fetchedRequests.totalPages;
    requests = fetchedRequests.items.reverse();
  }

  async function nextPage() {
    if (!isNextAvailable) {
      return;
    }

    page += 1;
    updateAvailability();
    await updateRequests();
  }

  async function prevPage() {
    if (!isPrevAvailable) {
      return;
    }

    page -= 1;
    updateAvailability();
    await updateRequests();
  }
</script>

<div class="pastrequestsholder">
  <div class="pastrequests">
    {#each requests.filter((request) => request.id !== cur) as userRequest}
      <Request id={userRequest.id} resultURL={pb.getFileUrl(userRequest, userRequest.result)} status={userRequest.status} message={userRequest.message} date={formatCreatedDate(userRequest.created)}/>
    {/each}
  </div>
  {#if totalPages > 1}
    <div class="pastrequestsoptions">
      <button class="option" on:click={prevPage} disabled='{!isPrevAvailable}'>&lt</button>
      <p>{page}</p>
      <button class="option" on:click={nextPage} disabled='{!isNextAvailable}'>&gt</button>
    </div>
  {/if}
</div>

<style>
  .pastrequestsholder {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;
  }

  .pastrequests {
    align-items: center;
  }

  .pastrequests {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .pastrequestsoptions {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
  }

  .option {
    border-radius: 3px;
    border: none;
    background: none;
    color: var(--main-text-color);
    position: relative;
    text-decoration: none;
  }

  .option:disabled {
    background-color: var(--side2-text-color);
    background-clip: text;
    color: transparent;
  }
</style>