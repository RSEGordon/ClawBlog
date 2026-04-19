---
title: 龙虾养殖 · 002 - 个人建站实录
date: 2026-04-19 00:52:00
categories: [龙虾养殖]
cover: /images/cover-lobster-002.png
tags: [建站, OpenClaw]
---

# 龙虾养殖 · 002 - 个人建站实录

> 记录一次把文件共享、系统监控、博客导航合并到同一个服务里的折腾。

---

## 整体架构

```
combined_app5.py (Flask)
  ├── 📁 文件共享   /files/*
  ├── 📊 系统监控   /api/status
  └── 🧭 博客导航栏 → https://clawblog.rseg.club/

systemd: combined.service
  └── 进程管理 + 自启

博客: serve.cjs (独立 Node.js 静态服务)
  └── 由 systemd 托管
```

**三件事合一**，省去了以前三个服务各自为战的麻烦。

---

## 服务信息

| 项目 | 值 |
|------|-----|
| 端口 | 19995 |
| systemd 服务 | `combined.service` |
| 共享目录 | `~/桌面/OpenClawFile/FileShare/` |
| 直链前缀 | `https://frp-run.com:45775/files/download/` |

---

## 功能说明

### 📁 文件共享
Morandi 风格界面，支持：
- 文件夹浏览、排序（名称/大小/时间）
- 文件上传（批量、XHR 进度条）
- 分享链接生成（直链直接复制）
- 中文文件名自动 URL 编码

### 📊 CPU 各核心监控
读取 `/proc/stat`，每次取差值计算使用率，各核心独立柱状图，颜色按负载分三档（绿/黄/红）。

### 🖥️ 系统总览
- CPU 型号 + 总占用率
- 内存占用条
- 磁盘使用情况
- 网络接口流量（实时速率）
- TOP 15 进程
- 系统负载（1/5/15 分钟）

### 🦞 OpenClaw gateway 监控
通过 `ps aux` + `/proc/<pid>/fd` 识别三个实例（main / jim / hjkv），实时显示 CPU 和内存占用。

### 🌤️ 威海天气
调用 `wttr.in/Weihai`，每页显示温度、紫外线、风速、日出日落。

### 📝 导航栏
页面顶部三个入口：**📊 监控** / **📁 共享** / **📝 博客**，当前页高亮。

---

## 文件路径规范

```
combined_app5.py      ← 主脚本（~/桌面/OpenClawFile/）
templates/index.html  ← 监控页面模板（~/桌面/OpenClawFile/templates/）
morandi.css           ← 主题样式（/tmp/morandi.css，systemd ExecStartPre 复制）
FileShare/            ← 共享文件根目录（~/桌面/OpenClawFile/FileShare/）
```

> 注意：`/tmp/combined_app5.py` 会在重启后消失，只用 `~/桌面/OpenClawFile/` 下的版本。

直链生成格式：
```
https://frp-run.com:45775/files/download/<URL编码文件名>
```
中文文件名直接拼文件名即可，自动 URL 编码。

---

## 服务管理命令

```bash
# 查看服务状态
systemctl --user status combined

# 检查端口
ss -tlnp | grep 19995

# 查看最近日志
journalctl --user -u combined -n 20

# 重启服务
systemctl --user restart combined

# 查看 serve.cjs 是否在跑
ps aux | grep serve.cjs
```

---

## 关键配置说明

### systemd 服务文件
`~/.config/systemd/user/combined.service`

- `ExecStartPre`：把 `morandi.css` 复制到 `/tmp/`
- `ExecStart`：运行 `combined_app5.py`
- `Restart`：always（崩溃自动重启）

### 内网穿透
frp 映射 `19995` 端口到 `frp-run.com:45775`，外网直接访问。

### 禁止使用
- `upload_server.py` — 彻底弃用
- x11vnc / websockify — 已从 `combined_app5.py` 删除

---

## 本次更新日志

- 2026-04-19：合并文件共享 + 系统监控到 `combined_app5.py`，统一导航栏，systemd 自启

---

## 附件直链

- [combined_app5.py](https://frp-run.com:45775/files/download/blogfile/combined_app5.py)
- [templates/index.html](https://frp-run.com:45775/files/download/blogfile/index.html)
