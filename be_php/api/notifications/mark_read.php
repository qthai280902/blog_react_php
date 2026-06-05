<?php
include_once '../../config/database.php';
include_once '../auth/token_helper.php';

$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit();
}

$database = new Database();
$db = $database->getConnection();
$data = json_decode(file_get_contents("php://input"));

$id = isset($data->id) ? (int)$data->id : 0;
if (!$id) {
    http_response_code(400);
    echo json_encode(["message" => "Missing notification ID."]);
    exit();
}

// Verify that this notification belongs to the authenticated user
$stmt = $db->prepare("SELECT user_id FROM notifications WHERE id = ?");
$stmt->execute([$id]);
$notification = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$notification) {
    http_response_code(404);
    echo json_encode(["message" => "Notification not found."]);
    exit();
}

if ($notification['user_id'] != $user['id']) {
    http_response_code(403);
    echo json_encode(["message" => "Access denied."]);
    exit();
}

// Mark as read
$upd = $db->prepare("UPDATE notifications SET is_read = 1, read_at = NOW() WHERE id = ? AND is_read = 0");
$upd->execute([$id]);

http_response_code(200);
echo json_encode(["message" => "Notification marked as read."]);
?>
