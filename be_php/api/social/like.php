<?php

include_once '../../config/database.php';
include_once '../auth/token_helper.php';

$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(array("message" => "Vui lòng đăng nhập để thả tim."));
    exit();
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->post_id)) {
    http_response_code(400);
    echo json_encode(array("message" => "Thiếu ID bài viết."));
    exit();
}

// Kiểm tra xem đã like chưa
$check_query = "SELECT * FROM likes WHERE user_id = ? AND post_id = ?";
$stmt_check = $db->prepare($check_query);
$stmt_check->execute([$user['id'], $data->post_id]);

if ($stmt_check->rowCount() > 0) {
    // Đã like rồi -> Bỏ like (Unlike)
    $delete_query = "DELETE FROM likes WHERE user_id = ? AND post_id = ?";
    $stmt_del = $db->prepare($delete_query);
    $stmt_del->execute([$user['id'], $data->post_id]);
    $status = "unliked";
} else {
    // Chưa like -> Thêm like
    $insert_query = "INSERT INTO likes (user_id, post_id) VALUES (?, ?)";
    $stmt_ins = $db->prepare($insert_query);
    $stmt_ins->execute([$user['id'], $data->post_id]);
    $status = "liked";
}

// --- TRIGGER NOTIFICATION ---
if ($status === "liked") {
    try {
        // Find post owner
        $post_stmt = $db->prepare("SELECT user_id FROM posts WHERE id = ?");
        $post_stmt->execute([$data->post_id]);
        $post_info = $post_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($post_info && (int)$post_info['user_id'] !== (int)$user['id']) {
            $post_owner_id = (int)$post_info['user_id'];
            
            // Check if notification already exists to avoid duplicate spam
            $check_notif = $db->prepare("SELECT id FROM notifications WHERE user_id = ? AND actor_id = ? AND post_id = ? AND type = 'like'");
            $check_notif->execute([$post_owner_id, $user['id'], $data->post_id]);
            $existing = $check_notif->fetch(PDO::FETCH_ASSOC);
            
            if ($existing) {
                // Update existing notification to mark as unread and update timestamp
                $upd_notif = $db->prepare("UPDATE notifications SET is_read = 0, created_at = NOW(), read_at = NULL WHERE id = ?");
                $upd_notif->execute([$existing['id']]);
            } else {
                // Insert new notification
                $ins_notif = $db->prepare("INSERT INTO notifications (user_id, actor_id, post_id, type, message) VALUES (?, ?, ?, 'like', ?)");
                $ins_notif->execute([
                    $post_owner_id,
                    $user['id'],
                    $data->post_id,
                    "đã thích bài viết của bạn"
                ]);
            }
        }
    } catch (Exception $e) {
        // Fail silently
    }
}

// Đếm tổng số like mới của bài viết
$count_query = "SELECT COUNT(*) as total FROM likes WHERE post_id = ?";
$stmt_count = $db->prepare($count_query);
$stmt_count->execute([$data->post_id]);
$total_likes = $stmt_count->fetch(PDO::FETCH_ASSOC)['total'];

http_response_code(200);
echo json_encode(array(
    "status" => $status,
    "total_likes" => $total_likes
));
?>
