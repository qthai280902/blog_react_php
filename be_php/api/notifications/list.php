<?php
include_once '../../config/database.php';
include_once '../auth/token_helper.php';
include_once '../../config/id_helper.php';

$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized"]);
    exit();
}

$database = new Database();
$db = $database->getConnection();

// --- AUTOMATIC CLEANUP ---
// Cleanup only read notifications and read_at <= NOW() - 3 days. Never delete unread notifications.
try {
    $cleanup = $db->prepare("DELETE FROM notifications WHERE user_id = ? AND is_read = 1 AND read_at <= (NOW() - INTERVAL 3 DAY)");
    $cleanup->execute([$user['id']]);
} catch (Exception $e) {
    // Fail silently on cleanup to avoid breaking the list response
}

// --- FETCH NOTIFICATIONS ---
$query = "SELECT 
            n.id, 
            n.user_id, 
            n.actor_id, 
            n.post_id, 
            n.comment_id, 
            n.type, 
            n.message, 
            n.is_read, 
            n.read_at, 
            n.created_at,
            u.username as actor_name,
            u.avatar_image as actor_avatar,
            p.title as post_title
          FROM notifications n
          INNER JOIN users u ON n.actor_id = u.id
          LEFT JOIN posts p ON n.post_id = p.id
          WHERE n.user_id = ?
          ORDER BY n.created_at DESC";

$stmt = $db->prepare($query);
$stmt->execute([$user['id']]);
$notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($notifications as &$n) {
    $n['id'] = (int)$n['id'];
    $n['is_read'] = (int)$n['is_read'];
    $n['post_id'] = $n['post_id'] ? (int)$n['post_id'] : null;
    $n['actor_uid'] = encodeId($n['actor_id']);
}

http_response_code(200);
echo json_encode([
    "status" => "success",
    "data" => $notifications
]);
?>
