<script>
	import Credits from './Credits.svelte';
  import Header from './Header.svelte';
  import { pb } from '$lib/pocketbase';
	import { onMount } from 'svelte';
  import './normalize.css';
	import './styles.css';
  
  onMount(async () => {
    await pb.collection('users').authWithPassword("test@gmail.com", "testtest");
    
    console.log(pb.authStore.token);
  });
</script>

<div class="app">
  <Header/>

  <div class="page">
    <slot />
  
    <Credits/>
  </div>
</div>