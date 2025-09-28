-- PostgreSQL TimeLog 資料表建立腳本
-- 適用於 PostgreSQL 資料庫

-- 建立 TimeLog 主活動資料表
CREATE TABLE IF NOT EXISTS "TimeLog" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "start_time" TIMESTAMP NOT NULL,
    "end_time" TIMESTAMP
);

-- 建立 Step 步驟資料表
CREATE TABLE IF NOT EXISTS "Step" (
    "id" SERIAL PRIMARY KEY,
    "time_log_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP NOT NULL,
    "end_time" TIMESTAMP
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS "idx_timelog_start_time" ON "TimeLog" ("start_time");
CREATE INDEX IF NOT EXISTS "idx_step_time_log_id" ON "Step" ("time_log_id");
CREATE INDEX IF NOT EXISTS "idx_step_start_time" ON "Step" ("start_time");

-- 建立外鍵約束
ALTER TABLE "Step"
ADD CONSTRAINT "fk_step_timelog"
FOREIGN KEY ("time_log_id") REFERENCES "TimeLog"("id") ON DELETE CASCADE;

-- 插入範例資料
INSERT INTO "TimeLog" ("title", "start_time", "end_time") VALUES
('專案開發', '2025-01-18 09:00:00', '2025-01-18 17:00:00'),
('學習 React', '2025-01-19 10:00:00', '2025-01-19 12:00:00');

INSERT INTO "Step" ("time_log_id", "title", "description", "start_time", "end_time") VALUES
(1, '前端開發', 'React 元件開發', '2025-01-18 09:00:00', '2025-01-18 12:00:00'),
(1, '後端開發', 'API 路由開發', '2025-01-18 13:00:00', '2025-01-18 17:00:00'),
(1, '測試階段', '功能測試與除錯', '2025-01-18 17:00:00', '2025-01-18 18:00:00'),
(2, '學習 useState', '學習 useState Hook', '2025-01-19 10:00:00', '2025-01-19 11:00:00'),
(2, '學習 useEffect', '學習 useEffect Hook', '2025-01-19 11:00:00', '2025-01-19 12:00:00');