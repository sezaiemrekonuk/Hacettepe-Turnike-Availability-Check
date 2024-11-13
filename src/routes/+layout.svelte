<script>
  import "../global.css";
  import { SvelteToast } from "@zerodevx/svelte-toast";
</script>

<SvelteToast position="bottom-right" />
<slot />

<footer>
  <p class="text-center text-gray-500 text-sm">Sezai Emre Konuk</p>
</footer>
