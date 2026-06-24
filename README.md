# AI 跨境电商智能选品分析平台

AI 驱动的跨境电商智能选品分析工具，帮助卖家精准选品、洞察市场趋势、优化运营策略。

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Next.js (App Router) | 16.x |
| 前端语言 | TypeScript | 5.x |
| 样式方案 | Tailwind CSS | 4.x |
| 组件库 | shadcn/ui | 4.x |
| 图标库 | Lucide React | 最新 |
| 后端框架 | FastAPI | 0.115 |
| 后端语言 | Python | 3.14 |
| 数据库 | MySQL | 8.x |
| ORM | SQLAlchemy | 2.0（异步） |

## 项目结构

```
AI Analysis platform/
├── frontend/                    # Next.js 前端应用
│   ├── src/
│   │   ├── app/                 # 页面路由（App Router）
│   │   │   ├── layout.tsx       # 根布局（SEO、字体、主题）
│   │   │   ├── page.tsx         # 首页
│   │   │   └── globals.css      # 全局样式 + 主题变量
│   │   ├── components/
│   │   │   └── ui/              # shadcn/ui 组件
│   │   ├── lib/                 # 工具函数（cn 等）
│   │   └── types/               # TypeScript 类型定义
│   ├── components.json          # shadcn/ui 配置
│   ├── .env.local               # 前端环境变量
│   └── package.json
├── backend/                     # FastAPI 后端应用
│   ├── app/
│   │   ├── main.py              # 应用入口（路由注册、中间件）
│   │   ├── config.py            # 全局配置管理（环境变量）
│   │   ├── database.py          # MySQL 连接管理（同步+异步）
│   │   ├── api/v1/              # API v1 路由
│   │   ├── models/              # SQLAlchemy 数据模型
│   │   ├── schemas/             # Pydantic 校验模式
│   │   └── services/            # 业务逻辑层
│   ├── tests/                   # 后端测试
│   ├── requirements.txt         # Python 依赖
│   └── .env                     # 后端环境变量
├── database/
│   └── init.sql                 # 数据库初始化脚本
├── .env.example                 # 环境变量模板
├── .gitignore                   # Git 忽略文件
└── README.md                    # 项目说明文档
```

## 快速开始

### 前提条件

- Node.js >= 18.x
- Python >= 3.10
- MySQL >= 8.0
- npm >= 9.x

### 1. 克隆项目

```bash
cd "AI Analysis platform"
```

### 2. 配置环境变量

```bash
# 配置后端数据库连接
cp .env.example backend/.env
# 编辑 backend/.env，填入你的 MySQL 用户名和密码
```

### 3. 初始化数据库

```bash
# 登录 MySQL 并执行初始化脚本
mysql -u root -p < database/init.sql
```

### 4. 启动后端（FastAPI）

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# 安装依赖
pip install -r requirements.txt

# 启动服务
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

启动后访问：
- API 文档（Swagger）：http://localhost:8000/docs
- API 文档（ReDoc）：http://localhost:8000/redoc
- 健康检查：http://localhost:8000/health

### 5. 启动前端（Next.js）

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

启动后访问：http://localhost:3000

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/api/v1/ping` | API 连通性测试 |

更多接口将在后续阶段逐步添加。

## 开发计划

- [x] 阶段一：项目初始化与基础配置
- [ ] 阶段二：数据库表设计与模型创建
- [ ] 阶段三：用户认证模块
- [ ] 阶段四：商品数据管理
- [ ] 阶段五：AI 智能分析引擎
- [ ] 阶段六：数据可视化看板
- [ ] 阶段七：部署与运维
