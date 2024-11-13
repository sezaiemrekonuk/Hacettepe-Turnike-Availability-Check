<script>
  import GeriBildirim from "$lib/components/GeriBildirim.svelte";
  import TurnikeListesi from "$lib/components/TurnikeListesi.svelte";
  import { onDestroy } from "svelte";

  let loadingMessages = [
    "Turnike verileri alınıyor...",
    "Son güncellenme tarihleri alınıyor...",
    "Arif abiye selam veriliyor...",
  ];
  let currentIndex = 0;
  let allMessagesShown = false;

  const loadingTime = 2000;
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
    <div class="flex flex-col items-center justify-center">
      <div class="pulse-circle mb-4"></div>
      <p class="text-lg text-gray-700 font-bold font-sans">
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
    background: rgb(255, 255, 255);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    transition: opacity 0.4s ease-in-out;
  }

  .hidden {
    opacity: 0;
    pointer-events: none;
  }

  .pulse-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: #4f46e5;
    animation: pulse 1.5s infinite ease-in-out;
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2);
      opacity: 0.7;
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
