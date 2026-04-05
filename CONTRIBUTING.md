# Contributing Guide

感谢你对本项目的关注！我们欢迎任何形式的贡献，包括但不限于：功能开发、Bug 修复、文档完善、性能优化等。

请在提交贡献前仔细阅读本指南。

## 工作流程

1. **Fork** 本仓库并 clone 到本地
2. 基于 `main` 分支创建你的功能分支
3. 在本地完成开发与测试
4. 确保所有提交符合下方的 **Conventional Commit 规范**
5. 提交 **Pull Request** 到 `main` 分支
6. 等待 Code Review，根据反馈修改后合并

## 环境准备

```bash
# 安装依赖（需要 Bun >= 1.3.5）
bun install

# lefthook 会在 prepare 阶段自动安装 Git hooks
# 若未自动安装，可手动执行：
npx lefthook install
```

## Commit 规范（Conventional Commits）

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范，并通过 **commitlint** + **lefthook** 在 `commit-msg` 阶段强制校验。不符合规范的提交将被拒绝。

### 核心原则

**所有提交必须面向业务。** 每条 commit 应当清晰地表达一个具体的业务变更目的，而非笼统的"修改代码"或"更新文件"。

### 格式

```
<type>(<scope>): <subject>

<body>

[BREAKING CHANGE: <description>]
```

**每个字段的要求：**

| 字段 | 是否必须 | 说明 |
|------|----------|------|
| `type` | 必须 | 变更类型，见下方列表 |
| `scope` | 必须 | 影响范围，使用小写，如 `auth`、`api`、`cli` |
| `subject` | 必须 | 简短描述（不要以句号结尾） |
| `body` | 必须 | 详细说明变更的动机与内容 |

### 允许的 type

| Type | 用途 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `style` | 代码格式（不影响逻辑） |
| `refactor` | 重构（既非新功能也非修复） |
| `test` | 测试相关 |
| `chore` | 构建、工具链等杂项 |
| `ci` | CI/CD 配置变更 |
| `perf` | 性能优化 |
| `build` | 构建系统或外部依赖变更 |

### 破坏性变更（Breaking Changes）

如果你的提交包含破坏性变更（不兼容旧版本的改动），**必须**在 type/scope 后添加 `!` 标记：

```
feat(api)!: remove deprecated v1 endpoints

移除了 /api/v1 下的所有端点，请迁移至 /api/v2。

BREAKING CHANGE: /api/v1 端点已被移除，所有调用方需切换到 /api/v2。
```

### 禁止携带协作者信息

提交信息中**禁止**包含以下内容：

- `Co-Authored-By`
- `Made with`
- `Generated with`
- `Signed-off-by`

lefthook 会在 commit-msg 阶段自动拦截包含上述信息的提交。

### 提交示例

```
feat(cli): add --verbose flag for debug output

在 CLI 中新增 --verbose 选项，启用后将输出详细的调试日志，
方便开发者排查问题。
```

```
fix(auth): prevent token refresh race condition

当多个请求同时触发 token 刷新时，可能导致旧 token 被复用。
现在通过加锁机制确保同一时刻只有一个刷新操作执行。
```

## Pull Request 要求

- PR 标题应遵循 Conventional Commits 格式
- PR 描述中应说明变更的目的与实现思路
- 一个 PR 应聚焦于一个功能或修复，避免混合不相关的变更
- 确保本地提交历史整洁，必要时使用 `rebase` 整理
- 通过所有 CI 检查后方可请求 Review

## Code Review

- 所有 PR 需要至少一位维护者 Review 后方可合并
- Review 意见应及时回复和处理
- 保持良好沟通态度，尊重每一位贡献者

## 问题反馈

如果你发现了 Bug 或有功能建议，请通过 [GitHub Issues](https://github.com/neil-wang-global/claude-code/issues) 提交。
