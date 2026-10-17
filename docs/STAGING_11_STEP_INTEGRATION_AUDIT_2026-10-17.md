# AURMOVA · 人生蓝图11段 Staging 整合与教材盘点

日期：2026-10-17
范围：仅 staging/private-customer-sync；不得合并/修改 main。不得启用付费套餐。

## 本轮实际已写入 GitHub
- src/life-eleven-stages.js：成年人生蓝图11段逐步咨询生成器，按生日读取现有数字引擎、主性格、内心码、起始数、父母基因、缺失/重复、当前三阶段；每步有标题、照读白话、验证问题、转场句。无真实顾客信息。
- src/speaking-guide.js：现有「跟着说」针对成人 life 模式使用11步；其他项目保留既有逻辑。增加Staging测试数据警示。
- src/v6-enhancements.js、index.html：更新资源版本，避免浏览器沿用旧咨询脚本。
- tests/life-eleven-stages.test.js：11段顺序、阶段数字、算法待复核、成人阶段边界等自动化测试脚本。

状态：代码已提交到 Staging 分支；Cloudflare 构建、线上可用性、测试脚本执行结果和 D1 端到端持久化尚未核实。不能称正式上线。不要用真实顾客隐私测试。

## 已发现的可复用教材/模块（存在源文件≠已全部正确接入）
1. 1–9主性格、起始数、内三角修正、内心码、说话/思考/行动/压力（floot-knowledge.js、personality-library.js、ordered-speaking-foundation.js）。
2. 81组联合码与位置解读（aurmova-knowledge.js、floot-knowledge.js、private-library.js）。
3. 父母基因、坐镇码、三阶段12组联合码，黄金20年（engine/blueprint.js、private-library.js）。
4. 缺失数、重复/挑战、高峰、阶段挑战、黑洞数、成熟数、循环数、制约数／原生家庭（consultation-library.js、hole-maturity-library.js、cycle-environment.js）。
5. 姓名表现数字、内驱数字、性情四体、特殊/业力数、生日数字（consultation-library.js、engine/blueprint.js）。
6. 黄金流年1–9、个人四组、大环境四组、五行独立课程与健康类传统资料（annual-year-guidance.js、flow-year-restoration.js、wuxing-course-supplement.js、wuxing-health-course.js、five-elements-analysis.js）。
7. 儿童天赋/儿童联合码、亲子资料、学生合成码（private-library.js、student-composite-course.js、v6-enhancements.js）。
8. 伴侣双方、夫妻结合、合作磁场、45组伙伴配对课程（partner-pair-course.js、spouse-combination-course.js、cooperation-magnetic-field.js、v6-enhancements.js）。
9. 咨询回答分支、顾客报告白名单、跟进文案、白板与历史档案（guided-consultation-replies.js、speaking-guide.js、customer-report-image.js、app.js）。

## 紧急核对/不自动断言
- 潜意识码：目前 engine/blueprint.js 的旧实现是 add(I,O,L)，与此前记录「三个顶端外点相加」不一致。不得在11段中把旧结果讲成确证；需按原教材示意图明确顶点及化简次序后单点修复/回归测试。
- 独立「天赋数字」公式未确认。不得以重复/挑战数字冒充天赋独立计算。儿童主数天赋速查是另一模块。
- 缺失数字统计范围最终规则待核。前端现有 innerEnergy.missing 基于7个内三角数字，须与教材校对。
- 部分旧资料对理性/感性、主动/被动分组口径互有不同，必须记录来源与版本，以用户最终确认口径为准，不可混用。
- 679相关原书表述有冲突：从正式咨询主线排除，库内保留待核验。
- 人生阶段是内部咨询模型，不是必然人生定律。20岁以下不套用成人三阶段。

## 安全与真实上线阻断项（P0）
- 仓库目前为 public，静态网页 JavaScript 即使UI隐藏，也不能保证内部教材或计算逻辑对外保密。应通过经身份验证的后端服务传递授权内容，不能把“页面上不显示”误当安全。
- 现有原始网页 app.js 与 speaking-guide.js 使用 localStorage 保留顾客资料、回答和进度；这并不等价于已连接私有 Cloudflare D1。需要审核实际私人顾客系统与认证的完整读写链路，再用于真实客户。
- 不能把 Cloudflare Preview 失败、GitHub commit 成功，误认为部署成功。
- 不在源码提交登录密钥、支付口令、真实顾客资料、咨询记录或未经允许的书本原页。

## 后续优先顺序
P0 逐项解决隐私/认证/算法冲突，并在Staging检查部署状态。
P1 在Staging用虚构顾客测试11段：跳步、顺序、白话、顾客说有/没有/部分/不确定、回答持久化、浏览器重开、不干扰其他项目。
P2 把11段接进真正经认证的D1咨询记录服务，支持按顾客、按项目、按会话独立存储和查询；只储存授权内容，保留删除与更正能力。
P3 人工确认的顾客专属A4矢量PDF报告，白名单输出；Josephine可选择报告项目及具体段落；内部码/提词/完整家庭记录不自动公开。
P4 五大咨询项目独立模板：黄金流年、关系、亲子、合作、儿童专用解说；准确保存相关人员姓名、生日、性别。儿童不套成人事业财富/婚姻话术。
P5 教材管理后台：来源标识、版本差异、81组检索、术语及计算校验、白话模板维护、修改后的回归测试。
P6 顾客预约→资料填写→仅公开主性格→订金/付款核实→建立咨询记录→报告→人工审阅后的WhatsApp回访；TNG Static Link暂无可依赖的自动收款确认时不能声称支付已自动验证。
P7 根据咨询需求选做：高峰/成熟/黑洞/循环/五行等进阶模块，但不把全部教材塞进人生蓝图11段。

## 验收口径
- 在Staging真实打开测试网页，看到「人生蓝图」成人咨询恰好11步，按钮切换、回答分支、转场正常。
- 同一测试顾客21/11/1995显示主性格2、座镇562、父325、母156、阶段21–40的325→358／257→876（以课程和当前引擎为准）。
- 潜意识独立数字和天赋数字仍标待核，未给确定结论；其余项目原有内容不丢失。
- 打开未认证页面时不暴露私人记录；只有授权本人能访问内部咨询记录。
- 测试通过前绝不合并main，不启用额外月费。
