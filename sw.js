const CACHE_NAME = "pwa-cache-v1";

// Масив ресурсів, які будуть кешовані
const ASSETS = [
  "/", // Головна сторінка
  "/index.html", // HTML-файл
  "/dashboard.html", // HTML-файл
  "/tasks.html", // HTML-файл
  "/messages.html", // HTML-файл

  "/sw.js", // ✅ Service Worker файл
  "/manifest.json", // ✅ Файл маніфеста

  "/Components/header.html", // Component HTML-файл
  "/Components/nav.html", // Component HTML-файл

  "/CSS/genaral.css", // CSS-стилі
  "/CSS/header.css", // CSS-стилі
  "/CSS/nav.css", // CSS-стилі
  "/CSS/students.css", // CSS-стилі

  "/JS/script.js", // Головний JavaScript-файл
  "/JS/components.js", // Підключення компонент JavaScript-файл
  "/JS/students.js", // Завантаження студентів JavaScript-файл

  "/Images/bin.png", // Іконка 128px
  "/Images/hamburger.png", // Іконка 512px
  "/Images/helloKitty.png", // Іконка 512px
  "/Images/notification.svg", // Іконка 512px
  "/Images/pencil.png", // Іконка 512px
  "/Images/user.png", // Іконка 512px

  "/icons/icon.128.png", // Іконка 128px
  "/icons/icon.192.png", // Іконка 192px
  "/icons/icon.256.png", // Іконка 256px
  "/icons/icon.512.png", // Іконка 512px
];

// Подія встановлення Service Worker
// Відбувається при першому запуску або коли SW оновлюється
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Кешування ресурсів..."); // логування не обовязкове
      // Додаємо файли до кешу, якщо якийсь файл не вдасться завантажити, обробляємо помилку
      return cache.addAll(ASSETS).catch(console.error);
    })
  );
});

// Подія обробки запитів від клієнта (браузера)
// Якщо файл є в кеші – повертаємо його, інакше робимо запит до мережі
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        // Запит до мережі, якщо ресурсу немає в кеші
        const networkFetch = fetch(event.request).then((networkResponse) => {
          // Зберігаємо отриманий файл у кеш для майбутніх запитів
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });

        // Повертаємо кешовану версію, якщо вона є, інакше робимо запит до мережі
        return cachedResponse || networkFetch;
      });
    })
  );
});

// Подія активації Service Worker
// Видаляє старі кеші, які більше не використовуються
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME) // Знаходимо старі кеші
            .map((key) => caches.delete(key)) // Видаляємо їх
        );
      })
      .then(() => {
        console.log("Новий Service Worker активовано.");
        return self.clients.claim(); // Переключаємо новий SW для всіх вкладок
      })
  );
});
