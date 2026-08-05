import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { networkInterfaces } from 'os';
import { WebSocketServer, WebSocket } from 'ws';
import type { RawData } from 'ws';
import type { AddressInfo } from 'net';
import type { Request, Response, NextFunction } from 'express';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const clientDistDir = process.env.LANBEAM_CLIENT_DIST || path.resolve(__dirname, '../../client/dist');
const VERSION = process.env.LANBEAM_VERSION || 'development';

// 创建 HTTP 服务器（供 Express 和 WebSocket 共用）
const server = http.createServer(app);

// WebSocket 服务
const wss = new WebSocketServer({ server });

// ws 会把 http server 的错误转发到 wss，必须有监听器兜底，
// 否则 EADDRINUSE 会先在这里抛出，导致端口重试逻辑无法执行
wss.on('error', (err: Error) => {
    if ((err as NodeJS.ErrnoException).code !== 'EADDRINUSE') {
        console.error('WebSocket 服务器错误:', err);
    }
});

// 共享文本状态
let sharedText = '';
// 共享图片列表（每条带唯一 id 与上传时间，限制条数与单张大小，防止内存无限增长）
let sharedImages: SharedImage[] = [];
const MAX_IMAGES = 20;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 单张 10MB

// 向其他客户端广播 JSON 消息
const broadcastJSON = (ws: WebSocket, payload: Buffer | string) => {
    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
};

// 生成二进制帧：2 字节头部长度 + JSON 头（仅元数据）+ 图片字节
const buildImageFrame = (id: string, timestamp: string, mimeType: string, data: Buffer): Buffer => {
    const header: ImageAddHeader = {
        type: 'image-add-binary',
        image: { id, mimeType }
    };
    const headerBuf = Buffer.from(JSON.stringify(header));
    const lenBuf = Buffer.alloc(2);
    lenBuf.writeUInt16BE(headerBuf.length);
    return Buffer.concat([lenBuf, headerBuf, data]);
};

// 解析二进制帧，返回 { header, imageBytes }
const parseImageFrame = (buf: Buffer): { header: ImageAddHeader; imageBytes: Buffer } => {
    const headerLen = buf.readUInt16BE(0);
    const header = JSON.parse(buf.slice(2, 2 + headerLen).toString()) as ImageAddHeader;
    const imageBytes = buf.subarray(2 + headerLen);
    return { header, imageBytes };
};

// 发送完整状态（文本 + 图片元数据），随后逐个发送图片二进制数据
const sendFullState = (ws: WebSocket) => {
    ws.send(JSON.stringify({
        type: 'text-state',
        text: sharedText,
        images: sharedImages.map(({ id, timestamp }) => ({ id, timestamp }))
    }));
    sharedImages.forEach((image) => {
        ws.send(buildImageFrame(image.id, image.timestamp, image.mimeType, image.data));
    });
};

// 在内存中保留最近的图片（同 id 覆盖，防止重复；data 仅用于新连接重放）
const keepImage = (id: string, timestamp: string, mimeType: string, data: Buffer) => {
    sharedImages = sharedImages.filter((img) => img.id !== id);
    sharedImages.push({ id, timestamp, mimeType, data });
    if (sharedImages.length > MAX_IMAGES) {
        sharedImages.splice(0, sharedImages.length - MAX_IMAGES);
    }
};

// ws 文本/二进制数据统一转成 Buffer（兼容 Buffer、ArrayBuffer、Buffer[] 三种形态）
const toBuffer = (data: RawData): Buffer => {
    if (Buffer.isBuffer(data)) return data;
    if (data instanceof ArrayBuffer) return Buffer.from(data);
    return Buffer.concat(data);
};

wss.on('connection', (ws: WebSocket) => {
    console.log('🔗 新客户端已连接到文本共享');

    // 发送当前文本和图片状态给新客户端
    sendFullState(ws);

    ws.on('message', (data, isBinary) => {
        // 图片以二进制帧传输（客户端本地已有字节，服务器转发即可，无需额外存储）
        if (isBinary) {
            const buf = toBuffer(data);
            try {
                const { header, imageBytes } = parseImageFrame(buf);
                if (header.type === 'image-add-binary') {
                    if (imageBytes.length > MAX_IMAGE_BYTES) {
                        console.warn(`⚠️  图片过大被拒绝: ${(imageBytes.length / 1024 / 1024).toFixed(2)}MB`);
                        return;
                    }
                    const { id, mimeType } = header.image;
                    const timestamp = new Date().toISOString();
                    keepImage(id, timestamp, mimeType, imageBytes);
                    // 广播给所有其他客户端（重新组装，头部只含元数据）
                    broadcastJSON(ws, buildImageFrame(id, timestamp, mimeType, imageBytes));
                }
            } catch (e) {
                console.error('WebSocket 图片消息解析错误:', e);
            }
            return;
        }

        try {
            const message = JSON.parse(toBuffer(data).toString()) as WsMessage;
            if (message.type === 'text-update') {
                sharedText = message.text ?? '';
                // 广播给所有其他客户端
                broadcastJSON(ws, JSON.stringify({ type: 'text-update', text: sharedText }));
            } else if (message.type === 'image-delete') {
                const id = message.id;
                const removed = sharedImages.find((img) => img.id === id);
                if (removed) {
                    // 从内存中移除，避免被后续连接的新客户端重放
                    sharedImages = sharedImages.filter((img) => img.id !== id);
                }
                broadcastJSON(ws, JSON.stringify({ type: 'image-delete', id }));
            }
        } catch (e) {
            console.error('WebSocket 消息解析错误:', e);
        }
    });

    ws.on('close', () => {
        console.log('🔌 客户端已断开文本共享');
    });
});

