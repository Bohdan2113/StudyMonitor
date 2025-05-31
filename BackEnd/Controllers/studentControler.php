<?php
require_once __DIR__ . '/../Models/student.php';
require_once __DIR__ . '/../db.php';
header('Content-Type: application/json');

class StudentController {
    public function readAll() {
        $db = new Database();
        $pdo = $db->connect();

        $studentModel = new Student($pdo);
        $students = $studentModel->getAll();

        return $students;
    }
    public function addStudent($student) {
        $db = new Database();
        $pdo = $db->connect();

        $studentModel = new Student($pdo);
        $isValid = $this->ValidateData($student);
        $isDublicat = $this->IsDublicat($studentModel, $student);
        if (!$isValid['ok']) 
            return array_merge($isValid['error'], ["success" => false]);
        if (!$isDublicat['ok']) 
            return array_merge($isDublicat['error'], ["success" => false]);

        $studentModel->insert($student);

        return  ["success" => true, "message" => "Student added"];
    }
    public function updateStudent($student) {
        $db = new Database();
        $pdo = $db->connect();

        $studentModel = new Student($pdo);
        $isValid = $this->ValidateData($student);
        $isDublicat = $this->IsDublicat($studentModel, $student);
        if (!$isValid['ok']) 
            return array_merge($isValid['error'], ["success" => false]);
        if (!$isDublicat['ok']) 
            return array_merge($isDublicat['error'], ["success" => false]);

        $studentModel->update($student);

        return  ["success" => true, "message" => "Student updated"];
    }
    public function deleteStudents($students) {
        $ids = $students['ids'] ?? [];
        if (empty($ids) || !is_array($ids)) {
            http_response_code(400);
            return ["success" => false, "error" => "Invalid or empty ID list"];
        }

        $db = new Database();
        $pdo = $db->connect();
        $studentModel = new Student($pdo);
        $studentModel->deleteMany($ids);

        return ["success" => true, "message" => "Students has been deleted successfully"];
    }

    private function ValidateData($data) {
        $isEmpty = $this->IsEmpty($data);
        if (!$isEmpty['ok']) {
            return $isEmpty;
        }

        $isBeyondMaxVal = $this->IsBeyondMaxVal($data);
        if (!$isBeyondMaxVal['ok']) {
            return $isBeyondMaxVal;
        }

        $isDateOk = $this->IsDateOk($data);
        if (!$isDateOk['ok']) {
            return $isDateOk;
        }

        return ["ok" => true];
    }
    private function IsDublicat($studentModel, $data) {
        $exists = $studentModel->getCount($data);

        if ($exists > 0) {
            http_response_code(409);
            return ["ok" => false, "error" => ["error" => "Such student already exists"]];
            exit;
        }
        
        return ["ok" => true];
    }
    private function IsEmpty($data) {
        if (empty($data['group_name']) || empty($data['fname']) ||
            empty($data['lname']) || empty($data['gender']) || 
            empty($data['bdate']) || empty($data['status'])) 
        {
            http_response_code(400);
            return ["ok" => false, "error" => ["error" => "All fields are required"]];
        }
        
        return ["ok" => true];
    }
    private function IsBeyondMaxVal($data) {
        if (mb_strlen($data['group_name']) > 50) {
            http_response_code(400);
            return ["ok" => false, "error"=>["field" => "group", "max" => 50]];
        }
        if (mb_strlen($data['gender']) > 50) {
            http_response_code(400);
            return ["ok" => false, "error"=>["field" => "gender", "max" => 50]];
        }
        if (mb_strlen($data['fname']) > 100) {
            http_response_code(400);
            return ["ok" => false, "error"=>["field" => "fname", "max" => 100]];
        }
        if (mb_strlen($data['lname']) > 100) {
            http_response_code(400);
            return ["ok" => false, "error"=>["field" => "lname", "max" => 100]];
        }
        
        return ["ok" => true];
    }
    private function IsDateOk($data) {
        $date = DateTime::createFromFormat('Y-m-d', $data['bdate']);
        if (!$date || $date->format('Y-m-d') !== $data['bdate']) {
            http_response_code(400);
            return ["ok" => false, "error"=>["field" => "bdate", "error" => "Invalid birthdate format"]];
        }
        
        return ["ok" => true];
    }
}
