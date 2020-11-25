<?php

require __DIR__ . '/vendor/autoload.php';

$router = new \Bramus\Router\Router();

header("Access-Control-Allow-Origin: *");

$router->options('/.*', function () {
    header("Access-Control-Allow-Headers: Authorization, Content-Type");
    header("Access-Control-Allow-Methods: GET, HEAD, PUT, PATCH, POST, DELETE");
});

$router->get('/api', function () {
    http_response_code(200);
    echo 'Kraaken API';
    exit(0);
});

$router->post('/api/{levelId}', function ($levelId) {
    $path = __DIR__ . '/levels/' . $levelId . '/level.json';

    if (!file_exists($path)) {
        http_response_code(404);
        echo 'Could not find level "' . $levelId . '"';
        exit(0);
    }

    $input = file_get_contents('php://input');

    // verify json data validity
    $data = json_decode($input);
    if (is_null($data)) {
        http_response_code(400);
        echo 'Could not save level "' . $levelId . '" data';
        exit(0);
    }

    $handle = fopen($path, "w");
    fwrite($handle, json_encode($data, JSON_PRETTY_PRINT));

    http_response_code(200);
    exit(0);
});

$router->run();
