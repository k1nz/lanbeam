#!/usr/bin/env node

const path = require('node:path');

const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
LanBeam - 局域网文件传输与实时分享工具

用法:
  lanbeam [选项]

选项:
  --port <port>       指定服务端口（默认 3001）
  --max-size <MB>     设置单个文件最大大小（默认 200）
  --help, -h          显示帮助

上传的文件默认保存在当前目录的 lanbeam-files/ 中。
`);
    process.exit(0);
}

if (portIndex !== -1) {
    const port = Number(args[portIndex + 1]);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        console.error('错误：--port 必须是 1 到 65535 之间的整数。');
        process.exit(1);
    }
    args.splice(portIndex, 2);
    process.env.PORT = String(port);
}

const packageRoot = path.resolve(__dirname, '..');
process.env.LANBEAM_UPLOAD_DIR = process.env.LANBEAM_UPLOAD_DIR
    || path.resolve(process.cwd(), 'lanbeam-files');
process.env.LANBEAM_CLIENT_DIST = path.join(packageRoot, 'client', 'dist');

// 必须在当前进程加载服务端。单文件可执行版中 process.execPath 指向
// LanBeam 自身，派生执行会导致可执行文件无限递归启动。
if (process.pkg) {
    // EXE 使用预先打包的服务端，避免 pnpm 工作区软链接进入虚拟文件系统。
    require('../dist-executable/server.js');
} else {
    // npm 安装仍使用原有服务端构建产物，不增加发布包体积。
    require(path.join(packageRoot, 'server', 'dist', 'index.js'));
}
