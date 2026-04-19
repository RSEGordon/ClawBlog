---
title: 龙虾养殖 · 003 - Minecraft知识库QA系统搭建教程
date: 2026-04-19 00:53:00
categories: [龙虾养殖]
cover: /images/cover-lobster-003.png
tags: [技术, OpenClaw]
---

# 龙虾养殖 · 003 - Minecraft知识库QA系统搭建教程

> 本文记录如何从零搭建一个支持 Minecraft Wiki 知识查询 + 源码级机制追问的问答系统。适合想给自己的 AI 助手接 Minecraft 知识的人参考。

---

## 一、整体架构

整个系统由四层组成：

```
用户提问
  ↓
OpenClaw Agent（对话路由）
  ↓
┌─────────────────────────────────────────────┐
│  1. ChromaDB 知识库（minecraft_wiki_v3）     │  ← Wiki + 源码级知识
│  2. Tavily 搜索（实时网络补充）              │  ← 补充最新信息
│  3. MC 源码 grep（源码级机制追问）          │  ← 精确到代码行
└─────────────────────────────────────────────┘
  ↓
返回答案
```

**各层职责：**

| 层级 | 工具 | 作用 |
|------|------|------|
| 对话路由 | OpenClaw Agent | 判断问题类型，分发到对应检索层 |
| Wiki 知识 | ChromaDB v3（12.4万条） | 回答机制、物品、生物、策略等问题 |
| 实时补充 | Tavily 搜索 | 补充最新版本信息、快照变更 |
| 源码追问 | grep + 本地源码 | 源码级精确机制（如碰撞箱、挂载点） |

---

## 二、知识库建设

### 2.1 目录结构

```
~/桌面/MinecraftFile/
├── Base/
│   ├── chroma_db/           ← ChromaDB 向量数据库
│   │   ├── minecraft_wiki_v3/    ← 主知识库（12.4万条）
│   │   └── redstone_web_knowledge/ ← 红石补充库（备用）
│   └── supplement_multi.py  ← 补充知识库脚本
├── Wiki/
│   └── pages/               ← 本地 Wiki 页面（4.9万页）
├── wiki_zh_en_mapping.json  ← 中英文术语映射
└── wiki_zh_en_mapping_reverse.json ← 反向映射
```

### 2.2 Wiki 页面爬取

参考脚本 `~/桌面/MinecraftFile/Base/supplement_multi.py`。

核心思路：**多引擎 fallback 爬取**。当 Wikipedia API 不稳定时，依次切换 DuckDuckGo HTML → Google News RSS，避免单点失败。

关键代码片段：

```python
SEARCH_ENGINES = [
    ('WikipediaAPI', ''),  # 优先 Wikipedia API
    ('DuckDuckGo', 'https://duckduckgo.com/html/?q={q}&kl=us-en'),
    ('GoogleNewsRSS', 'https://news.google.com/rss/search?q={q}'),
]

def multi_search(query, count=5):
    for engine_name, url_template in SEARCH_ENGINES:
        results = try_engine(engine_name, url_template, query)
        if results:
            return results
    return []
```

搜索词按分类组织，每个分类多组关键词，覆盖不同角度：

```python
SEARCH_TERMS = {
    "完整红石计算机": [
        "Minecraft redstone 8-bit computer complete build tutorial",
        "Minecraft redstone computer architecture RAM ALU instruction",
    ],
    "珍珠炮": [
        "Minecraft pearl cannon design ender pearl teleportation",
        "Minecraft instant pearl cannon zero delay",
    ],
    # ... 更多分类
}
```

### 2.3 翻译映射文件

中英文术语映射是整个系统的地基。没有它，你查到的中文结果对不上英文源码。

生成脚本：`~/桌面/MinecraftFile/wiki_translation_builder.py`

核心是一张核心词汇表（英→中），包含方块、物品、附魔、生物群系等所有游戏内容：

```python
ZH2EN_CORE = {
    'Stone': '石头', 'Diamond Ore': '钻石矿石',
    'Ancient Debris': '远古残骸', 'Ender Pearl': '末影珍珠',
    'Bedrock': '基岩', 'Netherrack': '下界岩',
    # ... 共数千条
}
```

