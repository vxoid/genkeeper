<script>
	import Credits from './Credits.svelte';
  import Header from './Header.svelte';
  import './normalize.css';
	import './styles.css';
</script>

<div class="app">
  <Header/>

	<main>
		<slot />
	</main>

  <Credits/>
</div>