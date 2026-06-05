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

try {
    // Cleanup only read notifications and read_at <= NOW() - 3 days. Never delete unread notifications.
    $cleanup = $db->prepare("DELETE FROM notifications WHERE user_id = ? AND is_read = 1 AND read_at <= (NOW() - INTERVAL 3 DAY)");
    $cleanup->execute([$user['id']]);
    
    http_response_code(200);
    echo json_encode(["message" => "Read notifications older than 3 days cleared successfully."]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["message" => "Cleanup failed: " . $e->getMessage()]);
}
?>
