<script>
  import { onMount } from "svelte";
  import { db } from "$lib/firebase";
  import {
    collection,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
  } from "firebase/firestore";
  import { toast } from "@zerodevx/svelte-toast";

  let feedbacks = [];
  let loading = true;

  // Geri bildirimleri getir
  const fetchFeedbacks = async () => {
    try {
      const feedbackRef = collection(db, "geriBildirimler");
      const querySnapshot = await getDocs(feedbackRef);
      feedbacks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      loading = false;
    } catch (error) {
      toast.push(
        "Geri bildirimler yüklenirken bir hata oluştu: " + error.message,
        {
          theme: {
            "--toastBackground": "#F56565",
            "--toastColor": "#fff",
            "--toastBarBackground": "#C53030",
          },
        }
      );
    }
  };

  // Geri bildirimi okundu olarak işaretle
  const markAsRead = async (id) => {
    try {
      const feedbackDoc = doc(db, "geriBildirimler", id);
      await updateDoc(feedbackDoc, { read: true });
      toast.push("Geri bildirim okundu olarak işaretlendi.", {
        theme: {
          "--toastBackground": "#48BB78",
          "--toastColor": "#fff",
          "--toastBarBackground": "#2F855A",
        },
      });
      await fetchFeedbacks(); // Listeyi güncelle
    } catch (error) {
      toast.push(
        "Geri bildirim işaretlenirken bir hata oluştu: " + error.message,
        {
          theme: {
            "--toastBackground": "#F56565",
            "--toastColor": "#fff",
            "--toastBarBackground": "#C53030",
          },
        }
      );
    }
  };

  // Geri bildirimi sil
  const deleteFeedback = async (id) => {
    if (confirm("Bu geri bildirimi silmek istediğinize emin misiniz?")) {
      try {
        const feedbackDoc = doc(db, "geriBildirimler", id);
        await deleteDoc(feedbackDoc);
        toast.push("Geri bildirim başarıyla silindi.", {
          theme: {
            "--toastBackground": "#48BB78",
            "--toastColor": "#fff",
            "--toastBarBackground": "#2F855A",
          },
        });
        await fetchFeedbacks(); // Listeyi güncelle
      } catch (error) {
        toast.push(
          "Geri bildirim silinirken bir hata oluştu: " + error.message,
          {
            theme: {
              "--toastBackground": "#F56565",
              "--toastColor": "#fff",
              "--toastBarBackground": "#C53030",
            },
          }
        );
      }
    }
  };

  // İlk başlatma sırasında geri bildirimleri getir
  onMount(fetchFeedbacks);
</script>

<div class="p-4 bg-white shadow-lg max-w-3xl mx-auto">
  <h2 class="text-2xl font-bold mb-4">Geri Bildirim Yönetimi</h2>
  {#if loading}
    <p>Geri bildirimler yükleniyor...</p>
  {:else if feedbacks.length > 0}
    <ul class="mb-4">
      {#each feedbacks as feedback}
        <li
          class="p-4 mb-2 border rounded shadow flex justify-between items-center {feedback.read
            ? 'bg-gray-100'
            : 'bg-white'}"
        >
          <div>
            <p class="font-semibold">{feedback.feedback}</p>
            <p class="text-sm text-gray-500">
              {feedback.date.toDate().toLocaleString("tr-TR")}
            </p>
            {#if feedback.read}
              <span class="text-green-600 font-semibold">Okundu</span>
            {:else}
              <span class="text-red-600 font-semibold">Okunmadı</span>
            {/if}
          </div>
          <div class="flex items-center">
            {#if !feedback.read}
              <button
                on:click={() => markAsRead(feedback.id)}
                class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-500 mr-2"
              >
                Okundu Olarak İşaretle
              </button>
            {/if}
            <button
              on:click={() => deleteFeedback(feedback.id)}
              class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-500"
            >
              Sil
            </button>
          </div>
        </li>
      {/each}
    </ul>
  {:else}
    <p>Henüz geri bildirim yok.</p>
  {/if}
</div>

<style>
  .bg-white {
    background-color: #ffffff;
  }

  .bg-gray-100 {
    background-color: #f7fafc;
  }

  .text-green-600 {
    color: #16a34a;
  }

  .text-red-600 {
    color: #dc2626;
  }

  .font-semibold {
    font-weight: 600;
  }

  .rounded {
    border-radius: 0.5rem;
  }

  .shadow {
    box-shadow:
      0 4px 6px rgba(0, 0, 0, 0.1),
      0 2px 4px rgba(0, 0, 0, 0.06);
  }
</style>
