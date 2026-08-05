# 发布维护

## 首次配置

### 安装器域名

安装脚本由 GitHub Pages 工作流从 `site/` 部署，`site/CNAME` 已指定 `lanbeam.k1nz.top`。在首次发布前：

1. 在 DNS 服务商中为 `lanbeam.k1nz.top` 创建 CNAME，目标为 `k1nz.github.io`。
2. 在 GitHub 仓库的 Pages 设置中选择 **GitHub Actions** 作为部署来源，并设置自定义域名 `lanbeam.k1nz.top`。
3. 等待 GitHub 完成 DNS 检查并启用 HTTPS。
4. 推送 `site/` 或手动运行 “Deploy installer site” 工作流，确认 `https://lanbeam.k1nz.top/install.sh` 返回脚本内容。

安装脚本只从 `https://github.com/k1nz/lanbeam/releases` 下载发布资产，并在安装前与 `lanbeam-checksums.txt` 中的 SHA-256 校验值比对。

### npm

在仓库 Actions secrets 中创建 `NPM_TOKEN`，其权限应只允许发布 `lanbeam` 包。发布工作流会确认 Git 标签（去掉 `v`）等于根 `package.json` 的版本后才执行 `npm publish --access public`。

## 发布步骤

1. 将用户可见变更从 `CHANGELOG.md` 的 `Unreleased` 移入新版本章节。
2. 同步更新根 `package.json` 的版本，并运行：

   ```bash
   pnpm install --lockfile-only
   pnpm typecheck
   npm pack --dry-run
   ```

3. 提交变更，创建与版本一致的标签，例如 `v1.0.3`，并推送标签。
4. 等待 “Release LanBeam” 工作流完成。它会发布：
   - `lanbeam-linux-x64`
   - `lanbeam-darwin-x64`
   - `lanbeam-darwin-arm64`
   - `lanbeam-win-x64.exe`
   - `lanbeam-checksums.txt`
   - `lanbeam-winget-manifests.zip`

所有独立二进制文件均由 Node.js 24 打包；npm 安装仍支持 Node.js 18 及以上版本。

## 提交 winget

GitHub Release 附带的 `lanbeam-winget-manifests.zip` 包含 `k1nz.LanBeam` 的三文件清单，并已经在 CI 中执行 `winget validate`。清单使用 `InstallerType: portable` 与 `Commands: [lanbeam]`，直接指向 Release 中的 `lanbeam-win-x64.exe`。要使用户可运行 `winget install k1nz.LanBeam`：

1. Fork [microsoft/winget-pkgs](https://github.com/microsoft/winget-pkgs)。
2. 将压缩包中的 `manifests/k/k1nz/LanBeam/<版本>/` 复制到 fork 的相同路径。
3. 在 Windows 中运行：

   ```powershell
   winget validate --manifest manifests/k/k1nz/LanBeam/<版本>
   ```

4. 向 `microsoft/winget-pkgs` 提交仅包含该版本清单的 Pull Request，等待审核并合并。

winget 会从 GitHub Release 下载 `lanbeam-win-x64.exe`，并按照清单中的 SHA-256 验证文件。每次发布都必须提交新的清单，不能复用旧版本的哈希。
