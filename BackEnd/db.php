<?php
$host = 'localhost'; // хост
$dbname = 'students_db'; // ім'я бази даних
$username = 'root'; // користувач MySQL
$password = ''; // пароль (за замовчуванням порожній)

try {
    // Підключення до бази даних
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    throw new Exception("DB connection error: " . $e->getMessage());
}
?>