// 解析命令行参数
const args = process.argv.slice(2);
let maxFileSize = 200; // 默认200MB

// 查找文件大小限制参数
const maxSizeIndex = args.indexOf('--max-size');
if (maxSizeIndex !== -1 && args[maxSizeIndex + 1]) {
    const sizeArg = args[maxSizeIndex + 1];
    const parsedSize = parseInt(sizeArg);
    if (!isNaN(parsedSize) && parsedSize > 0) {
        maxFileSize = parsedSize;
    } else {
        console.log(`⚠️  无效的文件大小限制参数: ${sizeArg}，使用默认值 ${maxFileSize}MB`);
    }
}

// 也支持环境变量
if (process.env.MAX_FILE_SIZE) {
    const envSize = parseInt(process.env.MAX_FILE_SIZE);
    if (!isNaN(envSize) && envSize > 0) {
        maxFileSize = envSize;
    }
}

// 确保上传目录存在
const uploadDir = process.env.LANBEAM_UPLOAD_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// CORS 配置 - 允许局域网访问
const corsOptions: cors.CorsOptions = {
    origin: function (origin, callback) {
        // 允许没有 origin 的请求（如移动应用、Postman）
        if (!origin) return callback(null, true);

        // 允许所有 localhost 和局域网地址
        const allowedOrigins = [
            /^http:\/\/localhost(:\d+)?$/,
            /^http:\/\/127\.0\.0\.1(:\d+)?$/,
            /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
            /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,
            /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}(:\d+)?$/
        ];

        const isAllowed = allowedOrigins.some(pattern => pattern.test(origin));

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log(`❌ CORS: 拒绝来自 ${origin} 的请求`);
            callback(new Error('不允许的 CORS 来源'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// 中间件
app.use(cors(corsOptions));
app.use(express.json());

// 配置 multer 用于文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // 确保正确处理中文文件名
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        // 直接使用原文件名，稍后在上传处理中处理路径
        cb(null, originalName);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: maxFileSize * 1024 * 1024, // 使用配置的文件大小限制
    },
    fileFilter: (req, file, cb) => {
        // 这里可以添加文件类型过滤逻辑
        cb(null, true);
    }
});

// 健康检查接口（客户端用于识别并自动发现 LanBeam 服务）
app.get('/api/health', (req: Request, res: Response) => {
    const address = server.address() as AddressInfo | null;
    res.json({
        message: '文件传输服务器运行中',
        version: VERSION,
        port: address ? address.port : currentPort,
        endpoints: {
            upload: 'POST /api/upload',
            files: 'GET /api/files',
            download: 'GET /api/download/:filename'
        }
    });
});

