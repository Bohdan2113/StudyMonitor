const CACHE_NAME = "pwa-cache-v1";

// Масив ресурсів, які будуть кешовані
const ASSETS = [
  "./StudyMonitor", // Головна сторінка

  "index.html", // php-файл
  "student.php", // php-файл
  "dashboard.php", // php-файл
  "tasks.php", // php-файл
  "messages.php", // php-файл

  // BackEnd
  "BackEnd/db.php",

  "BackEnd/feProcessing/get_students.php",
  "BackEnd/feProcessing/add_student.php",
  "BackEnd/feProcessing/update_student.php",
  "BackEnd/feProcessing/delete_student.php",
  "BackEnd/feProcessing/login.php",
  "BackEnd/feProcessing/signin.php",
  "BackEnd/feProcessing/updateUser.php",
  "BackEnd/feProcessing/getUsers.php",
  "BackEnd/feProcessing/upload_avatar.php",

  "BackEnd/Controllers/studentControler.php",
  "BackEnd/Controllers/userControler.php",

  "BackEnd/Models/student.php",
  "BackEnd/Models/user.php",

  "BackEnd/chatServer/db.js",
  "BackEnd/chatServer/models.js",
  "BackEnd/chatServer/server.js",
  "BackEnd/chatServer/package-lock.json",
  "BackEnd/chatServer/package.json",

  "sw.js", // ✅ Service Worker файл
  "manifest.json", // ✅ Файл маніфеста
  "Components/header.php", // Component php-файл
  "Components/nav.php", // Component php-файл

  "CSS/genaral.css", // CSS-стилі
  "CSS/header.css", // CSS-стилі
  "CSS/nav.css", // CSS-стилі
  "CSS/students.css", // CSS-стилі
  "CSS/auth.css", // CSS-стилі
  "CSS/messages.css", // CSS-стилі

  "JS/cashe.js", // Головний JavaScript-файл
  "JS/script.js", // Головний JavaScript-файл
  "JS/components.js", // Підключення компонент JavaScript-файл
  "JS/students.js", // Завантаження студентів JavaScript-файл
  "JS/auth.js", // Завантаження студентів JavaScript-
  "JS/messages.js", // Завантаження студентів JavaScript-

  "Images/bin.png", // Іконка 128px
  "Images/hamburger.png", // Іконка 512px
  "Images/helloKitty.png", // Іконка 512px
  "Images/notification.svg", // Іконка 512px
  "Images/pencil.png", // Іконка 512px
  "Images/user.png", // Іконка 512px
  "icons/ICON.png", // Іконка 128px
  "icons/icon.128.png", // Іконка 128px
  "icons/icon.192.png", // Іконка 192px
  "icons/icon.256.png", // Іконка 256px
  "icons/icon.512.png", // Іконка 512px
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
  if (event.request.method === "POST") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        return caches.match(event.request);
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
