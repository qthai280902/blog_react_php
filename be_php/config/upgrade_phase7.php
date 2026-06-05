<?php
include_once 'database.php';

$database = new Database();
$db = $database->getConnection();

// 1. Add excerpt to posts table
try {
    // Check if column exists first
    $check = $db->query("SHOW COLUMNS FROM posts LIKE 'excerpt'");
    if ($check->rowCount() == 0) {
        $sql = "ALTER TABLE posts ADD COLUMN excerpt TEXT NULL DEFAULT NULL";
        $db->exec($sql);
        echo "SUCCESS: Added excerpt to posts table.\n";
    } else {
        echo "INFO: excerpt column already exists in posts table.\n";
    }
} catch (PDOException $e) {
    echo "ERROR (posts excerpt): " . $e->getMessage() . "\n";
}

// 2. Add parent_id to comments table
try {
    $check = $db->query("SHOW COLUMNS FROM comments LIKE 'parent_id'");
    if ($check->rowCount() == 0) {
        $sql = "ALTER TABLE comments ADD COLUMN parent_id INT NULL DEFAULT NULL";
        $db->exec($sql);
        echo "SUCCESS: Added parent_id to comments table.\n";
    } else {
        echo "INFO: parent_id column already exists in comments table.\n";
    }

    // Add foreign key constraint if not exists (try/catch will handle if already exists)
    try {
        $sqlConstraint = "ALTER TABLE comments ADD CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE";
        $db->exec($sqlConstraint);
        echo "SUCCESS: Added foreign key constraint fk_comments_parent to comments table.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), "Duplicate key name") !== false || strpos($e->getMessage(), "already exists") !== false || strpos($e->getMessage(), "Cannot add foreign key constraint") !== false) {
            echo "INFO: Constraint fk_comments_parent already exists or cannot be added.\n";
        } else {
            throw $e;
        }
    }
} catch (PDOException $e) {
    echo "ERROR (comments parent_id): " . $e->getMessage() . "\n";
}

// 3. Create notifications table
try {
    $sql = "CREATE TABLE IF NOT EXISTS notifications (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      actor_id INT NOT NULL,
      post_id INT NULL,
      comment_id INT NULL,
      type ENUM('comment','like','repost','reply') NOT NULL,
      message VARCHAR(255) NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      read_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_notifications_user_read (user_id, is_read),
      INDEX idx_notifications_created_at (created_at),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $db->exec($sql);
    echo "SUCCESS: Created notifications table.\n";
} catch (PDOException $e) {
    echo "ERROR (notifications table): " . $e->getMessage() . "\n";
}
?>
