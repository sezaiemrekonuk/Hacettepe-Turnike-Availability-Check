<script>
  import { onMount } from "svelte";
  import { db } from "$lib/firebase";
  import {
    collection,
    getDocs,
    doc,
    updateDoc,
    addDoc,
    deleteDoc,
  } from "firebase/firestore";
  import { toast } from "@zerodevx/svelte-toast";

  let turnikeBilgileri = [];
  let selectedTurnike = null;
  let loading = true;
  let feedbackMessage = "";
  let feedbackType = "";

  // Yeni turnike eklemek için kullanılan değişkenler
  let yeniTurnike = { id: "", durum: "Giriş ve çıkış" };

  onMount(async () => {
    try {
      await fetchTurnikeBilgileri();
    } catch (error) {
      feedbackMessage =
        "Veri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.";
      feedbackType = "error";
      loading = false;
      toast.push("Veri yüklenirken hata oluştu: " + error.message, {
        theme: {
          "--toastBackground": "#F56565",
          "--toastColor": "#fff",
          "--toastBarBackground": "#C53030",
        },
      });
    }
  });

  const fetchTurnikeBilgileri = async () => {
    const turnikeRef = collection(db, "turnikeler");
    const querySnapshot = await getDocs(turnikeRef);
    turnikeBilgileri = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    loading = false;
  };

  const handleUpdate = async () => {
    if (selectedTurnike && selectedTurnike.id) {
      try {
        const turnikeDoc = doc(db, "turnikeler", selectedTurnike.id);
        await updateDoc(turnikeDoc, {
          durum: selectedTurnike.durum,
          sonGuncelleme: new Date().toISOString(),
          aktif: selectedTurnike.durum !== "Hizmet dışı",
        });
        feedbackMessage = "Turnike durumu başarıyla güncellendi.";
        feedbackType = "success";
        toast.push("Turnike durumu başarıyla güncellendi!", {
          theme: {
            "--toastBackground": "#48BB78",
            "--toastColor": "#fff",
            "--toastBarBackground": "#2F855A",
          },
        });
        await fetchTurnikeBilgileri();
      } catch (error) {
        feedbackMessage =
          "Turnike durumu güncellenirken bir hata oluştu. Lütfen tekrar deneyin.";
        feedbackType = "error";
        toast.push("Güncelleme sırasında hata oluştu: " + error.message, {
          theme: {
            "--toastBackground": "#F56565",
            "--toastColor": "#fff",
            "--toastBarBackground": "#C53030",
          },
        });
      }
      selectedTurnike = null;
    } else {
      feedbackMessage = "Lütfen bir turnike seçin.";
      feedbackType = "error";
      toast.push("Lütfen bir turnike seçin!", {
        theme: {
          "--toastBackground": "#F56565",
          "--toastColor": "#fff",
          "--toastBarBackground": "#C53030",
        },
      });
    }
  };

  const handleAddTurnike = async () => {
    if (!yeniTurnike.id) {
      toast.push("Turnike ID'si gerekli.", {
        theme: {
          "--toastBackground": "#F56565",
          "--toastColor": "#fff",
          "--toastBarBackground": "#C53030",
        },
      });
      return;
    }
    try {
      const turnikeRef = collection(db, "turnikeler");
      await addDoc(turnikeRef, {
        id: yeniTurnike.id,
        durum: yeniTurnike.durum,
        sonGuncelleme: new Date().toISOString(),
        aktif: yeniTurnike.durum !== "Hizmet dışı",
      });
      toast.push("Yeni turnike başarıyla eklendi!", {
        theme: {
          "--toastBackground": "#48BB78",
          "--toastColor": "#fff",
          "--toastBarBackground": "#2F855A",
        },
      });
      yeniTurnike = { id: "", durum: "Giriş ve çıkış" }; // Formu temizle
      await fetchTurnikeBilgileri();
    } catch (error) {
      toast.push("Turnike eklenirken bir hata oluştu: " + error.message, {
        theme: {
          "--toastBackground": "#F56565",
          "--toastColor": "#fff",
          "--toastBarBackground": "#C53030",
        },
      });
    }
  };

  const handleDeleteTurnike = async (id) => {
    if (confirm("Bu turnikeyi silmek istediğinize emin misiniz?")) {
      try {
        const turnikeDoc = doc(db, "turnikeler", id);
        await deleteDoc(turnikeDoc);
        toast.push("Turnike başarıyla silindi!", {
          theme: {
            "--toastBackground": "#48BB78",
            "--toastColor": "#fff",
            "--toastBarBackground": "#2F855A",
          },
        });
        await fetchTurnikeBilgileri(); // Listeyi güncelle
      } catch (error) {
        toast.push("Turnike silinirken bir hata oluştu: " + error.message, {
          theme: {
            "--toastBackground": "#F56565",
            "--toastColor": "#fff",
            "--toastBarBackground": "#C53030",
          },
        });
      }
    }
  };
