# LanBeam

[English](./README.md)

LanBeam 是一个用于局域网的轻量文件传输和实时分享工具。在一台设备上启动服务后，同一网络内的其他设备用浏览器打开终端显示的地址即可使用。无需账号，也不依赖云端服务。

## 可以做什么

- 上传文件或文件夹，在共享列表中浏览、下载和删除。
- 在多台已打开的设备之间同步一段共享文本。
- 直接在文本框粘贴图片，立即分享给其他设备；服务器只在内存中保留最近 20 张图片。
- 从页面复制局域网地址，发送给其他设备打开。

上传文件保存在运行 LanBeam 的电脑上。共享文本和图片只存在内存中，服务停止后会清除。

## 快速开始

### macOS 和 Linux

通过独立命令行程序安装，不需要预装 Node.js：

```bash
curl -fsSL https://lanbeam.k1nz.top/install.sh | bash
lanbeam
```

安装器会下载经过 SHA-256 校验的 macOS（Apple Silicon 或 Intel）或 Linux x64 程序，安装至 `~/.local/bin`，并在需要时将该目录写入当前 shell 的启动文件。安装指定版本或不修改 shell 配置：

```bash
curl -fsSL https://lanbeam.k1nz.top/install.sh | bash -s -- --version 1.0.2 --skip-shell
```

### Windows

在 [Windows Package Manager](https://github.com/microsoft/winget-pkgs) 清单审核合并后，可安装便携命令行程序：

```powershell
winget install k1nz.LanBeam
```

在此之前，请从 [GitHub Releases](https://github.com/k1nz/lanbeam/releases) 下载 `lanbeam-win-x64.exe`，在希望保存上传文件的目录中运行：

```powershell
.\lanbeam-win-x64.exe
```

在浏览器中打开终端显示的任一地址。上传文件保存到当前目录的 `lanbeam-files/`。首次运行时，Windows 可能会请求 SmartScreen 或防火墙确认；若需要供局域网设备访问，请允许 LanBeam 使用专用网络。

### npm 替代方式

需要 Node.js 18 或更高版本：

```bash
npm install --global lanbeam
lanbeam
```

命令会输出本机和局域网访问地址。上传文件保存到执行命令时当前目录的 `lanbeam-files/`。

### 卸载

删除已安装的程序，并从 shell 配置文件中移除安装器添加的 `# lanbeam PATH` 配置块：

```bash
rm -f ~/.local/bin/lanbeam
```

### 从源码运行

需要 Node.js 18+ 和 pnpm 8+：

```bash
pnpm install
pnpm dev
```

开发模式下，客户端运行在 `http://localhost:3000`，API 运行在 `http://localhost:3001`。

## 命令行参数

```bash
# 指定端口
lanbeam --port 8080

# 将单个上传文件限制为 500 MB
lanbeam --max-size 500

# 查看全部参数
lanbeam --help
```

Windows 免安装版支持相同的参数。默认单个文件最大为 200 MB；指定端口被占用时，LanBeam 会继续尝试下一个可用端口。

## 让其他设备访问

1. 确保设备连接到同一个 Wi-Fi 或有线网络。
2. 启动 LanBeam，复制终端显示的局域网地址。
3. 在另一台设备的浏览器中打开该地址。

从源码开发时，可以执行 `pnpm network` 查看局域网 IP。客户端地址为 `http://<电脑 IP>:3000`；如有需要，可在页面的设置按钮中将服务端地址设为 `http://<电脑 IP>:3001`。

## 从源码构建

```bash
pnpm build          # 构建客户端和服务端
pnpm start          # 启动构建后的服务端
pnpm package:all    # 生成所有平台的独立程序
```

构建独立程序需要 Node.js 24；npm CLI 和普通源码开发仍支持 Node.js 18+。

## 发布

所有面向用户的改动都记录在 [CHANGELOG.md](./CHANGELOG.md)。准备发布时，先将 `Unreleased` 中需要发布的内容移入对应版本章节，再创建 Git 标签。

推送类似 `v1.0.0` 的 Git 标签后，GitHub Actions 会自动发布 macOS、Linux、Windows 独立程序、SHA-256 校验文件、生成的 winget 清单，以及 `CHANGELOG.md` 中对应版本的发布说明。标签版本必须与 `package.json` 一致；发布 npm 包需要配置仓库的 `NPM_TOKEN` Secret。

GitHub Pages/DNS 设置与每个 Windows 版本的 winget 提交流程见[发布维护说明](./docs/releasing.md)。

## 技术栈

- TypeScript，使用 `tsgo` 编译
- React、Vite 和 Tailwind CSS
- Node.js、Express、Multer 和 `ws`

## 许可证

[MIT](./LICENSE)
