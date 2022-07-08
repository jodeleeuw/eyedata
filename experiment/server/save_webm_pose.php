<?php

$input = file_get_contents('php://input');
$json = json_decode($input, true);
file_put_contents("../data/webm_pose/{$json['id']}_pose.webm", base64_decode($json['response']));

?>