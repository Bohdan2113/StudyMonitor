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
    $id = $data['id'] ?? null;
    $isChecked = $data['checkbox'] ?? false;
    $group_name = $data['group_name'] ?? '';
    $fname = $data['fname'] ?? '';
    $lname = $data['lname'] ?? '';
    $gender = $data['gender'] ?? '';
    $bdate = $data['bdate'] ?? '';
    $status = $data['status'] ?? '';

    // Валідація
    if (!$id || empty($group_name) || empty($fname) || empty($lname) || empty($gender) || empty($bdate) || empty($status)) {
        http_response_code(400);
        echo json_encode(["error" => "All fields except checkbox and id are required"]);
        exit;
    }

    // Запит на оновлення даних студента
    $query = "UPDATE students SET 
        checkbox = :checkbox,
        group_name = :group_name,
        fname = :fname,
        lname = :lname,
        gender = :gender,
        bdate = :bdate,
        status = :status
        WHERE id = :id";

    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':checkbox', $isChecked, PDO::PARAM_BOOL);
    $stmt->bindParam(':group_name', $group_name);
    $stmt->bindParam(':fname', $fname);
    $stmt->bindParam(':lname', $lname);
    $stmt->bindParam(':gender', $gender);
    $stmt->bindParam(':bdate', $bdate);
    $stmt->bindParam(':status', $status);
    $stmt->bindParam(':id', $id, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode(["success" => true, "message" => "Student info has been updated"]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>

