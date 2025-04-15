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

    // Дістаємо поля
    $id = $data['id'];
    $isChecked = $data['checkbox'] ?? false;
    $group_name = $data['group_name'] ?? '';
    $fname = $data['fname'] ?? '';
    $lname = $data['lname'] ?? '';
    $gender = $data['gender'] ?? '';
    $bdate = $data['bdate'] ?? '';
    $status = $data['status'] ?? '';

    // Валідація
    if (empty($id) || empty($group_name) || empty($fname) || empty($lname) || empty($gender) || empty($bdate) || empty($status)) {
        http_response_code(400);
        echo json_encode(["error" => "All fields except checkbox are required"]);
        exit;
    }

    // Вставка
    $query = "INSERT INTO students (id, checkbox, group_name, fname, lname, gender, bdate, status) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($query);
    $stmt->execute([
        $id,
        $isChecked ? 1 : 0,
        $group_name,
        $fname,
        $lname,
        $gender,
        $bdate,
        $status
    ]);

    echo json_encode(["success" => true, "message" => "Student added"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>
