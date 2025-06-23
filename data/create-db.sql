-- 建立資料庫next_one，使用者next_one，密碼next_one，授權next_one帳號所有權限
CREATE DATABASE next_one
    DEFAULT CHARACTER SET = 'utf8mb4';
CREATE USER 'next_one'@'localhost' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON next_one.* To 'next_one'@'localhost';
FLUSH PRIVILEGES;
-- 以下為測試用
SHOW GRANTS FOR 'next_one'@'localhost';
SHOW DATABASES;
SELECT user,host FROM mysql.user;