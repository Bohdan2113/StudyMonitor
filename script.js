document.addEventListener("DOMContentLoaded", function() {
    // Завантажуємо хедер
    fetch("Parts/header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header-placeholder").innerHTML = data;
        });

    // Завантажуємо навігацію
    fetch("Parts/nav.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("nav-placeholder").innerHTML = data;
        });
});
