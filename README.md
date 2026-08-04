# 📂 文件传输助手 / File Transfer Assistant

> 一个轻量级的局域网文件传输与共享工具。无需注册登录，同一网络下的电脑、手机、平板打开浏览器即可互相传输文件、实时共享文本和图片。
>
> A lightweight LAN file transfer and sharing tool. No sign-up required — devices on the same network can transfer files and share text & images in real time right from the browser.

---

## ✨ 功能特性 / Features

### 📁 文件传输 / File Transfer

- 拖拽或点击上传文件，支持上传整个文件夹
- 目录树形式浏览已上传文件，支持下载与删除
- 正确处理中文文件名，不再出现乱码
- 上传时自动检测同名冲突，避免误覆盖

- Drag & drop or click to upload files, whole folders included
- Browse uploaded files in a tree view; download or delete anytime
- Correct handling of Chinese filenames — no more garbled names
- Automatic conflict detection on upload to prevent accidental overwrites

### 💬 实时文本共享 / Real-time Text Sharing

- 基于 WebSocket 实时同步，输入即所见
- 同一网络下的所有设备同步显示内容
- 新加入的设备自动获取当前共享内容

- Real-time sync over WebSocket — what you type appears instantly
- Every device on the same network sees the same content
- Newly connected devices automatically receive the current content

### 🖼️ 实时图片共享 / Real-time Image Sharing

- 在文本框中直接按 `Ctrl+V` 粘贴图片即可实时共享
- 支持点击放大预览、复制图片、删除图片
- 内存保留最近 20 张图片，单张不超过 10MB

- Press `Ctrl+V` in the text box to share an image instantly
- Click to preview full-size, copy or delete images
- Keeps the latest 20 images in memory, max 10MB each

### 🌐 局域网访问 / LAN Access

- 手机、平板连接同一 WiFi 即可访问
- 服务器自动发现：自动探测 3001–3020 端口
- 一键复制分享链接，发送给其他设备即可打开

- Accessible from phones & tablets on the same WiFi
- Server auto-discovery: scans ports 3001–3020
- One-click share link — send it to any device and it opens right away

### ⚙️ 灵活配置 / Flexible Configuration

- 可动态配置服务器地址，支持局域网与远程服务器
- 可自定义文件大小限制（默认 100MB）
- 端口被占用时自动递增切换

- Dynamic server URL configuration for LAN or remote servers
- Configurable file size limit (100MB by default)
- Auto-increments to the next free port when one is taken

---

## 🚀 快速开始 / Quick Start

### 环境要求 / Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8

### 安装与启动 / Install & Run

```bash
# 全局安装并启动（推荐）/ Install globally and start
npm i -g lanbeam
lanbeam

# 安装依赖 / Install dependencies
pnpm install

# 同时启动服务端和客户端 / Start server & client together
pnpm dev
```

使用 `lanbeam` 后，打开终端显示的地址即可。默认地址为 `http://localhost:3001`，同一局域网内的设备可通过终端显示的局域网地址访问。上传文件会保存到执行命令时当前目录的 `lanbeam-files/`。

After running `lanbeam`, open the URL printed in the terminal. The default is `http://localhost:3001`; devices on the same LAN can use the printed LAN URL. Uploaded files are stored in `lanbeam-files/` within the directory where you run the command.

本地开发时启动后打开浏览器访问 / When developing locally, open:

| 入口 / Entry | 地址 / Address |
| --- | --- |
| 客户端界面 / Client UI | http://localhost:3000 |
| 服务端 API / Server API | http://localhost:3001 |

### CLI 参数 / CLI Options

```bash
# 指定端口 / Set the port
lanbeam --port 8080

# 设置单文件最大大小（MB）/ Set the max single-file size in MB
lanbeam --max-size 500
```

### 生产构建 / Production Build

```bash
pnpm build        # 构建客户端 / Build the client
pnpm start        # 启动服务端 / Start the server
```

---

## 📖 使用指南 / Usage Guide

### 传输文件 / Transfer Files

1. 打开「文件传输」标签页 / Open the **File Transfer** tab
2. 点击上传区域或直接拖拽文件 / 文件夹 / Click the upload area or drag & drop files / folders
3. 上传完成后，可在「附加文件」列表中浏览、下载或删除 / Once uploaded, browse, download or delete them in the **Attachments** list

### 实时共享文本与图片 / Share Text & Images in Real Time

1. 切换到「文本共享」标签页 / Switch to the **Text Share** tab
2. 输入文本，其他设备实时同步 / Type text — other devices see it instantly
3. 在文本框中粘贴图片，即可共享给所有人 / Paste an image into the text box to share it with everyone

### 服务器设置 / Server Settings

点击右上角的服务器设置图标，可配置要连接的服务器地址（支持局域网或远程服务器），设置会自动保存，下次打开无需重新配置。

Click the server settings icon in the top-right to configure the server address (LAN or remote). Your choice is saved automatically, so you won't need to reconfigure next time.

### 分享给其他设备 / Share with Other Devices

点击右上角的分享按钮，复制页面链接，将链接发送给同一网络下的其他设备，对方浏览器打开即可使用。

Click the share button in the top-right to copy the page URL. Send it to any device on the same network and they can start using the tool immediately.

---

## 📱 手机访问 / Mobile Access

1. 确保手机与电脑连接**同一个 WiFi** / Make sure your phone and computer are on the **same WiFi**
2. 查看电脑的局域网 IP（运行 `pnpm network` 即可显示） / Find your computer's LAN IP (run `pnpm network` to see it)
3. 手机浏览器访问 `http://<电脑IP>:3000` / Open `http://<computer-IP>:3000` in your phone browser
4. 若提示未连接服务器，在「服务器设置」中填写 `http://<电脑IP>:3001` / If it says no server connected, enter `http://<computer-IP>:3001` in **Server Settings**

---

## ⚙️ 常用配置 / Common Configuration

### 自定义文件大小限制 / Custom File Size Limit

默认最大 **100MB**，可通过启动参数修改 / The default limit is **100MB**. Change it with a startup argument:

```bash
# 使用命令行参数（单位为 MB）/ Command-line argument (in MB)
node server/dist/index.js --max-size 200

# 或使用环境变量 / Or via environment variable
MAX_FILE_SIZE=200 pnpm dev:server
```

---

## 🛠️ 技术栈 / Tech Stack

- **语言 / Language**：TypeScript（编译器使用 Go 版原生编译器 tsgo / the native Go compiler tsgo）
- **前端 / Frontend**：React + Vite + Tailwind CSS
- **后端 / Backend**：Node.js + Express + Multer
- **实时通信 / Real-time**：WebSocket (ws)

---

## 📄 许可证 / License

[MIT](./LICENSE)
