<?php
header('Content-Type: application/json');

$body = json_decode(file_get_contents('php://input'), true);
if (empty($body['url'])) {
  echo json_encode(['error'=>true, 'message'=>'No URL provided']);
  exit;
}

$url = $body['url'];
$apiKey = '82ae10db11mshb41ccacdd991130p108a22jsnf3ae22b94bbd';
$host   = 'netsnatcher-api.p.rapidapi.com';

// Build POST payload
$payload = json_encode([
  'url'    => $url,
  // omit format/quality to let API decide defaults,
  // or you can pass 'format'=>'mp4','quality'=>'high'
]);

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
if (curl_errno($ch)) {
  echo json_encode(['error'=>true, 'message'=>curl_error($ch)]);
  curl_close($ch);
  exit;
}
curl_close($ch);

// proxy back
echo $response;
