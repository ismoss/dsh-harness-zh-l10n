#!/usr/bin/env node
/**
 * dsh-harness-zh-l10n — 多版本通用汉化脚本
 *
 * 设计目标（替代旧的上下文 diff 补丁）：
 *   - 按「精确子串」定位英文/旧中文串并替换为中文，不依赖行号或上下文，
 *     因此跨 dsh 版本（rc.6 / rc.7 / rc.8 / rc.9 …）通用。
 *   - 所有操作幂等：已应用过的串不会重复改；版本漂移导致串不存在时跳过并报警。
 *   - 插入类（权限中文映射）用「锚点后插入」，锚点为稳定函数签名。
 *   - 每个被修改的文件先备份为 <file>.l10n.bak（仅首次修改时）。
 *
 * 用法：
 *   node apply.js                 # 自动定位 dsh 安装目录并应用
 *   DSH_ROOT=C:/dsh node apply.js # 手动指定 dsh 根目录
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

// ---------- 路径解析 ----------
function defaultDshRoot() {
  if (process.env.DSH_ROOT) return process.env.DSH_ROOT;
  // 常见安装位置
  const cands = [
    'C:/dsh',
    path.join(os.homedir(), 'dsh'),
    'C:/Users/Administrator/dsh',
  ];
  for (const c of cands) {
    if (fs.existsSync(path.join(c, 'node_modules', '@deepseek-ai'))) return c;
  }
  return 'C:/dsh';
}
const DSH_ROOT = defaultDshRoot();
const DSH_AI = path.join(DSH_ROOT, 'node_modules', '@deepseek-ai');
const LIANG_ROOT = path.join(
  os.homedir(),
  '.dsh', 'profiles', 'web', 'node_modules', '@linxin666', 'dsh-liangshen'
);

function resolveTarget(op) {
  if (op.group === 'liang') {
    return path.join(LIANG_ROOT, op.file);
  }
  return path.join(DSH_AI, op.pkg, op.file);
}

// ---------- 操作集 ----------
// 每条 op：
//   { type:'replace', search, replace, count? }  全量替换 search->replace（count 限定次数，默认无限）
//   { type:'insertAfter', anchor, block }        在首个 anchor 行后插入 block（已存在则跳过）
//   { type:'removeBlock', start, end }           删除从首个 start 行到首个 end 行（含）之间的内容
const OPS = [
  // ===== dsh-client-ui-agent-preset：5 模式描述（英文默认 + 中文默认 各 4 条） =====
  { group:'dsh', pkg:'dsh-client-ui-agent-preset', file:'lib/client.js', type:'replace',
    search:`presetStandardDescription: "Full coding agent with file editing, shell, file and web search, skills, planning, goals, subagents, and workflows."`,
    replace:`presetStandardDescription: "Full general-purpose mode — files/commands/search/subtask automation all on; use it for coding, bug fixes, and everyday Q&A."` },
  { group:'dsh', pkg:'dsh-client-ui-agent-preset', file:'lib/client.js', type:'replace',
    search:`presetCodeDescription: "All Standard mode capabilities, with tools exposed through the Code Mode SDK so the model can combine multi-step operations in one TypeScript program."`,
    replace:`presetCodeDescription: "Same capability as Standard, but tools delivered as a Code Mode SDK (single run_code); orchestrate multi-step tool calls in one TS program. For Agents, API integration, and complex multi-step tooling."` },
  { group:'dsh', pkg:'dsh-client-ui-agent-preset', file:'lib/client.js', type:'replace',
    search:`presetMinimalDescription: "Two-tool coding agent with persistent bash and str_replace_editor."`,
    replace:`presetMinimalDescription: "Keeps only bash + editor; no search/plan/subagents; leanest toolchain, shortest path. For simple edits, text processing, translation, and formatting."` },
  { group:'dsh', pkg:'dsh-client-ui-agent-preset', file:'lib/client.js', type:'replace',
    search:`presetCordisDescription: "Built for creating custom agent presets, with all Standard mode capabilities plus runtime inspection, plugin experiments, and preset-authoring guidance."`,
    replace:`presetCordisDescription: "For creating or debugging custom Agent presets (runtime inspection, plugin experiments, preset authoring); not everyday dev, not creative writing."` },
  { group:'dsh', pkg:'dsh-client-ui-agent-preset', file:'lib/client.js', type:'replace',
    search:`presetStandardDescription: "功能完整的编码 Agent，支持文件编辑、Shell、文件与网页检索、Skills、计划、目标、子代理和工作流。"`,
    replace:`presetStandardDescription: "全能通用模式，文件/命令/检索/子任务自动化全开；写代码、改 Bug、常规问答都用它。"` },
  { group:'dsh', pkg:'dsh-client-ui-agent-preset', file:'lib/client.js', type:'replace',
    search:`presetCodeDescription: "具备标准模式的全部能力，并通过 Code Mode SDK 呈现工具，让模型用一个 TypeScript 程序组合多步操作。"`,
    replace:`presetCodeDescription: "能力同标准模式，但工具以 Code Mode SDK（单一 \`run_code\`）形式提供，适合用一段 TS 程序把多步工具调用编排完；适合 Agent、API 集成和复杂多步工具协作。"` },
  { group:'dsh', pkg:'dsh-client-ui-agent-preset', file:'lib/client.js', type:'replace',
    search:`presetMinimalDescription: "仅提供持久 bash 与 str_replace_editor 的双工具编码 Agent。"`,
    replace:`presetMinimalDescription: "仅保留 bash + 编辑器两件套，无检索/计划/子代理，工具链最精简、执行路径最短；适合简单代码修改、文本处理、翻译和格式化。"` },
  { group:'dsh', pkg:'dsh-client-ui-agent-preset', file:'lib/client.js', type:'replace',
    search:`presetCordisDescription: "用于创建自定义 Agent preset：具备标准模式的全部能力，并提供运行时检查、插件实验和 preset 创作指导。"`,
    replace:`presetCordisDescription: "用于新建或调试自定义 Agent 预设（检视运行时、实验插件、编写预设）；非日常开发，也不是创意写作。"` },

  // ===== 权限标签（Read Only / Workspace Write / Full access）=====
  // 自 dsh 0.1.1-rc.1 起，权限标签改用内置 i18n 词典（lexicon），包内已自带中文词条
  // （access.preset.readOnly/workspaceWrite/fullAccess 等），界面语言设为中文即显示中文，
  // 无需再用子串替换打补丁。故此处不再处理；若你的界面仍是英文权限标签，
  // 请在 dsh 设置里把「语言/Language」切换为中文（或跟随系统中文）。

  // ===== 命令描述汉化 =====
  { group:'dsh', pkg:'dsh-command-compact', file:'lib/index.js', type:'replace',
    search:`description: "Compact older conversation history"`, replace:`description: "压缩较早的对话历史"` },
  { group:'dsh', pkg:'dsh-command-feedback', file:'lib/index.js', type:'replace',
    search:`description: "record feedback about this session"`, replace:`description: "记录对本会话的反馈"` },
  { group:'dsh', pkg:'dsh-command-goal', file:'lib/index.js', type:'replace',
    search:`description: "set or view the goal for a long-running task"`, replace:`description: "设置或查看长线任务的目标"` },
  { group:'dsh', pkg:'dsh-plan-mode', file:'lib/index.js', type:'replace',
    search:`description: "Enter or leave plan mode"`, replace:`description: "进入或退出计划模式"` },
  { group:'dsh', pkg:'dsh-session-log-export', file:'lib/index.js', type:'replace',
    search:`description: "Download this Session log as a ZIP archive"`, replace:`description: "将本会话日志下载为 ZIP 压缩包"` },
  // permission-presets 两处（双引号 + 单引号）
  { group:'dsh', pkg:'dsh-permission-presets', file:'lib/index.js', type:'replace',
    search:`description: "Switch the permission preset (sandbox mode + approval policy)"`, replace:`description: "切换权限预设（沙箱模式 + 审批策略）"` },
  { group:'dsh', pkg:'dsh-permission-presets', file:'lib/types/index.js', type:'replace',
    search:`description: 'Switch the permission preset (sandbox mode + approval policy)'`, replace:`description: '切换权限预设（沙箱模式 + 审批策略）'` },

  // ===== 梁神插件（装在 ~/.dsh，dsh 升级不会冲掉；此处保证可复刻 + 幂等） =====
  { group:'liang', file:'presets/liangshen/preset.yml', type:'replace',
    search:`description: 那模式一启动，使用者当场双腿一软瘫坐在地，仿佛看见原子弹爆炸——三秒，三辈子的代码，外加文言文、二进制、摩斯电码三语解说轮番轰炸，凡人最后只能趴在地上用下巴磕出两个字:梁神！`,
    replace:`description: 首轮以极简双工具锚定任务轨迹，随后自动切入 PTC（Code Mode）并恢复完整工具环境；适合复杂需求、模块设计与难题排查。新建会话选它，第一句直接给任务。` },
  // agent.cordis.yml：注释术语 PTC Mode -> Code Mode (PTC)
  { group:'liang', file:'presets/liangshen/agent.cordis.yml', type:'replace',
    search:`PTC Mode`, replace:`Code Mode (PTC)` },
  // 删除 instructionHint 块
  { group:'liang', file:'presets/liangshen/agent.cordis.yml', type:'removeBlock',
    start:`# Issue #388: after promotion, inject one non-imperative hint`,
    end:`instructionHint: true` },
  // 删除 persistent-shell 的 Windows 禁用行
  { group:'liang', file:'presets/liangshen/agent.cordis.yml', type:'removeBlock',
    start:`disabled: !!js process.platform === 'win32'`,
    end:`disabled: !!js process.platform === 'win32'` },
  // 删除 custom-bash 工具块（含注释）
  { group:'liang', file:'presets/liangshen/agent.cordis.yml', type:'removeBlock',
    start:`# Windows-only \`bash\` tool (custom-bash.mjs):`,
    end:`disabled: !!js process.platform !== 'win32'` },
];

// ---------- 应用逻辑 ----------
const DRY = process.argv.includes('--dry-run') || process.argv.includes('--check');
function backupIfNeeded(file) {
  const bak = file + '.l10n.bak';
  if (!fs.existsSync(bak)) {
    fs.copyFileSync(file, bak);
    return true;
  }
  return false;
}

function applyOp(op) {
  const target = resolveTarget(op);
  if (!fs.existsSync(target)) {
    return { op, status:'missing-file', detail:target };
  }
  let content = fs.readFileSync(target, 'utf8');
  let changed = false;
  let note = '';

  if (op.type === 'replace') {
    if (content.includes(op.search)) {
      const before = content;
      content = content.split(op.search).join(op.replace);
      changed = content !== before;
      note = 'replaced';
    } else {
      // 已应用（含中文）或版本漂移：检测是否已是目标串
      if (content.includes(op.replace)) return { op, status:'already', detail:target };
      return { op, status:'not-found', detail:'search string absent (version drift or already changed differently)' };
    }
  } else if (op.type === 'insertAfter') {
    if (content.includes(op.block)) return { op, status:'already', detail:target };
    const lines = content.split('\n');
    const idx = lines.findIndex(l => l.includes(op.anchor));
    if (idx === -1) return { op, status:'not-found', detail:'anchor not found: ' + op.anchor };
    const indent = (lines[idx].match(/^\s*/) || [''])[0];
    const blockLines = op.block.split('\n');
    // block 自带缩进，直接用
    lines.splice(idx + 1, 0, ...blockLines);
    content = lines.join('\n');
    changed = true;
    note = 'inserted after anchor';
  } else if (op.type === 'removeBlock') {
    const lines = content.split('\n');
    const si = lines.findIndex(l => l.includes(op.start));
    if (si === -1) return { op, status:'already', detail:'start marker absent (already removed)' };
    // 从 start 之后找第一个含 end 的行
    let ei = -1;
    for (let i = si; i < lines.length; i++) { if (lines[i].includes(op.end)) { ei = i; break; } }
    if (ei === -1) return { op, status:'not-found', detail:'end marker not found: ' + op.end };
    lines.splice(si, ei - si + 1);
    content = lines.join('\n');
    changed = true;
    note = 'removed block';
  }

  if (changed) {
    if (DRY) {
      return { op, status: 'would-apply', detail: target, note };
    }
    backupIfNeeded(target);
    fs.writeFileSync(target, content, 'utf8');
  }
  return { op, status: changed ? 'applied' : 'no-change', detail: target, note };
}

