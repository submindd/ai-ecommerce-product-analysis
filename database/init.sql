-- ============================================
-- AI 跨境电商智能选品分析平台 - 数据库初始化脚本
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS crossborder_ai
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE crossborder_ai;

-- ============================================
-- 商品数据表
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    -- ========== 主键 ==========
    id              BIGINT          NOT NULL AUTO_INCREMENT  COMMENT '商品ID（主键，自增）',

    -- ========== 基础信息 ==========
    title           VARCHAR(500)    NOT NULL                 COMMENT '商品标题',
    image_url       VARCHAR(1000)   NOT NULL                 COMMENT '商品图片URL',
    category        VARCHAR(100)    NOT NULL                 COMMENT '商品类目',
    store           VARCHAR(200)    NOT NULL                 COMMENT '店铺名称',
    publish_date    DATE            DEFAULT NULL             COMMENT '发布日期',

    -- ========== 价格信息 ==========
    price           DECIMAL(10,2)   NOT NULL                 COMMENT '当前售价（美元）',
    original_price  DECIMAL(10,2)   DEFAULT NULL             COMMENT '原价（美元），用于计算折扣',
    cost            DECIMAL(10,2)   DEFAULT NULL             COMMENT '商品成本（美元），用户手动填写',
    shipping_fee    DECIMAL(10,2)   DEFAULT 0.00             COMMENT '运费（美元/件）',
    commission_rate DECIMAL(5,4)    DEFAULT 0.1500           COMMENT '平台佣金比例（0-1），默认15%',

    -- ========== 市场表现 ==========
    sales           INT             DEFAULT 0                COMMENT '累计销量',
    rating          DECIMAL(3,2)    DEFAULT 0.00             COMMENT '商品评分（1.00-5.00）',
    reviews         INT             DEFAULT 0                COMMENT '评论数量',

    -- ========== 智能分析数据（JSON 字段） ==========
    analysis_score  DECIMAL(5,2)    DEFAULT NULL             COMMENT '智能选品综合评分（0-100）',
    price_analysis  JSON            DEFAULT NULL             COMMENT '价格分析数据（JSON格式：{suggested_price, profit_margin, roi, ...}）',
    profit_analysis JSON            DEFAULT NULL             COMMENT '利润分析数据（JSON格式：{revenue, cost, profit, scenarios, ...}）',

    -- ========== 时间戳 ==========
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- ========== 索引 ==========
    PRIMARY KEY (id),
    INDEX idx_category (category),
    INDEX idx_store (store),
    INDEX idx_price (price),
    INDEX idx_sales (sales),
    INDEX idx_rating (rating),
    INDEX idx_analysis_score (analysis_score),
    INDEX idx_publish_date (publish_date),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='跨境商品数据表';


