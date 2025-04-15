<?php
// Підключення до бази даних
include('db.php');

// Виведення списку студентів
$query = "SELECT * FROM students";
$stmt = $pdo->query($query);
$students = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($students);
?>