// ---------- 运行 ----------
console.log('DSH_ROOT =', DSH_ROOT);
console.log('@deepseek-ai =', DSH_AI, fs.existsSync(DSH_AI) ? '(ok)' : '(NOT FOUND)');
console.log('liangshen   =', LIANG_ROOT, fs.existsSync(LIANG_ROOT) ? '(ok)' : '(NOT FOUND)');
console.log('--------------------------------------------------');
let applied=0, already=0, notfound=0, missing=0;
for (const op of OPS) {
  const r = applyOp(op);
  const tag = { applied:'APPLIED', 'would-apply':'WOULD', already:'SKIP(idem)', 'not-found':'WARN', 'missing-file':'MISSING', 'no-change':'NOCHG' }[r.status] || r.status;
  const where = (op.pkg || 'liang') + '/' + op.file;
  console.log(`[${tag}] ${where}  ${r.note || r.detail || ''}`);
  if (r.status==='applied') applied++;
  else if (r.status==='already') already++;
  else if (r.status==='not-found') notfound++;
  else if (r.status==='missing-file') missing++;
}
console.log('--------------------------------------------------');
console.log(`done: applied=${applied} already=${already} warn/notfound=${notfound} missingFile=${missing}`);
if (DRY) {
  console.log('（DRY-RUN：未做任何修改。去掉 --dry-run 重新运行以实际写入。）');
} else {
  console.log('提示：修改已生效，重启 dsh（npx dsh web）后界面文案更新；如需回退，用同目录 *.l10n.bak 还原对应文件即可。');
}