-- ============================================
-- 商品价格历史表
-- ============================================
CREATE TABLE IF NOT EXISTS product_price_history (
    id              BIGINT          NOT NULL AUTO_INCREMENT  COMMENT '记录ID',
    product_id      BIGINT          NOT NULL                 COMMENT '关联商品ID',
    price           DECIMAL(10,2)   NOT NULL                 COMMENT '历史价格（美元）',
    recorded_date   DATE            NOT NULL                 COMMENT '价格记录日期',
    source          VARCHAR(50)     DEFAULT 'mock'           COMMENT '数据来源（mock/crawl/api）',
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    PRIMARY KEY (id),
    INDEX idx_product_date (product_id, recorded_date),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品价格历史记录表';


-- ============================================
-- 商品综合分析结果表
-- ============================================
CREATE TABLE IF NOT EXISTS product_analysis (
    id                      BIGINT          NOT NULL AUTO_INCREMENT  COMMENT '记录ID',
    product_id              BIGINT          NOT NULL UNIQUE          COMMENT '关联商品ID（一对一）',

    -- 智能评分
    analysis_score          DECIMAL(5,2)    DEFAULT NULL             COMMENT '智能选品综合评分（0-100）',

    -- 价格分析（JSON 冗余，方便查询）
    price_tier              VARCHAR(10)     DEFAULT NULL             COMMENT '价格区间（低/中/高）',
    category_avg_price      DECIMAL(10,2)   DEFAULT NULL             COMMENT '类目均价',
    price_competitiveness   DECIMAL(5,2)    DEFAULT NULL             COMMENT '价格竞争力得分（0-100）',
    is_good_time_to_enter   BOOLEAN         DEFAULT NULL             COMMENT '是否适合入场',

    -- 利润分析
    estimated_cost          DECIMAL(10,2)   DEFAULT NULL             COMMENT '估算成本',
    estimated_profit        DECIMAL(10,2)   DEFAULT NULL             COMMENT '预估利润',
    profit_margin           DECIMAL(5,2)    DEFAULT NULL             COMMENT '利润率（%）',
    roi                     DECIMAL(5,2)    DEFAULT NULL             COMMENT 'ROI（%）',

    -- 评论质量分析
    review_quality_score    DECIMAL(5,2)    DEFAULT NULL             COMMENT '评论质量得分（0-100）',
    review_sentiment        VARCHAR(20)     DEFAULT NULL             COMMENT '评论情感倾向（正面为主/中性/负面为主）',

    -- AI 分析结果
    ai_tags                 JSON            DEFAULT NULL             COMMENT 'AI 商品标签',
    ai_advantages           JSON            DEFAULT NULL             COMMENT 'AI 商品优势列表',
    ai_disadvantages        JSON            DEFAULT NULL             COMMENT 'AI 商品缺点列表',
    ai_competition_level    VARCHAR(20)     DEFAULT NULL             COMMENT 'AI 市场竞争程度（激烈/中等/蓝海）',
    ai_worth_it             BOOLEAN         DEFAULT NULL             COMMENT 'AI 是否值得做',
    ai_recommendation       TEXT            DEFAULT NULL             COMMENT 'AI 推荐理由',
    ai_risks                JSON            DEFAULT NULL             COMMENT 'AI 风险提示列表',
    ai_summary              TEXT            DEFAULT NULL             COMMENT 'AI 综合分析总结',

    -- JSON 快照
    price_analysis_json     JSON            DEFAULT NULL             COMMENT '完整价格分析JSON',
    profit_analysis_json    JSON            DEFAULT NULL             COMMENT '完整利润分析JSON',

    -- 统计
    price_history_lowest    DECIMAL(10,2)   DEFAULT NULL             COMMENT '历史最低价',
    price_history_highest   DECIMAL(10,2)   DEFAULT NULL             COMMENT '历史最高价',

    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    PRIMARY KEY (id),
    INDEX idx_product_id (product_id),
    INDEX idx_analysis_score (analysis_score),
    INDEX idx_is_good_time (is_good_time_to_enter)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品综合分析结果表';


-- ============================================
-- 插入示例数据（可选，用于开发测试）
-- ============================================
INSERT INTO products (title, image_url, category, store, publish_date, price, original_price, sales, rating, reviews, cost, shipping_fee, commission_rate, analysis_score) VALUES
('Anker Soundcore 蓝牙耳机 主动降噪 60小时续航 IPX5防水', 'https://picsum.photos/seed/p1/400/400', '电子产品', 'Anker Official Store', '2025-11-15', 59.99, 79.99, 12850, 4.60, 3420, 25.00, 5.00, 0.15, 52.20),
('女士瑜伽裤 高腰紧身 运动健身裤 速干透气', 'https://picsum.photos/seed/p2/400/400', '运动户外', 'CRZ YOGA Store', '2025-10-05', 24.99, 34.99, 31500, 4.50, 7890, 8.00, 3.00, 0.12, 78.50),
('男士轻薄羽绒服 冬季保暖 连帽设计 防风防水', 'https://picsum.photos/seed/p3/400/400', '服装', 'Outdoor Master', '2025-09-25', 69.99, 99.99, 9820, 4.60, 3450, 28.00, 6.00, 0.15, 65.30),
('COSORI 空气炸锅 5.5L 智能触控 100+菜谱', 'https://picsum.photos/seed/p4/400/400', '家居用品', 'COSORI Official', '2025-07-25', 89.99, 119.99, 32100, 4.70, 12340, 38.00, 10.00, 0.12, 85.60),
('The Ordinary 烟酰胺10%+锌1% 精华液 控油收毛孔', 'https://picsum.photos/seed/p5/400/400', '美妆护肤', 'Deciem Official', '2025-06-20', 6.50, 9.90, 56700, 4.30, 23400, 2.00, 2.00, 0.08, 96.50);
