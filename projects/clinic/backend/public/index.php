<?php

declare(strict_types=1);

// Front controller: every /api/... request goes through here (see .htaccess or the nginx example in the README).

use Clinic\App;
use Clinic\Db;
use Clinic\Request;
use Clinic\Response;
use Clinic\Seed;

require __DIR__ . '/../src/bootstrap.php';

$db = Db::connect(getenv('DATABASE_URL') ?: 'mysql://root:@127.0.0.1:3306/clinic');
$db->migrate();
if (!$db->value('SELECT 1 FROM practitioners LIMIT 1')) {
    Seed::run($db);
}

// The API is used by the web front end, possibly from another origin
header('Access-Control-Allow-Origin: ' . (getenv('ALLOWED_ORIGIN') ?: '*'));
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $request = Request::fromGlobals();
} catch (Clinic\HttpError $e) {
    Response::json(['error' => $e->getMessage()], $e->status)->send();
    exit;
}
(new App($db, getenv('APP_SECRET') ?: 'dev-only-secret-change-me'))->handle($request)->send();