// 检查文件是否存在接口
app.post('/api/check-files', (req: Request, res: Response) => {
    try {
        const { fileNames } = req.body as { fileNames?: unknown };

        if (!fileNames || !Array.isArray(fileNames)) {
            return res.status(400).json({
                success: false,
                message: '请提供文件名列表'
            });
        }

        const conflicts: string[] = [];
        (fileNames as string[]).forEach(fileName => {
            const filePath = path.join(uploadDir, fileName);

            // 安全检查：确保文件路径在上传目录内
            if (!filePath.startsWith(uploadDir)) {
                return;
            }

            if (fs.existsSync(filePath)) {
                conflicts.push(fileName);
            }
        });

        res.json({
            success: true,
            conflicts: conflicts
        });
    } catch (error) {
        console.error('检查文件冲突错误:', error);
        res.status(500).json({
            success: false,
            message: '检查文件冲突失败',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// 文件上传接口
app.post('/api/upload', upload.array('files'), (req: Request, res: Response) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: '没有接收到文件'
            });
        }

        const uploadedFiles: UploadedFile[] = [];
        // upload.array('files') 保证 req.files 是数组形态
        const files = req.files as Express.Multer.File[];

        // 处理每个文件
        files.forEach((file, index) => {
            // 正确解码中文文件名
            const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

            // 获取相对路径
            const fieldName = `relativePath[files[${index}]]`;
            const relativePath = req.body[fieldName] || originalName;

            // 如果有相对路径且不等于文件名，说明是文件夹上传
            if (relativePath !== originalName) {
                // 计算目标路径
                const targetDir = path.join(uploadDir, path.dirname(relativePath));
                const targetPath = path.join(uploadDir, relativePath);

                // 确保目标目录存在
                if (!fs.existsSync(targetDir)) {
                    fs.mkdirSync(targetDir, { recursive: true });
                }

                // 移动文件到正确的位置
                fs.renameSync(file.path, targetPath);

                uploadedFiles.push({
                    originalName: originalName,
                    filename: path.basename(relativePath),
                    relativePath: relativePath,
                    fullPath: relativePath,
                    size: file.size,
                    mimetype: file.mimetype,
                    uploadTime: new Date().toISOString()
                });
            } else {
                // 普通文件上传，文件已经在正确位置
                uploadedFiles.push({
                    originalName: originalName,
                    filename: file.filename,
                    relativePath: originalName,
                    fullPath: originalName,
                    size: file.size,
                    mimetype: file.mimetype,
                    uploadTime: new Date().toISOString()
                });
            }
        });

        console.log(`成功上传 ${uploadedFiles.length} 个文件:`);
        uploadedFiles.forEach(file => {
            console.log(`- ${file.relativePath} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        });

        res.json({
            success: true,
            message: `成功上传 ${uploadedFiles.length} 个文件`,
            files: uploadedFiles
        });

    } catch (error) {
        console.error('文件上传错误:', error);
        res.status(500).json({
            success: false,
            message: '文件上传失败',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// 递归读取文件夹结构
const readDirectoryStructure = (dir: string, relativePath = ''): FileItem[] => {
    const items: FileItem[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const itemRelativePath = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
            // 递归读取子文件夹
            const children = readDirectoryStructure(fullPath, itemRelativePath);
            items.push({
                name: entry.name,
                type: 'directory',
                path: itemRelativePath,
                children: children
            });
        } else {
            // 文件
            const stats = fs.statSync(fullPath);
            items.push({
                name: entry.name,
                type: 'file',
                path: itemRelativePath,
                size: stats.size,
                uploadTime: stats.birthtime.toISOString(),
                modifyTime: stats.mtime.toISOString()
            });
        }
    }

    return items;
};

// 获取已上传文件列表
app.get('/api/files', (req: Request, res: Response) => {
    try {
        const fileStructure = readDirectoryStructure(uploadDir);

        res.json({
            success: true,
            files: fileStructure
        });
    } catch (error) {
        console.error('获取文件列表错误:', error);
        res.status(500).json({
            success: false,
            message: '获取文件列表失败',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// 文件下载接口
app.get('/api/download/*', (req: Request, res: Response) => {
    try {
        // 获取完整的文件路径（支持子文件夹）
        const filePath = req.params[0];
        const fullPath = path.join(uploadDir, filePath);

        // 安全检查：确保文件路径在上传目录内
        if (!fullPath.startsWith(uploadDir)) {
            return res.status(403).json({
                success: false,
                message: '访问被拒绝'
            });
        }

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({
                success: false,
                message: '文件不存在'
            });
        }

        // 获取文件名用于下载
        const filename = path.basename(filePath);

        res.download(fullPath, filename, (err) => {
            if (err) {
                console.error('文件下载错误:', err);
                res.status(500).json({
                    success: false,
                    message: '文件下载失败'
                });
            }
        });
    } catch (error) {
        console.error('文件下载错误:', error);
        res.status(500).json({
            success: false,
            message: '文件下载失败',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// 删除文件接口
app.delete('/api/files/*', (req: Request, res: Response) => {
    try {
        // 获取完整的文件路径（支持子文件夹）
        const filePath = req.params[0];
        const fullPath = path.join(uploadDir, filePath);

        // 安全检查：确保文件路径在上传目录内
        if (!fullPath.startsWith(uploadDir)) {
            return res.status(403).json({
                success: false,
                message: '访问被拒绝'
            });
        }

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({
                success: false,
                message: '文件不存在'
            });
        }

        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            // 删除文件夹及其内容
            fs.rmSync(fullPath, { recursive: true, force: true });
            res.json({
                success: true,
                message: '文件夹删除成功'
            });
        } else {
            // 删除文件
            fs.unlinkSync(fullPath);
            res.json({
                success: true,
                message: '文件删除成功'
            });
        }
    } catch (error) {
        console.error('文件删除错误:', error);
        res.status(500).json({
            success: false,
            message: '文件删除失败',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

// 错误处理中间件
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: `文件大小超过限制 (${maxFileSize}MB)`
            });
        }
    }

    console.error('服务器错误:', error);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
});

// npm 包运行时托管构建后的客户端；本地开发没有构建产物时保留 JSON 根路由。
if (fs.existsSync(clientDistDir)) {
    app.use(express.static(clientDistDir));
    app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(clientDistDir, 'index.html'));
    });
} else {
    app.get('/', (req: Request, res: Response) => {
        res.json({
            message: '文件传输服务器运行中',
            version: '1.0.0'
        });
    });
}

// 获取本机 IP 地址的函数
const getLocalIPAddress = (): string[] => {
    const results: string[] = [];

    try {
        const nets = networkInterfaces();
        for (const name of Object.keys(nets)) {
            const interfaces = nets[name];
            if (!interfaces) continue;
            for (const net of interfaces) {
                // 跳过非 IPv4 和内部（即 127.x.x.x）地址
                if (net.family === 'IPv4' && !net.internal) {
                    results.push(net.address);
                }
            }
        }
    } catch (error) {
        console.warn('⚠️  无法读取局域网 IP 地址:', error instanceof Error ? error.message : error);
    }

    return results;
};

// 启动服务器 - 监听所有网络接口
// 端口被占用时自动递增重试（最多尝试 20 个端口）
const MAX_PORT_ATTEMPTS = 20;
let currentPort = PORT;
let attempts = 0;

const tryListen = () => {
    server.once('error', (err) => {
        const code = (err as NodeJS.ErrnoException).code;
        if (code === 'EADDRINUSE' && attempts < MAX_PORT_ATTEMPTS) {
            const oldPort = currentPort;
            currentPort++;
            attempts++;
            console.log(`⚠️  端口 ${oldPort} 已被占用，尝试切换到端口 ${currentPort}...`);
            tryListen();
        } else {
            console.error(`❌ 无法监听端口 ${currentPort}${code === 'EADDRINUSE' ? `（已尝试 ${MAX_PORT_ATTEMPTS} 个端口）` : ''}:`, err.message);
            process.exit(1);
        }
    });

    server.listen(currentPort, '0.0.0.0');
};

server.on('listening', () => {
    const localIPs = getLocalIPAddress();

    console.log(`🚀 文件传输服务器已启动`);
    console.log(`📁 文件存储目录: ${uploadDir}`);
    console.log(`📏 文件大小限制: ${maxFileSize}MB`);
    if (fs.existsSync(clientDistDir)) {
        console.log(`🖥️  客户端资源目录: ${clientDistDir}`);
    }
    if (currentPort !== PORT) {
        console.log(`🔀 端口 ${PORT} 被占用，实际监听端口: ${currentPort}`);
    }
    console.log(`\n🌐 访问地址:`);
    console.log(`   本地访问: http://localhost:${currentPort}`);
    console.log(`   本地访问: http://127.0.0.1:${currentPort}`);

    if (localIPs.length > 0) {
        console.log(`\n🔗 局域网访问:`);
        localIPs.forEach(ip => {
            console.log(`   http://${ip}:${currentPort}`);
        });
        console.log(`\n💡 其他设备可以通过上述局域网地址访问文件传输服务`);
    } else {
        console.log(`\n⚠️  未检测到局域网 IP 地址`);
    }

    console.log(`\n📋 API 端点:`);
    console.log(`   GET  /api/health    - 服务器信息`);
    console.log(`   POST /api/upload    - 文件上传`);
    console.log(`   GET  /api/files     - 文件列表`);
    console.log(`   GET  /api/download  - 文件下载`);
    console.log(`   WS   /              - 文本实时共享`);
    console.log(`\n⚙️  启动参数:`);
    console.log(`   --max-size <MB>     - 设置文件大小限制 (当前: ${maxFileSize}MB)`);
    console.log(`   例如: lanbeam --max-size 200`);
});

tryListen();

// ===== 类型定义 =====

// 内存中共享的图片
interface SharedImage {
    id: string;
    timestamp: string;
    mimeType: string;
    data: Buffer;
}

// 二进制帧头（仅元数据，不含图片字节）
interface ImageAddHeader {
    type: 'image-add-binary';
    image: { id: string; mimeType: string };
}

// WebSocket 文本消息
type WsMessage =
    | { type: 'text-update'; text?: string }
    | { type: 'image-delete'; id: string };

// 上传结果条目
interface UploadedFile {
    originalName: string;
    filename: string;
    relativePath: string;
    fullPath: string;
    size: number;
    mimetype: string;
    uploadTime: string;
}

// 文件树节点（/api/files 返回结构，与前端 client/src/types.ts 对应）
interface FileItem {
    name: string;
    type: 'file' | 'directory';
    path: string;
    size?: number;
    uploadTime?: string;
    modifyTime?: string;
    children?: FileItem[];
}
