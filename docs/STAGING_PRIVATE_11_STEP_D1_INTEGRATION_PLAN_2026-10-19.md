# AURMOVA · 私人11段咨询记录接入计划（只读审查后的预备方案）

日期：2026-10-19
部署界限：只允许 staging/private-customer-sync 的设计与测试；不修改 main，不自动上线，不将真实顾客资料或内部教材放入 public-preview。

## 已由人工操作验证
- Cloudflare Worker: aurmova-secure-api-staging；用户于 Deployments 查看 active version short ID 86e67b74、100% 流量。
- GitHub 身份验证在 /owner-login 成功；点击「检查私人连接」后显示「身份已验证，私人后端连接正常」。
- 已有虚构测试顾客甲可重新读取；修改「咨询主题」为 STAGING-D1修改测试，保存后刷新再次读取，内容保留。
- D1: aurmova-private-staging，存在 private_customers 和 private_consultation_notes。
- private_consultation_notes 经 PRAGMA table_info 检查：id（TEXT 主键）、owner_github_id（TEXT NOT NULL）、customer_id（TEXT NOT NULL）、project（TEXT NOT NULL）、step_id（TEXT NOT NULL）、selection_key（TEXT）、selection_label（TEXT）、answer_text（TEXT）、created_at（TEXT NOT NULL）。
- 经 PRAGMA index_list 检查：idx_private_consultation_notes_owner_customer_created（非唯一），sqlite_autoindex_private_consultation_notes_1（主键唯一）。
- Pages: aurmova-consultation-staging.pages.dev 可显示11段 UI V2 和对应分支接话；这是公开演示页，不是私人系统。

## 已知限制
- 已验证的是私人顾客档案的写入与再次读取，不是11段的端到端数据库记录保存。
- Worker 的完整、已部署源文件并不在目前 GitHub Staging 仓库中；目前只见到 Cloudflare 网页编辑器中的部分片段，因此不能安全猜测 API 的路由、授权逻辑及 SQL。
- public-preview 是可公开访问的静态文件；无论是否展示或隐藏，都不能把真实客户数据、秘密、81组完整内部教材或账户密钥上传此目录。
- 部署版本号不是数据库备份。回滚 Worker 无法回滚 D1，任何未来写入之前应制定备份与清理测试数据方案。

## 11段标准记录字段（仅概念，不更改现有表）
- owner: 从登录会话在服务端确定，客户端不能提供/覆盖 owner_github_id。
- customerId: 查询时需校验档案归属，拒绝其他所有者的 ID。
- project: 人生蓝图固定内部枚举 life；其他项目独立处理。
- sessionId: 一位顾客多次咨询可分开，建议服务器生成 UUID；需新增安全存储结构或经检验后增加字段。
- stepId: 使用稳定程序标识而非界面中文标题，需对照 src/life-eleven-stages.js。
- choice: yes / partial / no / unsure / skipped；与原话 answerText 分开。
- privateNotes: 本人专用、不在顾客报告中自动输出。
- timestamps: createdAt / updatedAt；服务端时间戳。
- revision behavior: 支持人工更正，明确定义重复提交是更新当前步骤还是保留新版本；不要盲目追加导致重复结果。
- lifecycle: 读取/更正/删除及用户授权确认都需检查；接口错误不得暴露数据库内部细节。

## 安全实现门槛
1. 先**只读**获取 active Worker 86e67b74 的实际脚本和路由，或经用户自行提供导出的源文件（请勿分享真实 secrets）。
2. 审核 Worker 对 GitHub OAuth 的 token/cookie、owner-only 授权、CSRF、CORS、会话过期、D1 查询所有者约束、重复提交与输入长度控制。
3. 根据源文件中已有的 /private/consultation 接口决定复用还是增补；不预设已有接口名。
4. 如需增加咨询场次，优先先做只增不删的 D1 Staging 数据迁移；独立验证，保留原 private_consultation_notes 历史数据。
5. 对真实 Staging Worker 先保存可回退的源码快照，不在 Cloudflare 网页中直接大量粘贴修改；明确版本号后再部署。
6. 先用虚构顾客验证 11 steps × 4 choices、刷新后的完整读写、第二场会话隔离、未登录拒绝、非本人拒绝及退出后拒绝。
7. 全部安全验收后才考虑将私人数字计算／授权课程讲解从安全后端传送给受保护的顾问端。
8. 不执行未经用户明确认可的付费配置、生产修改、数据库删除或真实客户数据迁移。

## 目前结论
可行性：现有 Worker OAuth 和 D1 基础设施已经运行，可优先复用；但必须取得现行 Worker 的完整代码或有效只读源文件后才能写准确、安全的 D1 集成补丁。
当前动作：只创建此 Staging 审计记录；未调用 Cloudflare API、未执行 SQL、未更改生产或 Staging Worker。
