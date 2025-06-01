<?php
class User {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAll() {
        $stmt = $this->pdo->query("SELECT username, fname, lname, imageURL FROM users");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function update($user) {
        $query = "UPDATE users SET 
        fname = :fname,
        lname = :lname,
        imageURL = :imageURL
        WHERE username = :username";

        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':fname', $user['fname']);
        $stmt->bindParam(':lname', $user['lname']);
        $stmt->bindParam(':imageURL', $user['imageURL']);
        $stmt->bindParam(':username', $user['username']);
        $stmt->execute();
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
        $imageURL = $user['imageURL'];

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("INSERT INTO users (username, password, fname, lname, imageURL) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$username, $hashedPassword, $fname, $lname, $imageURL]);
        return true;
    }
}
