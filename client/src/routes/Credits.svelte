<script lang="ts">
	import Credit from "./Credit.svelte";

  const vxoid = { name: "VXOID", link: "https://www.instagram.com/vxoid.lostmyself/" }
</script>

<div class="footer">
  <h3 class="liner">Credits</h3>
  <div>
    <div class="credits">
      <Credit value="AI model" devs={[{ ...vxoid, impact: "development & dataset" }]}/>
      <Credit value="Frontend" devs={[{ ...vxoid, impact: "design & development" }]}/>
      <Credit value="Backend" devs={[{ ...vxoid, impact: "API & model integration" }]}/>
    </div>

    <p class="copyright">©️ 2024 GenKeeper</p>
  </div>
</div>

<style>
  .copyright {
    font-size: smaller;
    color: var(--side-text-color);
  }

  .credits {
    display: flex;
    flex-wrap: wrap;
    text-align: center;
    justify-content: space-evenly
  }
</style>