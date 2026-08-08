# Main 分支 Admin 模块管理页设计

## 目标

将模块化管理能力接入 `main` 分支现有的 React/Vite admin 应用，在不破坏原有 Profile、Projects、Skills、Experience、Blog 编辑器的前提下，新增统一的 `/modules` 管理页。

## 范围

- 保留现有 admin 编辑器和 `/api/data/*`、`/api/blog*`、`/api/sync/*` 接口。
- 新增 `/modules` 路由和模块列表编辑器。
- 模块支持按 `order` 排序、拖拽或键盘上移/下移、显示/隐藏、编辑元数据及 JSON 数据。
- 新增模块读取接口 `GET /api/modules`。
- 新增模块发布接口 `POST /api/sync/modules`，写入 `src/content/modules/*.json` 和可选的 `src/modules/trusted/*.ts`，并沿用现有 commit/push 流程。
- 为 main 提供一组当前页面可管理的初始模块数据，模块 collection 接入 Astro 内容配置，但本次不改变首页现有渲染结构。

## 架构

Admin 前端继续使用现有 React Router、Tailwind 和 `PublishButton`。`ModulesEditor` 只依赖 `/api/modules` 返回的 `ModuleEntry[]`，保存时提交完整有序数组和受信任源码映射。Node/Express 服务端负责路径约束、schema 校验、文件增删写入和 git 操作；模块排序算法放在无副作用的 `module-utils.mjs` 中，便于单测。

模块数据使用 Astro content collection 的 JSON loader，统一放在 `src/content/modules`。受信任模块源码单独放在 `src/modules/trusted`，仅作为显式注册的源码入口，不允许通过管理 API 写入任意路径。

## 错误处理与安全

- 模块 id 只能匹配小写字母、数字、连字符和下划线，并且必须以字母或数字开头。
- 受信任源码必须是字符串，且必须对应一个 `type: trusted` 的模块条目。
- 发布请求必须包含 commit message；JSON 解析、校验、文件写入或 git 失败时返回 4xx/5xx 错误，不返回成功状态。
- 删除模块文件只允许发生在 `src/content/modules`，发布过程只暂存允许的模块目录。

## 验证标准

- `admin` 的 `npm run build` 成功。
- `module-utils` 的排序、移动和 schema 校验测试通过。
- Astro 的 `npm run build` 成功，证明新增 collection 不破坏现有展示页。
- Admin 路由可加载 `/modules`，并能通过 API 读取 main 的模块数据。
