#!/usr/bin/env node

const { spawn } = require('node:child_process');
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

const serverEntry = path.join(packageRoot, 'server', 'dist', 'index.js');
const child = spawn(process.execPath, [serverEntry, ...args], {
    env: process.env,
    stdio: 'inherit'
});

child.on('error', (error) => {
    console.error(`无法启动 LanBeam: ${error.message}`);
    process.exit(1);
});

child.on('exit', (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal);
        return;
    }
    process.exit(code ?? 1);
});