**重要提醒：** 翻译必须用映射文件，不能自己编。历史上曾把 `Happy Ghast` 误翻为"幸福满陀"，实际映射文件里是"快乐恶魂"。教训：每条翻译必须过映射文件。

### 2.4 ChromaDB v3 建库

```
库路径：~/桌面/MinecraftFile/Base/chroma_db/minecraft_wiki_v3
数据量：124,529 条
```

ChromaDB 是本地向量数据库，存储格式为 `chroma.sqlite3` + `*.hnsl` 索引文件。查询时只需：

```python
import chromadb
client = chromadb.PersistentClient(path='~/桌面/MinecraftFile/Base/chroma_db')
col = client.get_or_create_collection('minecraft_wiki_v3')

results = col.query(
    query_texts=['how does Fortune enchantment work on ore blocks'],
    n_results=10
)
```

**Metadata 设计**（可按来源、分类、标签过滤）：

```python
{
    'source_url': 'https://zh.minecraft.wiki/w/绿宝石矿石',
    'en_title': 'Emerald Ore',
    'zh_title': '绿宝石矿石',
    'category': '方块',
    'version': '1.21'
}
```

---

## 三、源码接入

知识库能回答 80% 的问题，剩下 20% 需要精确到代码行——比如实体碰撞箱大小、方块更新顺序、挂载点坐标。这些只能从源码里找。

### 3.1 源码准备

**版本与工具：**

| 项目 | 内容 |
|------|------|
| 版本 | Java Edition 1.21.1 + 26.2 Snapshot |
| 反编译器 | CFR（`vineflower.jar`）|
| 命名映射 | Yarn Mappings 1.21.1（8.7万条）|
| 源码目录 | `src_1.21.1/`（6623个Java文件）|

**目录结构：**

```
~/桌面/MinecraftFile/
├── src_1.21.1/              ← 1.21.1 源码（6623个Java文件）
├── src_26.2_snapshot_1/     ← 快照源码（4803个文件）
└── vineflower.jar           ← 反编译器
```

### 3.2 grep 查询方式

源码按包名分类，grep 找类名或方法名：

```bash
# 查找实体相关类
grep -r "extends Entity" ~/桌面/MinecraftFile/src_1.21.1/net/minecraft/world/entity/

# 查找碰撞箱设置
grep -rn "setBoundingBox\|aabb" ~/桌面/MinecraftFile/src_1.21.1/net/minecraft/world/entity/

# 查找挂载点
grep -rn "mount\|passenger" ~/桌面/MinecraftFile/src_1.21.1/net/minecraft/world/entity/
```

### 3.3 知识库缺失时的处理

**重要原则：先查知识库，后查源码。** 知识库（minecraft_wiki_v3）本身已包含大量反编译源码知识，不得绕过直接搜文件。

当知识库粒度不够时（如需要某个方法的精确参数），才 exec 源码，并注明"知识库缺失此粒度"。

---

## 四、Skill 文件结构

### 4.1 存放位置

OpenClaw 的 Skill 存放在：

```
~/.openclaw/workspace/skills/<skill-name>/SKILL.md
```

已有的相关 Skills：

```
~/.openclaw/workspace/skills/
├── chroma/              ← ChromaDB 使用指南
├── minecraft-wiki/      ← Minecraft 知识查询（主用）
├── ai-rag-pipeline/     ← RAG 流程设计
└── brave-search/        ← 搜索增强
```

### 4.2 prompt 编写要点

每个 Skill 的 `SKILL.md` 包含两部分：

**1. 元信息（头部）：**

```markdown
---
name: minecraft-wiki
version: 1.0.0
author: your-name
description: >
  Answer Minecraft Java Edition questions about mechanics, items, mobs...
---
```

**2. 核心指令：**

```markdown
## 知识库配置

**ChromaDB 路径**: `~/桌面/MinecraftFile/Base/chroma_db`

**Collection 查询优先级**：
1. `minecraft_wiki_v3` — 124,529 条，**必查**
2. 本地源码（`src_1.21.1/`）— 源码级机制问题

**查询顺序**：
- 实体/方块机制 → v3 知识库 → 本地源码
- 红石电路原理 → v3 知识库
```

