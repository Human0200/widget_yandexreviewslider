<?php
header('Content-Type: application/json');

// Подключение к базе данных
$host = 'v90860qz.beget.tech';
$dbname = 'v90860qz_leads';
$username = 'v90860qz_leads';
$password = '**rG2pUgnxVN';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка подключения: ' . $e->getMessage()]);
    exit;
}

// Получение JSON-данных из тела запроса
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['status' => 'error', 'message' => 'Некорректные данные']);
    exit;
}

$app_name = $input['app_name'] ?? null;
$FIO = $input['FIO'] ?? null;
$Phone = $input['Phone'] ?? null;
$tariff = $input['tariff'] ?? null;
$domain = $input['domain'] ?? null;
$email = $input['email'] ?? null;

if (!$FIO || !$Phone) {
    echo json_encode(['status' => 'error', 'message' => 'ФИО и телефон обязательны']);
    exit;
}

// Проверка на дубликат по телефону
try {
    $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM applications WHERE Phone = :Phone");
    $checkStmt->execute([':Phone' => $Phone]);
    $count = $checkStmt->fetchColumn();

    if ($count > 0) {
        echo json_encode(['status' => 'warning', 'message' => 'Заявка с таким телефоном уже существует']);
        exit;
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка проверки дубликата: ' . $e->getMessage()]);
    exit;
}

// Вставка новой записи
try {
    $stmt = $pdo->prepare("
        INSERT INTO applications (app_name, FIO, Phone, tariff, domain, email)
        VALUES (:app_name, :FIO, :Phone, :tariff, :domain, :email)
    ");

    $stmt->execute([
        ':app_name' => $app_name,
        ':FIO' => $FIO,
        ':Phone' => $Phone,
        ':tariff' => $tariff,
        ':domain' => $domain,
        ':email' => $email
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Данные успешно сохранены']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Ошибка сохранения: ' . $e->getMessage()]);
}
?>