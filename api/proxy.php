<?php
declare(strict_types=1);
// Stronger error handling
error_reporting(E_ALL);
ini_set('display_errors', '0');
ini_set('log_errors', '1');
ini_set('error_log', __DIR__ . '/proxy_error.log');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

$ALLOWED_ACTIONS = ['PARSE_COMPANY_DIRECT', 'PARSE_REVIEWS_DIRECT'];
$EXTERNAL = 'http://217.114.4.16/seleniumParser/direct_parser.php';

$action = $_GET['ACTION'] ?? '';
$companyId = $_GET['COMPANY_ID'] ?? '';

// Quick self-test
if (isset($_GET['TEST']) && $_GET['TEST'] === '1') {
  echo json_encode(['status'=>'success','data'=>['ok'=>true,'ts'=>time()]], JSON_UNESCAPED_UNICODE);
  exit;
}

if (!in_array($action, $ALLOWED_ACTIONS, true) || $companyId === '') {
  http_response_code(400);
  echo json_encode(['status'=>'error','message'=>'Bad params'], JSON_UNESCAPED_UNICODE);
  exit;
}

$opts = [
  'http' => [
    'method' => 'GET',
    'timeout' => 30,
    'header' => "Accept: application/json
User-Agent: YandexReviewsSlider/1.0
",
    'ignore_errors' => true,
  ]
];
$ctx = stream_context_create($opts);
$url = $EXTERNAL . '?' . http_build_query(['ACTION'=>$action,'COMPANY_ID'=>$companyId], '', '&');

$body = @file_get_contents($url, false, $ctx);
$code = 200;
if (isset($http_response_header) && preg_match('~HTTP/\d+\.\d+\s+(\d{3})~', $http_response_header[0], $m)) {
  $code = (int)$m[1];
}

if ($body === false) {
  http_response_code(502);
  echo json_encode(['status'=>'error','message'=>'Upstream not reachable'], JSON_UNESCAPED_UNICODE);
  exit;
}

// Ensure JSON
$trim = ltrim($body);
$startsJson = strlen($trim) && ($trim[0] === '{' || $trim[0] === '[');

if ($code >= 400 || !$startsJson) {
  http_response_code(502);
  echo json_encode([
    'status' => 'error',
    'message' => $code >= 400 ? 'Upstream HTTP ' . $code : 'Upstream returned non-JSON',
    'upstream_preview' => mb_substr($trim, 0, 400, 'UTF-8')
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// Pass-through upstream JSON as-is
echo $body;