</script>

<div class="p-4 bg-white rounded shadow-lg max-w-3xl mx-auto">
  <h2 class="text-2xl font-bold mb-4">Turnike Yönetimi</h2>

  {#if loading}
    <p>Turnike bilgileri yükleniyor...</p>
  {:else}
    {#if feedbackMessage}
      <div
        class="{feedbackType === 'success'
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'} p-2 rounded mb-4"
      >
        {feedbackMessage}
      </div>
    {/if}

    <!-- Yeni Turnike Ekleme Formu -->
    <div class="mb-6 p-4 bg-gray-50 border rounded">
      <h3 class="text-lg font-semibold mb-2">Yeni Turnike Ekle</h3>
      <div class="mb-4">
        <label class="block mb-1">Turnike ID</label>
        <input
          type="text"
          bind:value={yeniTurnike.id}
          class="p-2 border rounded w-full focus:ring focus:ring-blue-500"
          placeholder="Yeni Turnike ID"
        />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Durum</label>
        <select
          bind:value={yeniTurnike.durum}
          class="p-2 border rounded w-full focus:ring focus:ring-blue-500"
        >
          <option value="Giriş ve çıkış">Giriş ve çıkış</option>
          <option value="Sadece giriş">Sadece giriş</option>
          <option value="Sadece çıkış">Sadece çıkış</option>
          <option value="Hizmet dışı">Hizmet dışı</option>
        </select>
      </div>
      <button
        on:click={handleAddTurnike}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-500"
      >
        Ekle
      </button>
    </div>

    <!-- Mevcut Turnikeleri Listeleme ve Güncelleme -->
    {#if turnikeBilgileri.length > 0}
      <div class="mb-4">
        <label class="block mb-1">Turnike Seç</label>
        <select
          bind:value={selectedTurnike}
          class="p-2 border rounded w-full focus:ring focus:ring-blue-500"
        >
          <option value="" disabled selected>Turnike Seçiniz</option>
          {#each turnikeBilgileri as turnike}
            <option value={turnike}>{turnike.id} - {turnike.durum}</option>
          {/each}
        </select>
      </div>

      {#if selectedTurnike}
        <div class="mb-4">
          <label class="block mb-1">Durum</label>
          <select
            bind:value={selectedTurnike.durum}
            class="p-2 border rounded w-full focus:ring focus:ring-blue-500"
          >
            <option value="Giriş ve çıkış">Giriş ve çıkış</option>
            <option value="Sadece giriş">Sadece giriş</option>
            <option value="Sadece çıkış">Sadece çıkış</option>
            <option value="Hizmet dışı">Hizmet dışı</option>
          </select>
        </div>
        <button
          on:click={handleUpdate}
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-500"
        >
          Güncelle
        </button>
        <button
          on:click={() => handleDeleteTurnike(selectedTurnike.id)}
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-500 mt-2"
        >
          Sil
        </button>
      {/if}
    {:else}
      <p>Henüz turnike bilgisi yok.</p>
    {/if}
  {/if}
</div>
