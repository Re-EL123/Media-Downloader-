<?php
// api.php
error_reporting(E_ERROR);
header('Content-Type: application/json; charset=utf-8');

$in = json_decode(file_get_contents('php://input'), true);
if (empty($in['url'])) {
    echo json_encode(['error'=>true, 'message'=>'No URL provided']);
    exit;
}

$url    = $in['url'];
$apiKey = '82ae10db11mshb41ccacdd991130p108a22jsnf3ae22b94bbd';
$host   = 'netsnatcher-api.p.rapidapi.com';

$payload = json_encode(['url'=>$url]);

$ch = curl_init("https://{$host}/download");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => [
        "Content-Type: application/json",
        "x-rapidapi-key: {$apiKey}",
        "x-rapidapi-host: {$host}"
    ],
]);

$response = curl_exec($ch);
$curlErr  = curl_error($ch);
curl_close($ch);

if ($curlErr) {
    echo json_encode(['error'=>true, 'message'=>'cURL Error: '.$curlErr]);
    exit;
}

$decoded = json_decode($response, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error'=>true, 'message'=>'Invalid JSON from API','raw'=>$response]);
    exit;
}

echo json_encode($decoded);
