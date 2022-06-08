<?php

$input = file_get_contents('php://input');
$json = json_decode($input, true);
file_put_contents("../data/webm/{$json['id']}_{$json['point_type']}_{$json['x']}_{$json['y']}.webm", base64_decode($json['response']));

?>