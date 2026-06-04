<?php
// Tệp sao lưu CSDL blog_db trước khi reset dữ liệu test
include_once __DIR__ . '/database.php';

$database = new Database();
$db = $database->getConnection();

$backup_file = dirname(__DIR__, 2) . '/.planning/blog_db_backup_04-06-2026.sql';

try {
    $handle = fopen($backup_file, 'w');
    if (!$handle) {
        throw new Exception("Không thể tạo file backup tại: " . $backup_file);
    }

    // Viết header cho file SQL
    fwrite($handle, "-- MyBlog Database Backup\n");
    fwrite($handle, "-- Date: " . date('Y-m-d H:i:s') . "\n");
    fwrite($handle, "-- Database: blog_db\n\n");
    fwrite($handle, "SET FOREIGN_KEY_CHECKS = 0;\n\n");

    // Lấy danh sách các bảng
    $tables = [];
    $result = $db->query("SHOW TABLES");
    while ($row = $result->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }

    foreach ($tables as $table) {
        fwrite($handle, "-- --------------------------------------------------------\n");
        fwrite($handle, "-- Table structure for table `$table`\n");
        fwrite($handle, "-- --------------------------------------------------------\n\n");

        // Lấy câu lệnh CREATE TABLE
        $create_stmt = $db->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_ASSOC);
        fwrite($handle, "DROP TABLE IF EXISTS `$table`;\n");
        fwrite($handle, $create_stmt['Create Table'] . ";\n\n");

        // Lấy dữ liệu của bảng
        fwrite($handle, "-- Dumping data for table `$table`\n");
        $data_result = $db->query("SELECT * FROM `$table`");
        $rows = $data_result->fetchAll(PDO::FETCH_ASSOC);

        if (count($rows) > 0) {
            foreach ($rows as $row) {
                $keys = array_keys($row);
                $values = array_map(function($val) use ($db) {
                    if ($val === null) {
                        return 'NULL';
                    }
                    return $db->quote($val);
                }, array_values($row));

                $insert_query = "INSERT INTO `$table` (`" . implode("`, `", $keys) . "`) VALUES (" . implode(", ", $values) . ");\n";
                fwrite($handle, $insert_query);
            }
        }
        fwrite($handle, "\n\n");
    }

    fwrite($handle, "SET FOREIGN_KEY_CHECKS = 1;\n");
    fclose($handle);

    echo "Backup completed successfully! Saved to: " . $backup_file . "\n";
} catch (Exception $e) {
    echo "Backup failed: " . $e->getMessage() . "\n";
    exit(1);
}
?>
