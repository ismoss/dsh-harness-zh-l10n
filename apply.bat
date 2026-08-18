@echo off
chcp 65001 >nul
title dsh-harness-zh-l10n — 应用汉化补丁

echo ============================================
echo  dsh-harness-zh-l10n
echo  DeepSeek Harness 中文描述汉化补丁
echo  五模式 / 权限标签 / 命令描述 / 梁神模式
echo ============================================
echo.

set DSH_DIR=C:\dsh\node_modules\@deepseek-ai
set LIANG_DIR=C:\Users\Administrator\.dsh\profiles\web\node_modules\@linxin666\dsh-liangshen
set PATCH_DIR=%~dp0patches

if not exist "%DSH_DIR%" (
    echo [错误] 未找到 dsh 安装目录: %DSH_DIR%
    echo 请确认 dsh 已安装（默认路径 C:\dsh）。
    pause
    exit /b 1
)

echo [信息] dsh 目录: %DSH_DIR%
if exist "%LIANG_DIR%" (
    echo [信息] 梁神插件: 已安装
) else (
    echo [信息] 梁神插件: 未安装（自动跳过梁神补丁）
)
echo [信息] 补丁目录: %PATCH_DIR%
echo.

set /p CONFIRM="是否继续应用补丁？(Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo 已取消。
    pause
    exit /b 0
)

echo.
echo 正在应用补丁...
echo.

set APPLIED=0
set FAILED=0
set SKIPPED=0

echo --- dsh 核心补丁 ---
for %%f in ("%PATCH_DIR%\@deepseek-ai-*.patch") do (
    if exist "%%f" (
        echo   Applying: %%~nxf
        patch -d "%DSH_DIR%" -p0 -i "%%f" --no-backup-if-mismatch -s
        if !errorlevel! equ 0 (
            echo   [OK] %%~nxf
            set /a APPLIED+=1
        ) else (
            echo   [FAIL] %%~nxf
            set /a FAILED+=1
        )
    )
)

echo --- 梁神补丁 ---
if exist "%LIANG_DIR%" (
    for %%f in ("%PATCH_DIR%\@linxin666-*.patch") do (
        if exist "%%f" (
            echo   Applying: %%~nxf
            patch -d "%LIANG_DIR%" -p0 -i "%%f" --no-backup-if-mismatch -s
            if !errorlevel! equ 0 (
                echo   [OK] %%~nxf
                set /a APPLIED+=1
            ) else (
                echo   [FAIL] %%~nxf
                set /a FAILED+=1
            )
        )
    )
) else (
    for %%f in ("%PATCH_DIR%\@linxin666-*.patch") do (
        if exist "%%f" (
            echo   [SKIP] %%~nxf （未安装梁神插件）
            set /a SKIPPED+=1
        )
    )
)

echo.
echo ============================================
echo  完成: %APPLIED% 成功, %FAILED% 失败, %SKIPPED% 跳过
echo ============================================
echo.
echo 下一步：
echo   1. 重启 dsh
echo   2. 浏览器打开 http://127.0.0.1:3080
echo   3. 硬刷新 (Ctrl+Shift+R) 看到汉化
echo.
echo 若出现 [FAIL]，说明补丁与你的 dsh 版本不匹配，
echo 请提供 dsh 版本给仓库开发者更新补丁。
echo.
pause