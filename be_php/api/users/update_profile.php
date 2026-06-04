<?php
include_once '../../config/database.php';
include_once '../auth/token_helper.php';
include_once '../../config/id_helper.php';

$auth_user = get_auth_user();
if (!$auth_user || empty($auth_user['id'])) {
    http_response_code(401);
    echo json_encode(["message" => "Unauthorized access."]);
    exit();
}

// BẢO MẬT: Chặn ngay nếu phát hiện cố tình gửi username hoặc id mới lên
if (isset($_POST['username']) || isset($_POST['id'])) {
    http_response_code(403);
    echo json_encode(["message" => "Lỗi bảo mật: Truy cập bất hợp pháp. Bạn không có quyền thay đổi ID hoặc Username."]);
    exit();
}

// Kiểm tra nếu request cố tình truyền tham số định danh khác để sửa user khác
$request_id = $_POST['id'] ?? $_GET['id'] ?? $_POST['uid'] ?? $_GET['uid'] ?? null;
if ($request_id !== null) {
    $decoded_request_id = is_numeric($request_id) ? (int)$request_id : decodeId($request_id);
    if ($decoded_request_id !== (int)$auth_user['id']) {
        http_response_code(403);
        echo json_encode(["message" => "Lỗi bảo mật: Bạn không có quyền thay đổi thông tin của người dùng khác."]);
        exit();
    }
}

$user_id = $auth_user['id'];
$full_name = htmlspecialchars(strip_tags($_POST['full_name'] ?? ''));

$database = new Database();
$db = $database->getConnection();

// Lấy thông tin image cũ và full_name cũ trước để xử lý
$query_old = "SELECT full_name, avatar_image, cover_image FROM users WHERE id = :id LIMIT 1";
$stmt_old = $db->prepare($query_old);
$stmt_old->bindParam(':id', $user_id);
$stmt_old->execute();
$old_data = $stmt_old->fetch(PDO::FETCH_ASSOC);

$old_avatar = $old_data ? $old_data['avatar_image'] : null;
$old_cover = $old_data ? $old_data['cover_image'] : null;
$old_full_name = $old_data ? $old_data['full_name'] : null;

// Hàm xử lý upload an toàn
function upload_image($file_input, $upload_dir) {
    if (isset($_FILES[$file_input]) && $_FILES[$file_input]['error'] === UPLOAD_ERR_OK) {
        $file_tmp = $_FILES[$file_input]['tmp_name'];
        $file_name = $_FILES[$file_input]['name'];
        $file_size = $_FILES[$file_input]['size'];
        
        // 2MB limit
        if ($file_size > 2 * 1024 * 1024) throw new Exception("File upload vượt quá giới hạn 2MB.");
        
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file_tmp);
        finfo_close($finfo);
        
        // CHẶN CỨNG: Chỉ cho phép JPG/JPEG
        if ($mime_type !== 'image/jpeg') throw new Exception("Định dạng file không hợp lệ. Chỉ chấp nhận ảnh JPG/JPEG.");
        
        $ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
        if ($ext !== 'jpg' && $ext !== 'jpeg') throw new Exception("Phần mở rộng file không hợp lệ. Chỉ chấp nhận .jpg hoặc .jpeg.");
        // Random file name chống path traversal
        $new_name = uniqid($file_input . '_') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $target_path = $upload_dir . $new_name;
        
        if (move_uploaded_file($file_tmp, $target_path)) {
            return $new_name;
        } else {
            throw new Exception("Lỗi hệ thống khi lưu file: " . $file_input);
        }
    }
    return null; // Không gửi file lên
}

$upload_dir = '../../uploads/';
// Đảm bảo có thư mục uploads
if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

$new_uploaded_files = []; // Lưu danh sách file vừa upload để lỡ rollback thì xoá nó
$avatar_name = $old_avatar;
$cover_name = $old_cover;