### 4.3 搜索优先级规则

```
1. v3 知识库 — 源码机制、碰撞箱、挂载点等直接查库
2. 本地 Wiki — 按英文术语找对应页面，引用原文
3. 翻译映射文件 — 专有词汇翻译必须核对映射文件
4. 源码 exec — 仅当知识库没有时才能 exec
5. 联网搜索 — 仅当前四条都找不到时使用
```

---

## 五、从零搭建完整步骤

### Step 1：准备环境

```bash
# 安装 Python 依赖
pip install chromadb requests beautifulsoup4

# 创建目录结构
mkdir -p ~/桌面/MinecraftFile/{Base/chroma_db,Wiki/pages,src_1.21.1}
```

### Step 2：获取 Yarn Mappings

从 [Fabric 网站](https://fabricmc.net/develop/) 下载 1.21.1 的 Yarn mappings，解压到 `src_1.21.1/`。

### Step 3：反编译 Minecraft

下载 `vineflower.jar`（或 CFR），对 Minecraft server jar 反编译：

```bash
java -jar vineflower.jar minecraft-server.jar ./src_1.21.1/
```

### Step 4：抓取 Wiki 页面

参考 `supplement_multi.py`，按分类组织搜索词，依次抓取并存储到 ChromaDB。

### Step 5：建立翻译映射

运行 `wiki_translation_builder.py`，生成 `wiki_zh_en_mapping.json`。

### Step 6：创建 ChromaDB 知识库

```python
import chromadb
client = chromadb.PersistentClient(path='~/桌面/MinecraftFile/Base/chroma_db')
col = client.get_or_create_collection(
    name='minecraft_wiki_v3',
    metadata={'description': 'Minecraft Wiki + 源码知识库 v3'}
)
# 批量 upsert 文档
```

### Step 7：写 Skill 文件

在 `~/.openclaw/workspace/skills/` 下创建 `minecraft-wiki/SKILL.md`，写入知识库路径、查询优先级、回答格式要求。

### Step 8：接入 OpenClaw Agent

配置 Agent 的 skill 加载顺序，让它先查 ChromaDB，再按需调用源码 grep 和 Tavily。

---

## 六、关键文件路径汇总

| 文件 | 路径 |
|------|------|
| ChromaDB 数据库 | `~/桌面/MinecraftFile/Base/chroma_db/minecraft_wiki_v3/` |
| 补充脚本 | `~/桌面/MinecraftFile/Base/supplement_multi.py` |
| 翻译映射（中→英）| `~/桌面/MinecraftFile/wiki_zh_en_mapping.json` |
| 翻译映射（英→中）| `~/桌面/MinecraftFile/wiki_zh_en_mapping_reverse.json` |
| 源码（1.21.1）| `~/桌面/MinecraftFile/src_1.21.1/` |
| 本地 Wiki | `~/桌面/MinecraftFile/Wiki/pages/` |
| Skill 存放位置 | `~/.openclaw/workspace/skills/` |

---

## 七、注意事项

1. **翻译必须过映射文件**：不要自行翻译专有词汇，每次都要对照 `wiki_zh_en_mapping.json`，不确定的标注"待核实"。

2. **先查知识库，后查源码**：知识库（minecraft_wiki_v3）包含大量反编译源码，不得绕过直接搜文件。

3. **Tavily 有用量限制**：免费额度耗尽后会自动降级，备用方案是 `supplement_multi.py` 里的多引擎 fallback（DuckDuckGo → Bing → Brave）。

4. **ChromaDB 版本兼容性**：不同版本 ChromaDB 的索引格式不完全兼容，升级前建议备份 `chroma.sqlite3`。

5. **源码 grep 要有针对性**：不要全盘 grep，先用知识库定位到相关类，再精确定位方法。

---

> 搭建这套系统的价值在于：80% 的常见问题靠 ChromaDB 秒答，剩下 20% 的深度追问靠源码兜底，不需要每次都联网。持续维护好知识库，就是让自己的 AI 助手越来越懂 Minecraft。
