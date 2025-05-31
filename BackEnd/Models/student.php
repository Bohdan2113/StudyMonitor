<?php
class Student {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function getAll() {
        $stmt = $this->pdo->query("SELECT * FROM students");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    public function insert($student) {
        $query = "INSERT INTO students (id, group_name, fname, lname, gender, bdate, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute([
            $student['id'],
            $student['group_name'] ?? '',
            $student['fname'] ?? '',
            $student['lname'] ?? '',
            $student['gender'] ?? '',
            $student['bdate'] ?? '',
            $student['status'] ?? ''
        ]);
    }
    public function update($student) {
        $query = "UPDATE students SET 
        group_name = :group_name,
        fname = :fname,
        lname = :lname,
        gender = :gender,
        bdate = :bdate,
        status = :status
        WHERE id = :id";

        $stmt = $this->pdo->prepare($query);
        $stmt->bindParam(':group_name', $student['group_name']);
        $stmt->bindParam(':fname', $student['fname']);
        $stmt->bindParam(':lname', $student['lname']);
        $stmt->bindParam(':gender', $student['gender']);
        $stmt->bindParam(':bdate', $student['bdate']);
        $stmt->bindParam(':status', $student['status']);
        $stmt->bindParam(':id', $student['id'], PDO::PARAM_INT);
        $stmt->execute();
    }
    public function deleteMany($ids) {
        // Створюємо плейсхолдери для підготовки запиту (наприклад: :id0, :id1, ...)
        $placeholders = [];
        $params = [];

        foreach ($ids as $index => $id) {
            $key = ":id$index";
            $placeholders[] = $key;
            $params[$key] = $id;
        }

        $query = "DELETE FROM students WHERE id IN (" . implode(",", $placeholders) . ")";
        $stmt = $this->pdo->prepare($query);
        $stmt->execute($params);
    }
    public function getCount($student) {
        $checkQuery = "SELECT COUNT(*) FROM students WHERE group_name = ? AND fname = ? AND lname = ? AND gender = ? AND bdate = ?";
        $checkStmt = $this->pdo->prepare($checkQuery);
        $checkStmt->execute([
            $student['group_name'],
            $student['fname'],
            $student['lname'],
            $student['gender'],
            $student['bdate']
        ]);
        $count = $checkStmt->fetchColumn();
        return $count;
    }
}
