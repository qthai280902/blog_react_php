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

// Mark all as read
$upd = $db->prepare("UPDATE notifications SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0");
$upd->execute([$user['id']]);

http_response_code(200);
echo json_encode(["message" => "All notifications marked as read."]);
?>
