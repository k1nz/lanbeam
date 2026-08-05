#!/usr/bin/env sh
set -eu

REPOSITORY="${LANBEAM_REPOSITORY:-k1nz/lanbeam}"
INSTALL_DIR="${LANBEAM_INSTALL_DIR:-${XDG_BIN_HOME:-$HOME/.local/bin}}"
VERSION="latest"
SKIP_SHELL=0

usage() {
  cat <<'EOF'
安装 LanBeam 独立命令行程序。

用法：
  curl -fsSL https://lanbeam.k1nz.top/install.sh | bash

选项：
  --install-dir <目录>  指定安装目录（默认：~/.local/bin）
  --version <版本>      安装指定版本，例如 1.0.2（默认：最新版本）
  --skip-shell          不修改 shell 的 PATH 配置
  --help, -h            显示此帮助
EOF
}

fail() {
  printf '%s\n' "错误：$*" >&2
  exit 1
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --install-dir)
      [ "$#" -ge 2 ] || fail "--install-dir 需要一个目录参数"
      INSTALL_DIR=$2
      shift 2
      ;;
    --version)
      [ "$#" -ge 2 ] || fail "--version 需要一个版本号"
      VERSION=$2
      shift 2
      ;;
    --skip-shell)
      SKIP_SHELL=1
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      fail "未知选项：$1"
      ;;
  esac
done

case "$(uname -s)" in
  Darwin) OS=darwin ;;
  Linux) OS=linux ;;
  *) fail "暂不支持 $(uname -s)。请从 GitHub Releases 下载对应的可执行文件。" ;;
esac

case "$(uname -m)" in
  x86_64|amd64) ARCH=x64 ;;
  arm64|aarch64) ARCH=arm64 ;;
  *) fail "暂不支持 $(uname -m) 架构。" ;;
esac

if [ "$OS" = "linux" ] && [ "$ARCH" != "x64" ]; then
  fail "目前仅提供 Linux x64 独立版本。"
fi

ASSET="lanbeam-${OS}-${ARCH}"
CHECKSUM_ASSET="lanbeam-checksums.txt"
if [ "$VERSION" = "latest" ]; then
  RELEASE_URL="https://github.com/$REPOSITORY/releases/latest/download"
else
  VERSION=${VERSION#v}
  RELEASE_URL="https://github.com/$REPOSITORY/releases/download/v$VERSION"
fi

if command -v curl >/dev/null 2>&1; then
  download() {
    curl --fail --location --silent --show-error --proto '=https' --tlsv1.2 "$1" --output "$2"
  }
elif command -v wget >/dev/null 2>&1; then
  download() {
    wget -q "$1" -O "$2"
  }
else
  fail "需要 curl 或 wget 才能下载安装包。"
fi

TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/lanbeam.XXXXXX") || fail "无法创建临时目录。"
trap 'rm -rf "$TMP_DIR"' EXIT HUP INT TERM

printf '%s\n' "正在下载 LanBeam ($OS/$ARCH)..."
download "$RELEASE_URL/$ASSET" "$TMP_DIR/$ASSET" \
  || fail "无法下载 $ASSET。请检查版本号或 GitHub Release 是否已发布。"
download "$RELEASE_URL/$CHECKSUM_ASSET" "$TMP_DIR/$CHECKSUM_ASSET" \
  || fail "无法下载 SHA-256 校验文件。"

EXPECTED_HASH=$(awk -v asset="$ASSET" '$2 == asset { print $1; exit }' "$TMP_DIR/$CHECKSUM_ASSET")
[ -n "$EXPECTED_HASH" ] || fail "校验文件中未找到 $ASSET。"

if command -v sha256sum >/dev/null 2>&1; then
  ACTUAL_HASH=$(sha256sum "$TMP_DIR/$ASSET" | awk '{ print $1 }')
elif command -v shasum >/dev/null 2>&1; then
  ACTUAL_HASH=$(shasum -a 256 "$TMP_DIR/$ASSET" | awk '{ print $1 }')
else
  fail "需要 sha256sum 或 shasum 才能校验下载文件。"
fi

[ "$EXPECTED_HASH" = "$ACTUAL_HASH" ] || fail "SHA-256 校验失败，已取消安装。"

mkdir -p "$INSTALL_DIR" || fail "无法创建安装目录：$INSTALL_DIR"
install -m 755 "$TMP_DIR/$ASSET" "$INSTALL_DIR/lanbeam" \
  || fail "无法写入 $INSTALL_DIR/lanbeam"

add_to_path() {
  [ "$SKIP_SHELL" -eq 0 ] || return
  case "${SHELL:-}" in
    */fish)
      PROFILE="${XDG_CONFIG_HOME:-$HOME/.config}/fish/conf.d/lanbeam.fish"
      PATH_LINE="set -gx PATH '$INSTALL_DIR' \$PATH"
      ;;
    */zsh)
      PROFILE="${ZDOTDIR:-$HOME}/.zshrc"
      PATH_LINE="export PATH=\"$INSTALL_DIR:\$PATH\""
      ;;
    *)
      PROFILE="$HOME/.bashrc"
      PATH_LINE="export PATH=\"$INSTALL_DIR:\$PATH\""
      ;;
  esac

  mkdir -p "$(dirname "$PROFILE")"
  if [ -f "$PROFILE" ] && grep -Fq '# lanbeam PATH' "$PROFILE"; then
    return
  fi

  {
    printf '\n# lanbeam PATH\n'
    printf '%s\n' "$PATH_LINE"
  } >> "$PROFILE"
  printf '%s\n' "已将 $INSTALL_DIR 加入 $PROFILE 的 PATH。"
}

add_to_path
printf '\n%s\n' "LanBeam 已安装至 $INSTALL_DIR/lanbeam"
if command -v lanbeam >/dev/null 2>&1; then
  printf '%s\n' '现在可运行：lanbeam'
else
  printf '%s\n' "请重新打开终端，或执行：export PATH=\"$INSTALL_DIR:\$PATH\""
  printf '%s\n' '然后运行：lanbeam'
fi
