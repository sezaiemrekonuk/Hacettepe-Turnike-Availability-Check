<script>
  import { push } from "svelte-toast";
</script>

<button on:click={() => push("Bu bir bildirim örneğidir")}>
  Bildirim Gönder
</button>
