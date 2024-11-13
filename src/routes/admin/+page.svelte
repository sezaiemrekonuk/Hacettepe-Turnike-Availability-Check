<script>
  import { writable } from "svelte/store";
  import { toast } from "@zerodevx/svelte-toast";
  import TurnikeYonetimi from "$lib/components/TurnikeYonetimi.svelte";
  import KullaniciYonetimi from "$lib/components/KullaniciYonetimi.svelte";
  import { auth, db } from "$lib/firebase";
  import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
  } from "firebase/auth";
  import { doc, getDoc } from "firebase/firestore";
  import { isSuperAdmin, isAuthenticated, currUser } from "$lib/stores/auth";
  import GeriBildirimYonetimi from "$lib/components/GeriBildirimYonetimi.svelte";

  let email = "";
  let password = "";
  let errorMessage = "";

  // Kullanıcının oturum durumunu izlemek
  onAuthStateChanged(auth, async (user) => {
    try {
      if (user) {
        isAuthenticated.set(true);
        // Kullanıcının rolünü kontrol etmek
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().role === "super admin") {
          isSuperAdmin.set(true);
        } else {
          isSuperAdmin.set(false);
        }
      } else {
        isAuthenticated.set(false);
        isSuperAdmin.set(false);
      }
    } catch (error) {
      isAuthenticated.set(false);
      isSuperAdmin.set(false);
      toast.push(
        "Kullanıcı rolü kontrol edilirken bir hata oluştu: " + error.message,
        {
          theme: {
            "--toastBackground": "#F56565",
            "--toastColor": "#fff",
            "--toastBarBackground": "#C53030",
          },
        }
      );
    }
  });

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        throw new Error("Lütfen e-posta ve şifre girin.");
      }
      await signInWithEmailAndPassword(auth, email, password);
      $currUser.email = email;
      $currUser.password = password;
      toast.push("Başarıyla giriş yapıldı!", {
        theme: {
          "--toastBackground": "#48BB78",
          "--toastColor": "#fff",
          "--toastBarBackground": "#2F855A",
        },
      });
    } catch (error) {
      errorMessage = error.message;
      toast.push("Giriş başarısız: " + error.message, {
        theme: {
          "--toastBackground": "#F56565",
          "--toastColor": "#fff",
          "--toastBarBackground": "#C53030",
        },
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.push("Başarıyla çıkış yapıldı.", {
        theme: {
          "--toastBackground": "#F56565",
        },
      });
    } catch (error) {
      toast.push("Çıkış yaparken bir hata oluştu: " + error.message, {
        theme: {
          "--toastBackground": "#F56565",
          "--toastColor": "#fff",
          "--toastBarBackground": "#C53030",
        },
      });
    }
  };
</script>

{#if $isAuthenticated}
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Yönetim Paneli</h1>
    <button
      on:click={handleLogout}
      class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mb-4"
    >
      Çıkış Yap
    </button>
    <TurnikeYonetimi />
    <!-- Sadece super admin kullanıcıların erişebileceği Kullanıcı Yönetimi -->
    {#if $isSuperAdmin}
      <KullaniciYonetimi />
    {:else}
      <p class="text-red-500">
        Sadece süper admin kullanıcılar yeni kullanıcı ekleyebilir.
      </p>
    {/if}

    <GeriBildirimYonetimi />
  </div>
{:else}
  <div class="flex items-center justify-center h-screen bg-gray-100">
    <div class="p-6 bg-white rounded shadow-lg max-w-sm w-full">
      <h2 class="text-2xl font-bold text-center mb-4">Yönetim Girişi</h2>
      {#if errorMessage}
        <div class="text-red-600 mb-2">{errorMessage}</div>
      {/if}
      <div class="mb-4">
        <label class="block mb-1">E-posta</label>
        <input
          type="email"
          bind:value={email}
          class="p-2 border rounded w-full focus:ring focus:ring-blue-500"
          placeholder="E-posta adresinizi girin"
        />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Şifre</label>
        <input
          type="password"
          bind:value={password}
          class="p-2 border rounded w-full focus:ring focus:ring-blue-500"
          placeholder="Şifrenizi girin"
        />
      </div>
      <button
        on:click={handleLogin}
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-500 w-full"
      >
        Giriş Yap
      </button>
    </div>
  </div>
{/if}
