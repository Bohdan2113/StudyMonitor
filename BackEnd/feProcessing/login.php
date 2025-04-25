<?php
require_once __DIR__ . '/../Controllers/userControler.php';
header('Content-Type: application/json');

try{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["error" => "Only POST method is allowed"]);
        exit;
    }

    $controller = new UserController();
    $result = $controller->Login($_POST);

    echo json_encode($result); 
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}