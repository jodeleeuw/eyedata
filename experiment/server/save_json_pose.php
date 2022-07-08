<?php

$input = file_get_contents('php://input');
$json = json_decode($input, true);
file_put_contents("../data/json_pose/{$json['id']}.json", $json['data']);

?>