<?php
header('Content-Type: application/json');
include('db.php');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["error" => "Only POST method is allowed"]);
        exit;
    }
    $data = json_decode(file_get_contents('php://input'), true);
    $ids = $data['ids'] ?? [];

    if (empty($ids) || !is_array($ids)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid or empty ID list"]);
        exit;
    }

    // Створюємо плейсхолдери для підготовки запиту (наприклад: :id0, :id1, ...)
    $placeholders = [];
    $params = [];

    foreach ($ids as $index => $id) {
        $key = ":id$index";
        $placeholders[] = $key;
        $params[$key] = $id;
    }

    $query = "DELETE FROM students WHERE id IN (" . implode(",", $placeholders) . ")";
    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    
    echo json_encode(["success" => true, "message" => "Students deleted successfully"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>