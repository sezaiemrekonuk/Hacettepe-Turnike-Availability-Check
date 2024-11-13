<script>
  import GeriBildirim from "$lib/components/GeriBildirim.svelte";
  import TurnikeListesi from "$lib/components/TurnikeListesi.svelte";
  import { onDestroy } from "svelte";

  let loadingMessages = [
    "İlk turnike bilgileri alınıyor...",
    "İkinci turnike bilgileri alınıyor...",
    "Üçüncü turnike bilgileri alınıyor...",
    "Son güncellenme tarihleri alınıyor...",
  ];
  let currentIndex = 0;
  let allMessagesShown = false;

  const loadingTime = 1500;
  const changeMessage = () => {
    if (currentIndex < loadingMessages.length - 1) {
      currentIndex++;
    } else {
      allMessagesShown = true;
      clearInterval(interval);
    }
  };

  const interval = setInterval(changeMessage, loadingTime);
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<div class="relative">
  <!-- Main Content -->
  <div class="mt-8 p-4 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
    <h1 class="text-center text-3xl font-extrabold text-gray-800 mb-6">
      Beytepe Erkek Öğrenci Yurdu Turnike Bilgisi
    </h1>
    <TurnikeListesi />
    <div class="mt-6">
      <GeriBildirim />
    </div>
  </div>

  <!-- Loading Overlay -->
  <div class="loading-overlay {allMessagesShown ? 'hidden' : ''}">
    <div class="text-center">
      <header class="mb-12 flex justify-center items-center flex-col">
        <h2>Beytepe Erkek Öğrenci Yurdu Turnike Bilgi Sistemi</h2>
        <small class="text-gray-500">
          Sırf siz kartınızı yanınıza ne zaman almanız gerektiğini bilin diye :)
        </small>
      </header>
      <div
        class="spinner border-4 border-blue-600 border-t-transparent rounded-full w-16 h-16 animate-spin mx-auto mb-6"
      ></div>
      <p class="text-lg text-gray-700 font-medium">
        {loadingMessages[currentIndex]}
      </p>
    </div>
  </div>
</div>

<style>
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, #ebf8ff, #cfe3f8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .hidden {
    display: none;
  }

  .spinner {
    animation: spin 1s linear infinite;
    border-radius: 50%;
    width: 4rem;
    height: 4rem;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .text-lg {
    font-size: 1.125rem;
  }

  .text-gray-700 {
    color: #4a5568;
  }

  .font-medium {
    font-weight: 500;
  }

  .rounded-lg {
    border-radius: 0.75rem;
  }

  .shadow-lg {
    box-shadow:
      0 10px 15px rgba(0, 0, 0, 0.1),
      0 4px 6px rgba(0, 0, 0, 0.05);
  }
</style>
