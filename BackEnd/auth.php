<?php
header("Content-Type: application/json");

try {
    include('db.php');
    $action = $_POST['action'];

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(["error" => "Only POST method is allowed"]);
        exit;
    }

    if ($action === 'login') {
        $username = $_POST['usernameL'];
        $password = $_POST['passwordL'];

        // Валідація
        if (empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode(["error" => "All fields are required"]);
            exit;
        }

        // Перевірка, чи username знаходиться в БД
        $query = "SELECT * FROM users WHERE username = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            // Користувача нема
            echo json_encode(["badLogin" => true, "message" => "Username is undefined"]);
            exit;
        }
        // Перевірка правильності пароля
        $hashedPassword = $user["password"];
        if (!password_verify($password, $hashedPassword)) {
            echo json_encode(["badPassword" => true, "message" => "Incorrect password"]);
            exit;
        }

        // Успішний вхід
        echo json_encode([
            "success" => true,
            "message" => "Welcome back, $username!",
            "profile" => [
                "fname" => $user["fname"],
                "lname" => $user["lname"],
                "username" => $user["username"]
            ]
        ]);

    } elseif ($action === 'register') {
        $username = $_POST['usernameR'];
        $password = $_POST['passwordR'];
        $fname = $_POST['fnameR'];
        $lname = $_POST['lnameR'];

        // Валідація
        if (empty($username) || empty($password) || empty($fname) || empty($lname)) {
            http_response_code(400);
            echo json_encode(["error" => "All fields are required"]);
            exit;
        }

        // Перевірка, чи username вже існує
        $query = "SELECT COUNT(*) FROM users WHERE username = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute([$username]);
        $count = $stmt->fetchColumn();

        if ($count > 0) {
            echo json_encode(["alreadyExists" => true, "message" => "Username is already taken"]);
            exit;
        }

        // Хешуємо пароль
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        // Вставка нового користувача
        $stmt = $pdo->prepare("INSERT INTO users (username, password, fname, lname) VALUES (?, ?, ?, ?)");
        $stmt->execute([$username, $hashedPassword, $fname, $lname]);

        // Успішний вхід
        echo json_encode([
            "success" => true,
            "message" => "Welcome back, $username!",
            "profile" => [
                "fname" => $fname,
                "lname" => $lname,
                "username" => $username
            ]
        ]);
    }
} catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
?>
