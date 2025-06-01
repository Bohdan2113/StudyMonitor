<?php
header('Content-Type: application/json'); // Повідомляємо клієнту, що відповідь буде у форматі JSON

// Налаштування
$uploadDir = 'C:/xampp/htdocs/StudyMonitor/uploads/'; // Директорія для завантажень, відносно поточного скрипта
                                    // __DIR__ дає повний шлях до папки, де лежить upload_avatar.php
                                    // Переконайтеся, що папка 'uploads' існує і має права на запис!

$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$maxFileSize = 5 * 1024 * 1024; // 5 MB

$response = ['success' => false, 'message' => '', 'imageURL' => ''];

// Перевірка, чи папка для завантажень існує і доступна для запису
// if (!is_dir($uploadDir)) {
//     // Спроба створити папку, якщо її немає
//     if (!mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) { // 0775 дає права власнику і групі, та читання для інших
//         $response['message'] = 'Upload directory does not exist and could not be created.';
//         echo json_encode($response);
//         exit;
//     }
// }
// if (!is_writable($uploadDir)) {
//     $response['message'] = 'Upload directory is not writable.';
//     // Спробуйте змінити права на папку uploads через файловий менеджер або chmod
//     error_log("PHP Upload Error: Directory {$uploadDir} is not writable. Check permissions.");
//     echo json_encode($response);
//     exit;
// }


if (isset($_FILES['avatarFile']) && $_FILES['avatarFile']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['avatarFile'];

    // Перевірка типу файлу
    $fileType = mime_content_type($file['tmp_name']); // Більш надійний спосіб визначення типу
    if (!in_array($fileType, $allowedTypes)) {
        $response['message'] = 'Invalid file type. Only JPG, PNG, GIF, WEBP are allowed.';
        echo json_encode($response);
        exit;
    }

    // Перевірка розміру файлу
    if ($file['size'] > $maxFileSize) {
        $response['message'] = 'File is too large. Maximum size is ' . ($maxFileSize / 1024 / 1024) . ' MB.';
        echo json_encode($response);
        exit;
    }

    // Генерація унікального імені файлу, щоб уникнути перезапису
    $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $newFileName = uniqid('avatar_', true) . '.' . $fileExtension;
    $uploadFilePath = $uploadDir . $newFileName;

    if (move_uploaded_file($file['tmp_name'], $uploadFilePath)) {
        // Визначення URL для доступу до файлу через веб
        // Це залежить від структури вашого проекту в htdocs
        // Якщо upload_avatar.php і папка uploads знаходяться в корені htdocs:
        // $imageURL = '/uploads/' . $newFileName;
        // Якщо вони в підпапці, наприклад, 'my_project':
        // $imageURL = '/my_project/uploads/' . $newFileName;

        // Більш динамічний спосіб визначити базовий URL, якщо скрипт не в корені htdocs
        $scriptDir = str_replace($_SERVER['DOCUMENT_ROOT'], '', __DIR__); // Шлях відносно htdocs
        $imageURL = 'StudyMonitor/uploads/' . $newFileName;
        
        // Переконайтеся, що URL починається з /
        if (strpos($imageURL, '/') !== 0) {
            $imageURL = '/' . $imageURL;
        }
        // Якщо XAMPP працює на нестандартному порту, або ви хочете повний URL:
        // $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
        // $host = $_SERVER['HTTP_HOST'];
        // $imageURL = $protocol . $host . $scriptDir . '/uploads/' . $newFileName;


        $response['success'] = true;
        $response['message'] = 'Avatar uploaded successfully!';
        $response['imageURL'] = $imageURL; // Надсилаємо URL назад клієнту
    } else {
        $response['message'] = 'Failed to move uploaded file. Check server logs.';
        error_log("PHP Upload Error: Failed to move '{$file['tmp_name']}' to '{$uploadFilePath}'. Last PHP error: " . print_r(error_get_last(), true));

    }
} elseif (isset($_FILES['avatarFile']['error'])) {
    switch ($_FILES['avatarFile']['error']) {
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            $response['message'] = 'File is too large (exceeded server/form limit).';
            break;
        case UPLOAD_ERR_PARTIAL:
            $response['message'] = 'File was only partially uploaded.';
            break;
        case UPLOAD_ERR_NO_FILE:
            $response['message'] = 'No file was uploaded.';
            break;
        case UPLOAD_ERR_NO_TMP_DIR:
            $response['message'] = 'Missing a temporary folder for uploads.';
            break;
        case UPLOAD_ERR_CANT_WRITE:
            $response['message'] = 'Failed to write file to disk.';
            break;
        case UPLOAD_ERR_EXTENSION:
            $response['message'] = 'A PHP extension stopped the file upload.';
            break;
        default:
            $response['message'] = 'Unknown upload error.';
            break;
    }
} else {
    $response['message'] = 'No file data received. Ensure the form field name is "avatarFile".';
}

echo json_encode($response);
?>