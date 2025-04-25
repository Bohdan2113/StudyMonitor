<?php
class User {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function findByUsername($username) {
        $query = "SELECT * FROM users WHERE username = ?";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute([$username]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    public function verifyPassword($inputPassword, $hashedPassword) {
        return password_verify($inputPassword, $hashedPassword);
    }

   public function usernameExists($username) {
    $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
    $stmt->execute([$username]);
    return $stmt->fetchColumn() > 0;
}
    public function register($user) {
        $username = $user['usernameR'];
        $password = $user['passwordR'];
        $fname = $user['fnameR'];
        $lname = $user['lnameR'];

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("INSERT INTO users (username, password, fname, lname) VALUES (?, ?, ?, ?)");
        $stmt->execute([$username, $hashedPassword, $fname, $lname]);
        return true;
    }
}
