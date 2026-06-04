<?php
// SCRIPT RESET DỮ LIỆU TEST CUỐI CÙNG - CHỈ DÙNG TRÊN LOCAL/DEV
// Chạy bằng CLI: php be_php/config/reset_final_test_data.php

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo json_encode(["message" => "Script nay chi co the chay qua giao dien CLI de bao dam an toan."]);
    exit(1);
}

include_once __DIR__ . '/database.php';

echo "=== MYBLOG DATABASE RESET SCRIPT ===\n";
echo "Xac nhan database dang ket noi: blog_db\n";
echo "Canh bao: Toan bo du lieu cu se bi xoa sach hoan toan!\n";
echo "Chuan bi xoa cac bang: comments, follows, likes, post_images, post_tags, ratings, reposts, tags, user_name_history, posts, users.\n\n";

$database = new Database();
$db = $database->getConnection();

try {
    // Tạm thời tắt kiểm tra khóa ngoại để dọn dẹp và reset AUTO_INCREMENT
    $db->exec("SET FOREIGN_KEY_CHECKS = 0;");
    echo "[1/4] Dang truncate tat ca cac bang du lieu...\n";

    $tables_to_clear = [
        'comments',
        'follows',
        'likes',
        'post_images',
        'post_tags',
        'ratings',
        'reposts',
        'tags',
        'user_name_history',
        'posts',
        'users'
    ];

    foreach ($tables_to_clear as $table) {
        $db->exec("TRUNCATE TABLE `$table`");
        echo " -> Da xoa sach va reset index bang `$table` thành cong.\n";
    }

    $db->exec("SET FOREIGN_KEY_CHECKS = 1;");
    echo " -> Da kich hoat lai kiem tra khoa ngoai.\n\n";

    // 2. Tạo mật khẩu băm chung để tối ưu CPU
    echo "[2/4] Dang chuan bi tai khoan test...\n";
    $raw_password = '123456';
    $hashed_password = password_hash($raw_password, PASSWORD_DEFAULT);

    // Định nghĩa các tài khoản chính
    $users_to_create = [
        // id, username, password, full_name, role
        [1, 'admin1', $hashed_password, 'Administrator One', 'admin'],
        [2, 'admin2', $hashed_password, 'Administrator Two', 'admin'],
        [3, 'user10k', $hashed_password, 'Celeb VIP 10k Plus', 'user'],
        [4, 'user1k', $hashed_password, 'KOL Celebrity 1k Plus', 'user'],
        [5, 'user100', $hashed_password, 'Rising Star 100 Plus', 'user'],
        [6, 'user1', $hashed_password, 'Normal User One', 'user'],
    ];

    $insert_user_query = "INSERT INTO users (id, username, password, full_name, role) VALUES (?, ?, ?, ?, ?)";
    $user_stmt = $db->prepare($insert_user_query);

    foreach ($users_to_create as $u) {
        $user_stmt->execute($u);
        echo " -> Da tao tai khoan: {$u[1]} ({$u[4]})\n";
    }
    echo " -> Hoan thanh tao 6 tai khoan chinh.\n\n";

    // 3. Tạo tài khoản bot làm follower
    echo "[3/4] Dang tao 10,001 bot followers...\n";
    $total_bots = 10001;
    $bot_inserts = [];
    $insert_bot_query = "INSERT INTO users (id, username, password, full_name, role) VALUES ";

    $db->beginTransaction();

    $batch_size = 1000;
    $bot_count = 0;
    
    for ($i = 1; $i <= $total_bots; $i++) {
        $bot_id = 6 + $i; // ID bat dau tu 7
        $username = sprintf("follower_%05d", $i);
        $full_name = sprintf("Follower %05d", $i);
        
        $bot_inserts[] = "($bot_id, '$username', '$hashed_password', '$full_name', 'user')";
        $bot_count++;

        if (count($bot_inserts) >= $batch_size || $i == $total_bots) {
            $db->exec($insert_bot_query . implode(", ", $bot_inserts));
            $bot_inserts = [];
            echo " -> Da insert duoc $i / $total_bots bot...\n";
        }
    }
    $db->commit();
    echo " -> Hoan thanh tao $total_bots bot followers.\n\n";

    // 4. Tạo các quan hệ follows
    echo "[4/4] Dang tao quan he follows cho cac user test...\n";
    // user10k (id=3) can 10,001 follower (id tu 7 den 10007)
    // user1k (id=4) can 1,001 follower (id tu 7 den 1007)
    // user100 (id=5) can 101 follower (id tu 7 den 107)
    // user1 (id=6) can 0 follower
    
    $follow_inserts = [];
    $insert_follow_query = "INSERT INTO follows (follower_id, following_id) VALUES ";
    $follow_count = 0;
    
    $db->beginTransaction();
    
    // Tạo follow cho user10k (id=3)
    for ($i = 1; $i <= 10001; $i++) {
        $follower_id = 6 + $i;
        $follow_inserts[] = "($follower_id, 3)";
        $follow_count++;
        
        if (count($follow_inserts) >= $batch_size) {
            $db->exec($insert_follow_query . implode(", ", $follow_inserts));
            $follow_inserts = [];
        }
    }
    
    // Tạo follow cho user1k (id=4)
    for ($i = 1; $i <= 1001; $i++) {
        $follower_id = 6 + $i;
        $follow_inserts[] = "($follower_id, 4)";
        $follow_count++;
        
        if (count($follow_inserts) >= $batch_size) {
            $db->exec($insert_follow_query . implode(", ", $follow_inserts));
            $follow_inserts = [];
        }
    }
    
    // Tạo follow cho user100 (id=5)
    for ($i = 1; $i <= 101; $i++) {
        $follower_id = 6 + $i;
        $follow_inserts[] = "($follower_id, 5)";
        $follow_count++;
        
        if (count($follow_inserts) >= $batch_size) {
            $db->exec($insert_follow_query . implode(", ", $follow_inserts));
            $follow_inserts = [];
        }
    }
    
    // Insert so follow con lai neu co
    if (count($follow_inserts) > 0) {
        $db->exec($insert_follow_query . implode(", ", $follow_inserts));
    }
    
    $db->commit();
    echo " -> Hoan thanh tao $follow_count quan he follow thuc te.\n\n";

    echo "=== KET QUA KIEM TRA DATABASE SAU RESET ===\n";
    
    // Đếm bài viết
    $posts_count = $db->query("SELECT COUNT(*) FROM posts")->fetchColumn();
    // Đếm comment
    $comments_count = $db->query("SELECT COUNT(*) FROM comments")->fetchColumn();
    // Đếm likes
    $likes_count = $db->query("SELECT COUNT(*) FROM likes")->fetchColumn();
    // Đếm reposts
    $reposts_count = $db->query("SELECT COUNT(*) FROM reposts")->fetchColumn();
    // Đếm users
    $users_count = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    
    // Đếm follower của từng user chính
    $followers_10k = $db->query("SELECT COUNT(*) FROM follows WHERE following_id = 3")->fetchColumn();
    $followers_1k = $db->query("SELECT COUNT(*) FROM follows WHERE following_id = 4")->fetchColumn();
    $followers_100 = $db->query("SELECT COUNT(*) FROM follows WHERE following_id = 5")->fetchColumn();
    $followers_1 = $db->query("SELECT COUNT(*) FROM follows WHERE following_id = 6")->fetchColumn();

    echo "1. Tong so bai viet (posts): $posts_count (Mong muon: 0)\n";
    echo "2. Tong so binh luan (comments): $comments_count (Mong muon: 0)\n";
    echo "3. Tong so thich (likes): $likes_count (Mong muon: 0)\n";
    echo "4. Tong so dang lai (reposts): $reposts_count (Mong muon: 0)\n";
    echo "5. Tong so nguoi dung (users): $users_count (Bao gom 6 tai khoan chinh + 10,001 bot)\n";
    echo "6. So follower cua user10k: $followers_10k (Mong muon: 10001)\n";
    echo "7. So follower cua user1k: $followers_1k (Mong muon: 1001)\n";
    echo "8. So follower cua user100: $followers_100 (Mong muon: 101)\n";
    echo "9. So follower cua user1: $followers_1 (Mong muon: 0)\n\n";

    echo "RESET DATABASE HOAN TAT THANH CONG!\n";
    echo "Tat ca cac mat khau deu la: 123456\n";

} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    echo "Loi xay ra trong qua trinh reset: " . $e->getMessage() . "\n";
    exit(1);
}
?>
