<script>
  import { onMount, onDestroy } from "svelte";
  import { db } from "$lib/firebase";
  import { collection, onSnapshot } from "firebase/firestore";

  let turnikeBilgileri = [];
  let loading = true;
  let unsubscribe = null; // Aboneliği iptal etmek için kullanılacak değişken

  onMount(() => {
    const turnikeRef = collection(db, "turnikeler");
    unsubscribe = onSnapshot(
      turnikeRef,
      (querySnapshot) => {
        turnikeBilgileri = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        loading = false;
      },
      (error) => {
        console.error("Snapshot hatası:", error);
        loading = false;
      }
    );

    // Bileşen yok edildiğinde aboneliği temizlemek için
    onDestroy(() => {
      if (unsubscribe) {
        unsubscribe();
      }
    });
  });
</script>

{#if loading}
  <p>Turnike bilgileri yükleniyor...</p>
{:else}
  <div class="grid gap-4">
    {#each turnikeBilgileri as turnike}
      <div class="p-4 border rounded shadow">
        <h2 class="text-lg font-semibold">Turnike {turnike.id}</h2>
        <p>Durum: {turnike.durum}</p>
        <p>
          Son Güncelleme: {new Date(turnike.sonGuncelleme).toLocaleString("TR")}
        </p>
        <!-- Durum göstergesi için görsel stil -->
        <div
          class="mt-2 w-4 h-4 rounded-full"
          class:green={turnike.aktif}
          class:red={!turnike.aktif}
        ></div>
      </div>
    {/each}
  </div>
{/if}

<style>
  .green {
    background-color: green;
  }
  .red {
    background-color: red;
  }
</style>
