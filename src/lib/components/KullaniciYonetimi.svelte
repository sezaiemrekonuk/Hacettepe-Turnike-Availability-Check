<script>
  import { onMount } from "svelte";
  import { db } from "$lib/firebase";
  import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
  } from "firebase/firestore";
  import { toast } from "@zerodevx/svelte-toast";

  let kullanicilar = [];
  let yeniKullanici = { username: "", password: "" };
  let selectedKullanici = null;
  let loading = true;

  onMount(async () => {
    await fetchKullanicilar();
  });

  const fetchKullanicilar = async () => {
    try {
      const userRef = collection(db, "kullanicilar");
      const querySnapshot = await getDocs(userRef);
      kullanicilar = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      loading = false;
    } catch (error) {
      toast.push(
        "Kullanıcı verileri yüklenirken bir hata oluştu: " + error.message,
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

  const handleAddUser = async () => {
    if (!yeniKullanici.username || !yeniKullanici.password) {
      toast.push("Kullanıcı adı ve şifre gereklidir.", {
        theme: {
          "--toastBackground": "#F56565",
          "--toastColor": "#fff",
          "--toastBarBackground": "#C53030",
        },
      });
      return;
    }
    try {
      await addDoc(collection(db, "kullanicilar"), yeniKullanici);
      toast.push("Kullanıcı başarıyla eklendi.", {
        theme: {
          "--toastBackground": "#48BB78",
          "--toastColor": "#fff",
          "--toastBarBackground": "#2F855A",
        },
      });
      yeniKullanici = { username: "", password: "" };
      await fetchKullanicilar();
    } catch (error) {
      toast.push("Kullanıcı eklenirken bir hata oluştu: " + error.message, {
        theme: {
          "--toastBackground": "#F56565",
          "--toastColor": "#fff",
          "--toastBarBackground": "#C53030",
        },
      });
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await deleteDoc(doc(db, "kullanicilar", id));
      toast.push("Kullanıcı başarıyla silindi.", {
        theme: {
          "--toastBackground": "#48BB78",
          "--toastColor": "#fff",
          "--toastBarBackground": "#2F855A",
        },
      });
      await fetchKullanicilar();
    } catch (error) {
      toast.push("Kullanıcı silinirken bir hata oluştu: " + error.message, {
        theme: {
          "--toastBackground": "#F56565",
          "--toastColor": "#fff",
          "--toastBarBackground": "#C53030",
        },
      });
    }
  };

  const handleUpdateUser = async () => {
    if (selectedKullanici && selectedKullanici.id) {
      try {
        const userDoc = doc(db, "kullanicilar", selectedKullanici.id);
        await updateDoc(userDoc, {
          username: selectedKullanici.username,
          password: selectedKullanici.password,
        });
        toast.push("Kullanıcı başarıyla güncellendi.", {
          theme: {
            "--toastBackground": "#48BB78",
            "--toastColor": "#fff",
            "--toastBarBackground": "#2F855A",
          },
        });
        selectedKullanici = null;
        await fetchKullanicilar();
      } catch (error) {
        toast.push(
          "Kullanıcı güncellenirken bir hata oluştu: " + error.message,
          {
            theme: {
              "--toastBackground": "#F56565",
              "--toastColor": "#fff",
              "--toastBarBackground": "#C53030",
            },
          }
        );
      }
    } else {
      toast.push("Lütfen bir kullanıcı seçin.", {
        theme: {
          "--toastBackground": "#F56565",
          "--toastColor": "#fff",
          "--toastBarBackground": "#C53030",
        },
      });
    }
  };
</script>

<div class="p-4 bg-white rounded shadow-lg max-w-3xl mx-auto">
  <h2 class="text-2xl font-bold mb-4">Kullanıcı Yönetimi</h2>
  <div class="mb-4">
    <h3 class="text-lg font-semibold">Yeni Kullanıcı Ekle</h3>
    <input
      type="text"
      bind:value={yeniKullanici.username}
      placeholder="Kullanıcı Adı"
      class="p-2 border rounded w-full mb-2 focus:ring focus:ring-blue-500"
    />
    <input
      type="password"
      bind:value={yeniKullanici.password}
      placeholder="Şifre"
      class="p-2 border rounded w-full mb-2 focus:ring focus:ring-blue-500"
    />
    <button
      on:click={handleAddUser}
      class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-500 w-full"
      >Ekle</button
    >
  </div>

  <div>
    <h3 class="text-lg font-semibold mb-2">Mevcut Kullanıcılar</h3>
    {#if loading}
      <p>Yükleniyor...</p>
    {:else if kullanicilar.length > 0}
      <ul class="mb-4">
        {#each kullanicilar as kullanici}
          <li class="p-2 border-b flex justify-between items-center">
            <div>
              <strong>{kullanici.username}</strong>
            </div>
            <div>
              <button
                on:click={() => (selectedKullanici = { ...kullanici })}
                class="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2"
                >Düzenle</button
              >
              <button
                on:click={() => handleDeleteUser(kullanici.id)}
                class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >Sil</button
              >
            </div>
          </li>
        {/each}
      </ul>
    {:else}
      <p>Henüz kullanıcı yok.</p>
    {/if}
  </div>

  {#if selectedKullanici}
    <div class="mb-4">
      <h3 class="text-lg font-semibold">Kullanıcıyı Düzenle</h3>
      <input
        type="text"
        bind:value={selectedKullanici.username}
        placeholder="Kullanıcı Adı"
        class="p-2 border rounded w-full mb-2 focus:ring focus:ring-blue-500"
      />
      <input
        type="password"
        bind:value={selectedKullanici.password}
        placeholder="Şifre"
        class="p-2 border rounded w-full mb-2 focus:ring focus:ring-blue-500"
      />
      <button
        on:click={handleUpdateUser}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-500 w-full"
        >Güncelle</button
      >
    </div>
  {/if}
</div>
