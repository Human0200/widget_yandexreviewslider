<?php
declare(strict_types=1);
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/proxy_error.log');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: *');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// Конфигурация БД
define('DB_HOST', 'v90860qz.beget.tech');
define('DB_NAME', 'v90860qz_widget');
define('DB_USER', 'v90860qz_widget');
define('DB_PASS', '5B%uhQfSgMXg');
define('DB_CHARSET', 'utf8mb4');

// Настройки кеширования (в секундах) - 24 часа
define('CACHE_TTL_COMPANY', 86400); // 24 часа для данных компании
define('CACHE_TTL_REVIEWS', 86400); // 24 часа для отзывов

$ALLOWED_ACTIONS = ['PARSE_COMPANY_DIRECT', 'PARSE_REVIEWS_DIRECT'];
$EXTERNAL = 'http://217.114.4.16/seleniumParser/direct_parser.php';

$action = $_GET['ACTION'] ?? '';
$companyId = $_GET['COMPANY_ID'] ?? '';

// Тестовый endpoint
if (isset($_GET['TEST']) && $_GET['TEST'] === '1') {
  echo json_encode(['status'=>'success','data'=>['ok'=>true,'ts'=>time()]], JSON_UNESCAPED_UNICODE);
  exit;
}

if (!in_array($action, $ALLOWED_ACTIONS, true) || $companyId === '') {
  http_response_code(400);
  echo json_encode(['status'=>'error','message'=>'Bad params'], JSON_UNESCAPED_UNICODE);
  exit;
}

// Функция для подключения к БД
function getDBConnection() {
    static $pdo = null;
    
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            error_log("DB Connection failed: " . $e->getMessage());
            return null;
        }
    }
    
    return $pdo;
}

