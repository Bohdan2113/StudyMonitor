<?php
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

    // Валідація на порожні значення
    if (empty($id) || empty($group_name) || empty($fname) || empty($lname) || empty($gender) || empty($bdate) || empty($status)) {
        http_response_code(400);
        echo json_encode(["error" => "Something went wrong? try again"]);
        exit;
    }
    // Валідація на перевищення максимальної довжини
    if (mb_strlen($group_name) > 50) {
        http_response_code(400);
        echo json_encode(["field" => "group", "max" => 50]);
        exit;
    }
    if (mb_strlen($gender) > 50) {
        http_response_code(400);
        echo json_encode(["field" => "gender", "max" => 50]);
        exit;
    }
    if (mb_strlen($fname) > 100) {
        http_response_code(400);
        echo json_encode(["field" => "fname", "max" => 100]);
        exit;
    }
    if (mb_strlen($lname) > 100) {
        http_response_code(400);
        echo json_encode(["field" => "lname", "max" => 100]);
        exit;
    }
    // Валідація на формат дати
    $date = DateTime::createFromFormat('Y-m-d', $bdate);
    if (!$date || $date->format('Y-m-d') !== $bdate) {
        http_response_code(400);
        echo json_encode(["field" => "bdate", "error" => "Invalid birthdate format"]);
        exit;
    }

    // Перевірка на дублікат 
    $checkQuery = "SELECT COUNT(*) FROM students WHERE group_name = ? AND fname = ? AND lname = ? AND gender = ? AND bdate = ?";
    $checkStmt = $pdo->prepare($checkQuery);
    $checkStmt->execute([$group_name, $fname, $lname, $gender, $bdate]);
    $exists = $checkStmt->fetchColumn();
    if ($exists > 0) {
        http_response_code(409);
        echo json_encode(["error" => "Such student already exists"]);
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
