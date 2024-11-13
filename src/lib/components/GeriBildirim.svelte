<script>
  import { onMount } from "svelte";
  import { db } from "$lib/firebase";
  import { collection, addDoc, Timestamp } from "firebase/firestore";
  import { toast } from "@zerodevx/svelte-toast";

  let feedback = "";
  let canSubmitFeedback = true;

  onMount(() => {
    // Son geri bildirim tarihini çerezden al
    const lastFeedbackDate = localStorage.getItem("lastFeedbackDate");
    if (lastFeedbackDate) {
      const lastFeedbackTime = new Date(lastFeedbackDate).getTime();
      const currentTime = Date.now();

      // Son güncellenmeden sonra bir geri bildirim yapılıp yapılmadığını kontrol et
      canSubmitFeedback = currentTime - lastFeedbackTime > 86400000; // 24 saatlik zaman sınırı
    }
  });

  const handleFeedbackSubmit = async () => {
    if (!feedback) return alert("Lütfen geri bildirim girin.");

    // Geri bildirimi Firestore'a gönder
    await addDoc(collection(db, "geriBildirimler"), {
      feedback,
      date: Timestamp.now(),
    });

    // Geri bildirimi gönderdikten sonra çerezi güncelle
    localStorage.setItem("lastFeedbackDate", new Date().toISOString());
    feedback = "";
    canSubmitFeedback = false;

    toast.push("Geri bildiriminiz başarıyla gönderildi.", {
      theme: {
        "--toastBackground": "#48BB78",
        "--toastColor": "#fff",
        "--toastBarBackground": "#2F855A",
      },
    });
  };
</script>

{#if canSubmitFeedback}
  <div class="p-4 border rounded shadow">
    <h3 class="text-lg font-semibold">Geri Bildirim Gönder</h3>
    <textarea
      bind:value={feedback}
      class="p-2 border rounded w-full mt-2"
      rows="4"
      placeholder="Geri bildiriminizi yazın..."
    ></textarea>
    <button
      on:click={handleFeedbackSubmit}
      class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Gönder</button
    >
  </div>
{:else}
  <p>
    Son güncellemeden sonra bir geri bildirim gönderdiniz. Lütfen yarın tekrar
    deneyin.
  </p>
{/if}
