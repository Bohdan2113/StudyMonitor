<?php
require_once __DIR__ . '/../Models/user.php';
require_once __DIR__ . '/../db.php';
header('Content-Type: application/json');

class UserController {
    public function Login($data) {
        $db = new Database();
        $pdo = $db->connect();

        $userModel = new User($pdo);
        $isValid = $this->ValidateLogin($data);
        if (!$isValid['ok']) 
            return array_merge($isValid['error'], ["success" => false]);

            $username = $data["usernameL"];
            $password = $data["passwordL"];
    
            $user = $userModel->findByUsername($username);
            if (!$user)
                return ["badLogin" => true, "message" => "Username is undefined", "success" => false];
    
            if (!$userModel->verifyPassword($password, $user["password"]))
                return ["badPassword" => true, "message" => "Incorrect password", "success" => false];
    
            return [
                "success" => true,
                "message" => "Welcome back, $username!",
                "profile" => [
                    "fname" => $user["fname"],
                    "lname" => $user["lname"],
                    "username" => $username
                ]
                ];
    }
    public function Signin($data) {
        $db = new Database();
        $pdo = $db->connect();
        $userModel = new User($pdo);

        $validation = $this->ValidateSignin($data);
        if (!$validation['ok']) {
            return array_merge($validation['error'], ["success" => false]);
        }

        $username = $data['usernameR'];
        $fname = $data['fnameR'];
        $lname = $data['lnameR'];

        if ($userModel->usernameExists($username)) {
            return ["alreadyExists" => true, "message" => "Username is already taken", "success" => false];
        }
        $userModel->register($data);

        return [
            "success" => true,
            "message" => "Welcome back, $username!",
            "profile" => [
                "fname" => $fname,
                "lname" => $lname,
                "username" => $username
            ]
        ];
    }

    private function ValidateLogin($data) {
        $isEmpty = $this->IsEmptyLogin($data);
        if (!$isEmpty['ok']) {
            return $isEmpty;
        }

        $isBeyondMaxVal = $this->IsBeyondMaxValLogin($data);
        if (!$isBeyondMaxVal['ok']) {
            return $isBeyondMaxVal;
        }

        return ["ok" => true];
    }
    private function IsEmptyLogin($data) {
        if (empty($data['usernameL']) || empty($data['passwordL'])) {
            http_response_code(400);
            return ["ok" => false, "error" => ["error" => "All fields are required"]];
        }
        
        return ["ok" => true];
    }
    private function IsBeyondMaxValLogin($data) {
        if (mb_strlen($data['usernameL']) > 50) {
            http_response_code(400);
            return ["ok" => false, "error" => ["field" => "usernameL", "max" => 50]];
        }
        if (mb_strlen($data['passwordL']) > 255) {
            http_response_code(400);
            return ["ok" => false, "error" => ["field" => "passwordL", "max" => 255]];
        }
        
        return ["ok" => true];
    }

    private function ValidateSignin($data) {
        $fields = [
            'usernameR' => 50,
            'passwordR' => 255,
            'fnameR' => 100,
            'lnameR' => 100
        ];

        foreach ($fields as $field => $maxLength) {
            if (empty($data[$field])) {
                return ['ok' => false, 'error' => ['error' => "All fields are required", "field" => $field]];
            }
            if (mb_strlen($data[$field]) > $maxLength) {
                return ['ok' => false, 'error' => ['field' => $field, 'max' => $maxLength]];
            }
        }

        return ['ok' => true];
    }
}