try {
    // 1. Thực hiện Upload File vật lý trước
    if (isset($_FILES['avatar_image'])) {
        $uploaded = upload_image('avatar_image', $upload_dir);
        if ($uploaded) {
            $avatar_name = $uploaded;
            $new_uploaded_files[] = $uploaded;
        }
    }
    if (isset($_FILES['cover_image'])) {
        $uploaded = upload_image('cover_image', $upload_dir);
        if ($uploaded) {
            $cover_name = $uploaded;
            $new_uploaded_files[] = $uploaded;
        }
    }

    // 2. TRANSACTION MỨC DATABASE
    $db->beginTransaction();

    // Kiểm tra Cooldown 7 ngày NẾU CÓ ĐỔI TÊN
    $full_name_trimmed = trim($full_name);
    $old_full_name_trimmed = trim($old_full_name ?? '');
    $is_changing_name = ($full_name_trimmed !== $old_full_name_trimmed);
    
    if ($is_changing_name) {
        $query_history = "SELECT TIMESTAMPDIFF(SECOND, changed_at, NOW()) as seconds_since_last_change FROM user_name_history WHERE user_id = :user_id ORDER BY changed_at DESC LIMIT 1";
        $stmt_history = $db->prepare($query_history);
        $stmt_history->bindParam(':user_id', $user_id);
        $stmt_history->execute();
        $last_history = $stmt_history->fetch(PDO::FETCH_ASSOC);

        if ($last_history && isset($last_history['seconds_since_last_change'])) {
            $seconds_passed = (int)$last_history['seconds_since_last_change'];
            if ($seconds_passed < 604800) { // < 7 ngày
                // HỦY TRANSACTION NGAY
                $db->rollBack();
                http_response_code(429);
                echo json_encode(["status" => "error", "message" => "Bạn chỉ được đổi tên 1 lần mỗi 7 ngày. Vui lòng thử lại sau."]);
                exit();
            }
        }
    }

    $query = "UPDATE users SET full_name = :full_name, avatar_image = :avatar_image, cover_image = :cover_image";
    
    // [COOLDOWN SYNC]: Nếu có đổi tên, cập nhật luôn timestamp ở bảng users
    if ($is_changing_name) {
        $query .= ", last_name_change_at = NOW()";
    }
    
    $query .= " WHERE id = :id";
    
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(':full_name', $full_name);
    $stmt->bindParam(':avatar_image', $avatar_name);
    $stmt->bindParam(':cover_image', $cover_name);
    $stmt->bindParam(':id', $user_id);
    
    if (!$stmt->execute()) {
        throw new PDOException("Lỗi update CSDL.");
    }

    // Nếu có đổi tên thành công, Insert vào bảng user_name_history
    if ($is_changing_name) {
        $query_insert_history = "INSERT INTO user_name_history (user_id, old_name, new_name) VALUES (:user_id, :old_name, :new_name)";
        $stmt_insert = $db->prepare($query_insert_history);
        $stmt_insert->bindParam(':user_id', $user_id);
        $stmt_insert->bindParam(':old_name', $old_full_name);
        $stmt_insert->bindParam(':new_name', $full_name);
        if (!$stmt_insert->execute()) {
             throw new PDOException("Lỗi khi ghi lịch sử đổi tên.");
        }
    }

    $db->commit();
    
    // 3. NẾU COMMIT THÀNH CÔNG: XÓA CÁC FILE CŨ (Tránh rác)
    if ($avatar_name !== $old_avatar && $old_avatar && file_exists($upload_dir . $old_avatar)) {
        unlink($upload_dir . $old_avatar);
    }
    if ($cover_name !== $old_cover && $old_cover && file_exists($upload_dir . $old_cover)) {
        unlink($upload_dir . $old_cover);
    }

    // Lấy lại user mới trả về Frontend cập nhật LocalStorage
    $query_new = "SELECT id, username, full_name, role, avatar_image, cover_image, created_at, UNIX_TIMESTAMP(last_name_change_at) as last_name_change_at FROM users WHERE id = :id";
    $stmt_new = $db->prepare($query_new);
    $stmt_new->bindParam(':id', $user_id);
    $stmt_new->execute();
    $updated_user = $stmt_new->fetch(PDO::FETCH_ASSOC);

    if ($updated_user) {
        $updated_user['uid'] = encodeId($updated_user['id']);
        $updated_user['id'] = (int)$updated_user['id'];
    }

    http_response_code(200);
    echo json_encode([
        "status" => "success",
        "message" => "Hồ sơ đã được nâng cấp thành công.",
        "data" => $updated_user
    ]);

} catch (Exception $e) {
    // 4. CÓ LỖI XẢY RA: ROLLBACK CSDL & XÓA CÁC VỪA UPLOAD MỚI NHẤT
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    // Xóa rác mới
    foreach ($new_uploaded_files as $file) {
        if (file_exists($upload_dir . $file)) {
            unlink($upload_dir . $file);
        }
    }

    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Lỗi: " . $e->getMessage()]);
}
?>
