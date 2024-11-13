<script>
  import { onMount } from "svelte";
  import { db, auth } from "$lib/firebase";
  import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
  } from "firebase/firestore";
  import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
  } from "firebase/auth";
  import { toast } from "@zerodevx/svelte-toast";
  import { currUser, isSuperAdmin } from "$lib/stores/auth";

  let kullanicilar = [];
  let yeniKullanici = { email: "", password: "", role: "admin" }; // Yeni kullanıcı için varsayılan role 'user'
  let selectedKullanici = null;
  let loading = true;

  // Mevcut kullanıcı bilgilerini saklamak için değişkenler
  let currentUserEmail = $currUser.email;
  let currentUserPassword = $currUser.password;

  let currentUserRole = $isSuperAdmin ? "super admin" : "admin";

  onMount(async () => {
    await fetchKullanicilar();

    console.log(kullanicilar);

    // Oturum açmış kullanıcıyı kontrol edip role bilgisine göre currentUserRole'u güncelleyebilirsiniz
    const user = auth.currentUser;

    if (user) {
      // Firestore'da oturum açan kullanıcının rolünü kontrol edin
      const userDoc = await getDocs(collection(db, "users"));
      const loggedInUser = userDoc.docs.find(
        (doc) => doc.data().uid === user.uid
      );

      if (loggedInUser) {
        currentUserRole = loggedInUser.data().role;
      }
    }
  });

  const fetchKullanicilar = async () => {
    try {
      const userRef = collection(db, "users");
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
    if (!yeniKullanici.email || !yeniKullanici.password) {
      toast.push("E-posta ve şifre gereklidir.", {
        theme: {
          "--toastBackground": "#F56565",
          "--toastColor": "#fff",
          "--toastBarBackground": "#C53030",
        },
      });
      return;
    }

    if (yeniKullanici.role === "admin" && currentUserRole !== "super admin") {
      toast.push("Sadece süper adminler yeni adminler oluşturabilir.", {
        theme: {
          "--toastBackground": "#F56565",
          "--toastColor": "#fff",
          "--toastBarBackground": "#C53030",
        },
      });
      return;
    }
    try {
      // Yeni kullanıcıyı oluştur ve mevcut oturumu sonlandırmadan geri yükle
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        yeniKullanici.email,
        yeniKullanici.password
      );
      const user = userCredential.user;

      // Firestore'da kullanıcıyı oluştur
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        email: yeniKullanici.email,
        role: yeniKullanici.role,
      });

      toast.push("Kullanıcı başarıyla eklendi.", {
        theme: {
          "--toastBackground": "#48BB78",
          "--toastColor": "#fff",
          "--toastBarBackground": "#2F855A",
        },
      });

      yeniKullanici = { email: "", password: "", role: "user" }; // Formu temizle

      // Mevcut kullanıcı oturumunu geri yükle
      if (currentUserEmail && currentUserPassword) {
        await signInWithEmailAndPassword(
          auth,
          currentUserEmail,
          currentUserPassword
        );
      }

      await fetchKullanicilar();
    } catch (error) {
      toast.push("Kullanıcı eklenirken bir hata oluştu: " + error.message, {
        theme: {
          "--toastBackground": "#F56565",
          "--toastColor": "#fff",
          "--toastBarBackground": "#C53030",
        },
      });

      // Giriş hatası oluşursa, kullanıcıyı tekrar giriş yapmaya yönlendirin
      if (currentUserEmail && currentUserPassword) {
        await signInWithEmailAndPassword(
          auth,
          currentUserEmail,
          currentUserPassword
        );
      }
    }
  };

  const handleDeleteUser = async (id) => {
    if (currentUserRole !== "super admin") {
      toast.push("Sadece süper adminler kullanıcıları silebilir.", {
        theme: {
          "--toastBackground": "#F56565",
          "--toastColor": "#fff",
          "--toastBarBackground": "#C53030",
        },
      });
      return;
    }

    if (id === auth.currentUser.uid) {
      toast.push("Kendi hesabınızı silemezsiniz.", {
        theme: {
          "--toastBackground": "#F56565",
          "--toastColor": "#fff",
          "--toastBarBackground": "#C53030",
        },
      });
      return;
    }

    try {
      // Firestore'daki kullanıcıyı sil
      await deleteDoc(doc(db, "users", id));
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
</script>

<div class="p-4 bg-white rounded shadow-lg max-w-3xl mx-auto">
  <h2 class="text-2xl font-bold mb-4">Kullanıcı Yönetimi</h2>
  <div class="mb-4">
    <h3 class="text-lg font-semibold">Yeni Kullanıcı Ekle</h3>
    <input
      type="email"
      bind:value={yeniKullanici.email}
      placeholder="E-posta"
      class="p-2 border rounded w-full mb-2 focus:ring focus:ring-blue-500"
    />
    <input
      type="password"
      bind:value={yeniKullanici.password}
      placeholder="Şifre"
      class="p-2 border rounded w-full mb-2 focus:ring focus:ring-blue-500"
    />
    <select
      bind:value={yeniKullanici.role}
      class="p-2 border rounded w-full mb-2 focus:ring focus:ring-blue-500"
    >
      <option value="admin">Admin</option>
      <option value="super admin">Super Admin</option>
    </select>
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
          <li class="p-2 border-b flex justify-between items-center shadow-lg">
            <div>
              <strong>{kullanici.email}</strong>
            </div>
            <div>
              <strong>{kullanici.role}</strong>
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
        type="email"
        bind:value={selectedKullanici.email}
        placeholder="E-posta"
        class="p-2 border rounded w-full mb-2 focus:ring focus:ring-blue-500"
      />
      <select
        bind:value={selectedKullanici.role}
        class="p-2 border rounded w-full mb-2 focus:ring focus:ring-blue-500"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="super admin">Super Admin</option>
      </select>
      <button
        on:click={handleUpdateUser}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-500 w-full"
        >Güncelle</button
      >
    </div>
  {/if}
</div>
