<?php
require_once __DIR__ . '/../Controllers/studentControler.php';
header('Content-Type: application/json');

try{
    $controller = new StudentController();
    $students = $controller->readAll();

    echo json_encode($students);    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}