// Функция для получения данных компании из БД
function getCompanyFromDB($companyId) {
    $pdo = getDBConnection();
    if (!$pdo) return null;
    
    try {
        $stmt = $pdo->prepare("
            SELECT name, rating, reviews_count, last_updated 
            FROM companies 
            WHERE company_id = ? AND last_updated > DATE_SUB(NOW(), INTERVAL ? SECOND)
        ");
        $stmt->execute([$companyId, CACHE_TTL_COMPANY]);
        
        return $stmt->fetch();
    } catch (PDOException $e) {
        error_log("DB Error getCompany: " . $e->getMessage());
        return null;
    }
}

// Функция для сохранения компании в БД
function saveCompanyToDB($companyId, $name, $rating, $reviewsCount) {
    $pdo = getDBConnection();
    if (!$pdo) return false;
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO companies (company_id, name, rating, reviews_count) 
            VALUES (?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
            name = VALUES(name), 
            rating = VALUES(rating), 
            reviews_count = VALUES(reviews_count),
            last_updated = CURRENT_TIMESTAMP
        ");
        
        return $stmt->execute([$companyId, $name, $rating, $reviewsCount]);
    } catch (PDOException $e) {
        error_log("DB Error saveCompany: " . $e->getMessage());
        return false;
    }
}

// Функция для получения отзывов из БД
function getReviewsFromDB($companyId) {
    $pdo = getDBConnection();
    if (!$pdo) return null;
    
    try {
        $stmt = $pdo->prepare("
            SELECT r.*, c.last_updated 
            FROM reviews r 
            JOIN companies c ON r.company_id = c.company_id 
            WHERE r.company_id = ? AND c.last_updated > DATE_SUB(NOW(), INTERVAL ? SECOND)
            ORDER BY r.timestamp DESC
        ");
        $stmt->execute([$companyId, CACHE_TTL_REVIEWS]);
        
        return $stmt->fetchAll();
    } catch (PDOException $e) {
        error_log("DB Error getReviews: " . $e->getMessage());
        return null;
    }
}

// Функция для сохранения отзывов в БД
function saveReviewsToDB($companyId, $reviews) {
    $pdo = getDBConnection();
    if (!$pdo) return false;
    
    try {
        $pdo->beginTransaction();
        
        // Удаляем старые отзывы для этой компании
        $deleteStmt = $pdo->prepare("DELETE FROM reviews WHERE company_id = ?");
        $deleteStmt->execute([$companyId]);
        
        // Вставляем новые отзывы
        $insertStmt = $pdo->prepare("
            INSERT INTO reviews (company_id, review_id, author_name, author_avatar, rating, review_text, review_date, timestamp) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($reviews as $review) {
            $insertStmt->execute([
                $companyId,
                $review['review_id'] ?? md5($companyId . $review['timestamp'] . $review['name']),
                $review['name'],
                $review['image'] ?? '',
                $review['rating'],
                $review['text'],
                $review['date'],
                $review['timestamp']
            ]);
        }
        
        $pdo->commit();
        return true;
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("DB Error saveReviews: " . $e->getMessage());
        return false;
    }
}

// Функция для запроса к внешнему парсеру
function fetchFromParser($action, $companyId) {
    $opts = [
        'http' => [
            'method' => 'GET',
            'timeout' => 30,
            'header' => "Accept: application/json\r\nUser-Agent: YandexReviewsSlider/1.0\r\n",
            'ignore_errors' => true,
        ]
    ];
    
    $ctx = stream_context_create($opts);
    $url = $GLOBALS['EXTERNAL'] . '?' . http_build_query(['ACTION'=>$action,'COMPANY_ID'=>$companyId], '', '&');
    $body = @file_get_contents($url, false, $ctx);
    
    $code = 200;
    if (isset($http_response_header) && preg_match('~HTTP/\d+\.\d+\s+(\d{3})~', $http_response_header[0], $m)) {
        $code = (int)$m[1];
    }
    
    if ($body === false) {
        return ['error' => 'Upstream not reachable'];
    }
    
    $trim = ltrim($body);
    $startsJson = strlen($trim) && ($trim[0] === '{' || $trim[0] === '[');
    
    if ($code >= 400 || !$startsJson) {
        return [
            'error' => $code >= 400 ? 'Upstream HTTP ' . $code : 'Upstream returned non-JSON',
            'preview' => mb_substr($trim, 0, 400, 'UTF-8')
        ];
    }
    
    return json_decode($body, true);
}

// Основная логика обработки запросов
try {
    if ($action === 'PARSE_COMPANY_DIRECT') {
        // Пытаемся получить данные из БД
        $cachedData = getCompanyFromDB($companyId);
        
        if ($cachedData) {
            // Возвращаем данные из кеша
            echo json_encode([
                'status' => 'success',
                'data' => [
                    'name' => $cachedData['name'],
                    'rating' => (float)$cachedData['rating'],
                    'reviews_count' => (int)$cachedData['reviews_count'],
                    'cached' => true
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        // Данных в кеше нет, запрашиваем у парсера
        $parserResult = fetchFromParser($action, $companyId);
        
        if (isset($parserResult['error'])) {
            http_response_code(502);
            echo json_encode([
                'status' => 'error',
                'message' => $parserResult['error'],
                'upstream_preview' => $parserResult['preview'] ?? ''
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        // Сохраняем в БД
        $companyData = $parserResult['data'] ?? $parserResult;
        if (isset($companyData['name']) && isset($companyData['rating']) && isset($companyData['reviews_count'])) {
            saveCompanyToDB(
                $companyId, 
                $companyData['name'], 
                $companyData['rating'], 
                $companyData['reviews_count']
            );
            
            $companyData['cached'] = false;
        }
        
        echo json_encode(['status' => 'success', 'data' => $companyData], JSON_UNESCAPED_UNICODE);
        
    } elseif ($action === 'PARSE_REVIEWS_DIRECT') {
        // Пытаемся получить отзывы из БД
        $cachedReviews = getReviewsFromDB($companyId);
        
        if ($cachedReviews && count($cachedReviews) > 0) {
            // Преобразуем данные из БД в нужный формат
            $reviewsData = array_map(function($review) {
                return [
                    'name' => $review['author_name'],
                    'image' => $review['author_avatar'],
                    'rating' => (int)$review['rating'],
                    'text' => $review['review_text'],
                    'date' => $review['review_date'],
                    'timestamp' => (int)$review['timestamp'],
                    'review_id' => $review['review_id']
                ];
            }, $cachedReviews);
            
            echo json_encode([
                'status' => 'success',
                'data' => [
                    'items' => $reviewsData,
                    'cached' => true
                ]
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        // Отзывов в кеше нет, запрашиваем у парсера
        $parserResult = fetchFromParser($action, $companyId);
        
        if (isset($parserResult['error'])) {
            http_response_code(502);
            echo json_encode([
                'status' => 'error',
                'message' => $parserResult['error'],
                'upstream_preview' => $parserResult['preview'] ?? ''
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        
        // Сохраняем отзывы в БД
        $reviewsData = $parserResult['data'] ?? $parserResult;
        $reviewsList = isset($reviewsData['items']) ? $reviewsData['items'] : $reviewsData;
        
        if (is_array($reviewsList) && count($reviewsList) > 0) {
            saveReviewsToDB($companyId, $reviewsList);
            $reviewsData['cached'] = false;
        }
        
        echo json_encode(['status' => 'success', 'data' => $reviewsData], JSON_UNESCAPED_UNICODE);
    }
    
} catch (Exception $e) {
    error_log("Proxy processing error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Internal server error'
    ], JSON_UNESCAPED_UNICODE);
}