<?php

include_once '../../config/database.php';
include_once '../auth/token_helper.php';
include_once '../../config/id_helper.php';

$user = get_auth_user();
if (!$user) {
    http_response_code(401);
    echo json_encode(array("message" => "Vui lòng đăng nhập để bình luận."));
    exit();
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (empty($data->post_id) || empty($data->content)) {
    http_response_code(400);
    echo json_encode(array("message" => "Thiếu thông tin bình luận."));
    exit();
}

$parent_id = isset($data->parent_id) ? (int)$data->parent_id : null;

// Validate parent comment if provided
if ($parent_id) {
    $parent_stmt = $db->prepare("SELECT post_id, parent_id FROM comments WHERE id = ?");
    $parent_stmt->execute([$parent_id]);
    $parent_comment = $parent_stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$parent_comment) {
        http_response_code(400);
        echo json_encode(array("message" => "Bình luận cha không tồn tại."));
        exit();
    }
    
    if ((int)$parent_comment['post_id'] !== (int)$data->post_id) {
        http_response_code(400);
        echo json_encode(array("message" => "Bình luận cha không thuộc bài viết này."));
        exit();
    }
    
    // Flatten reply nesting to 1-level: if parent already is a reply, redirect new reply to the top parent
    if ($parent_comment['parent_id'] !== null) {
        $parent_id = (int)$parent_comment['parent_id'];
    }
}

$query = "INSERT INTO comments (user_id, post_id, content, parent_id) VALUES (?, ?, ?, ?)";
$stmt = $db->prepare($query);

// Retrieve user_id from token
if ($stmt->execute([$user['id'], $data->post_id, $data->content, $parent_id])) {
    $comment_id = (int)$db->lastInsertId();
    
    // --- TRIGGER NOTIFICATION ---
    try {
        // Find post owner
        $post_owner_stmt = $db->prepare("SELECT user_id, title FROM posts WHERE id = ?");
        $post_owner_stmt->execute([$data->post_id]);
        $post_info = $post_owner_stmt->fetch(PDO::FETCH_ASSOC);

        if ($post_info) {
            $post_owner_id = (int)$post_info['user_id'];
            
            // Case 1: Reply comment
            if ($parent_id) {
                // Find parent comment owner
                $parent_comment_stmt = $db->prepare("SELECT user_id FROM comments WHERE id = ?");
                $parent_comment_stmt->execute([$data->parent_id]);
                $parent_comment_info = $parent_comment_stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($parent_comment_info) {
                    $parent_comment_owner_id = (int)$parent_comment_info['user_id'];
                    
                    // Notify parent comment owner if not self
                    if ($parent_comment_owner_id !== (int)$user['id']) {
                        $notif_stmt = $db->prepare("INSERT INTO notifications (user_id, actor_id, post_id, comment_id, type, message) VALUES (?, ?, ?, ?, 'reply', ?)");
                        $notif_stmt->execute([
                            $parent_comment_owner_id,
                            $user['id'],
                            $data->post_id,
                            $comment_id,
                            "đã phản hồi bình luận của bạn"
                        ]);
                    }
                    
                    // If post owner is different from parent comment owner AND not self, notify post owner as well
                    if ($post_owner_id !== $parent_comment_owner_id && $post_owner_id !== (int)$user['id']) {
                        $notif_stmt = $db->prepare("INSERT INTO notifications (user_id, actor_id, post_id, comment_id, type, message) VALUES (?, ?, ?, ?, 'comment', ?)");
                        $notif_stmt->execute([
                            $post_owner_id,
                            $user['id'],
                            $data->post_id,
                            $comment_id,
                            "đã bình luận về bài viết của bạn"
                        ]);
                    }
                }
            } else {
                // Case 2: Root comment (not a reply)
                // Notify post owner if not self
                if ($post_owner_id !== (int)$user['id']) {
                    $notif_stmt = $db->prepare("INSERT INTO notifications (user_id, actor_id, post_id, comment_id, type, message) VALUES (?, ?, ?, ?, 'comment', ?)");
                    $notif_stmt->execute([
                        $post_owner_id,
                        $user['id'],
                        $data->post_id,
                        $comment_id,
                        "đã bình luận về bài viết của bạn"
                    ]);
                }
            }
        }
    } catch (Throwable $e) {
        // Fail silently
    }
    
    // Fetch user details for comment response
    $user_stmt = $db->prepare("SELECT avatar_image FROM users WHERE id = ?");
    $user_stmt->execute([$user['id']]);
    $user_db = $user_stmt->fetch(PDO::FETCH_ASSOC);
    $avatar_image = $user_db ? $user_db['avatar_image'] : null;

    http_response_code(201);
    echo json_encode(array(
        "message" => "Bình luận đã được gửi.",
        "comment" => [
            "id" => $comment_id,
            "user_id" => (int)$user['id'],
            "username" => $user['username'],
            "content" => $data->content,
            "parent_id" => $parent_id,
            "user_uid" => encodeId($user['id']),
            "avatar_image" => $avatar_image,
            "created_at" => date('Y-m-d H:i:s')
        ]
    ));
} else {
    http_response_code(500);
    echo json_encode(array("message" => "Lỗi server. Không thể gửi bình luận."));
}
?>
