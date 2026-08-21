@echo off
chcp 65001 >nul
title dsh-harness-zh-l10n — 应用中文汉化
setlocal

echo ============================================
echo  dsh-harness-zh-l10n
echo  DeepSeek Harness 界面中文汉化（多版本通用）
echo  五模式 / 权限标签 / 命令描述 / 梁神模式
echo ============================================
echo.

REM 优先用 PATH 里的 node，否则回退到受管 node
where node >nul 2>nul
if %errorlevel%==0 (set NODE=node) else (set NODE=C:\Users\Administrator\.workbuddy\binaries\node\versions\22.22.2\node.exe)

echo 可选参数：
echo   直接回车      正常应用汉化
echo   dry           仅预检、不修改任何文件
echo.
set /p MODE="输入 dry 预检或直接回车继续 (dry/回车): "

if /i "%MODE%"=="dry" (
    "%NODE%" "%~dp0apply.js" --dry-run
    goto end
)

set /p CONFIRM="确认将中文汉化写入 dsh 安装目录？(Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo 已取消。
    goto end
)

echo.
"%NODE%" "%~dp0apply.js"

:end
echo.
echo 下一步：
echo   1. 重启 dsh (npx dsh web)
echo   2. 浏览器打开 http://127.0.0.1:3080，硬刷新 (Ctrl+Shift+R)
echo   3. 如需回退：删除各包内改动并用同目录 *.l10n.bak 还原
echo.
pause
