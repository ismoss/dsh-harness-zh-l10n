# dsh-harness-zh-l10n

DeepSeek Harness (dsh) 界面中文汉化补丁。

把 dsh 的五模式描述、权限标签、命令描述和梁神模式描述从英文翻成中文，让界面一眼能看懂每个功能是干什么的、怎么用。

## 汉化了什么

| 模块 | 效果 |
|---|---|
| **五模式描述** | 标准/PTC/极简/创造/梁神的按钮文案变成「一句话看懂特点+怎么用」的中文 |
| **权限标签** | Read Only→**只读** / Workspace Write→**工作区写入** / Full access→**完全访问** |
| **命令描述** | `/compact` `/export` `/feedback` `/goal` `/permission` `/plan` 的说明改成中文（命令名不变） |
| **梁神模式描述** | 梁神模式在模式选择器里的介绍改成中文 |

## 使用方法（30 秒）

1. 确认 dsh 已安装在默认位置 `C:\dsh`
2. **下载 `patches/` 文件夹 + `apply.bat`**（放在同一个文件夹里）
3. 双击运行 `apply.bat`，按提示输入 `Y`
4. 重启 dsh
5. 浏览器打开 `http://127.0.0.1:3080`，按 **Ctrl+Shift+R** 硬刷新

看到的就是汉化后的界面。

> ⚠️ 没有安装梁神插件（`@linxin666/dsh-liangshen`）的会自动跳过梁神补丁，不影响其他汉化生效。

## 遇到的问题

- **`[FAIL]`**：补丁和你本地 dsh 版本对不上。别急，在 issues 里告诉我你的 dsh 版本号（怎么看：打开 dsh 设置 → 关于，或 `C:\dsh\package.json` 里的 `version`），我会更新补丁支持你的版本。
- **想恢复原始英文**：`cd C:\dsh && npm install @deepseek-ai/dsh-client-ui-agent-preset@0.1.0-rc.6`（以及对应该汉化的 9 个包重装一遍即可）。

## 已适配版本
- dsh（核心包）v0.1.0-rc.6
- 梁神插件 v0.2.0

## 协议
MIT