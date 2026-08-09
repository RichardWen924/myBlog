# Work 点聚焦主题转场规范

状态：已实现并完成桌面与 Compact 实机验收

版本：1.0

日期：2026-08-09

适用范围：所有非 Work 页面与 `/work` 之间的站内导航

## 1. 决策摘要

Work 使用名为 **Point Focus Portal / 点聚焦门户** 的独立主题转场。

转场不是普通页面缩放，也不是伪加载动画。进入 Work 时，视角向进度轨道的 `100% / WORK` 节点推进，节点逐渐移动到视口中心；节点内部的真实 Work Hero 同时由缩小状态放大，圆形边界持续扩展，直至 Work Hero 覆盖全屏。离开 Work 时完整反向：当前 Work 页面向 `0% / ARCHIVE` 节点圆心收束，视角后退，目标页面从背后显现。

以下四个值由同一个归一化进度 `p` 驱动，不允许使用彼此独立的计时器：

- 百分比数字。
- 轨道完成长度。
- 摄像机路径与视差强度。
- 圆形门户半径和 Work Hero 比例。

项目继续使用现有 GSAP。路由协调使用 Astro 内置 `ClientRouter` 与 View Transition 生命周期，不引入 Swup、Barba 或新的动效依赖。

## 2. 目标与非目标

### 2.1 目标

- 让进入 Work 感觉像穿过一个明确的空间焦点，而不是切换背景颜色。
- 将 Carbon 风格进度语义、主题切换和页面导航合并为同一段运动。
- 每次跨越 Work 边界都完整播放，并且进入与离开严格互为反向。
- 在视觉强度较高的同时保持 Obsidian Circuit 的克制、简约和结构感。
- 保证键盘、浏览器历史、直接访问、窄屏和 reduced-motion 都有完整行为。

### 2.2 非目标

- 不表达文件下载、编译、联网或真实资源加载百分比。
- 不在非 Work 页面之间播放该转场。
- 不加入星空、粒子隧道、镜头抖动、色差、强光晕或游戏化传送门效果。
- 不为转场复制第二套 Work Hero 内容或维护独立的假页面。
- 不使用弹簧回弹；落位后保持稳定。

## 3. 进度语义

`p` 表示 **Work 主题在当前视口中的占据进度**：

- 进入 Work：`p = 0 → 1`，显示 `0% → 100%`。
- 离开 Work：`p = 1 → 0`，显示 `100% → 0%`。
- `0 / ARCHIVE`：非 Work 母系统完全占据视口。
- `50 / SHIFT`：摄像机、门户和两种主题同时可见。
- `100 / WORK`：Work Hero 完全覆盖视口并完成落位。

百分比不得绑定 fetch 字节、随机增长或预设的伪加载阶段。下一页面尚未准备好时，可以在 `0%` 或 `100%` 静止等待，但数字不能虚假前进。

进度组件使用 `role="progressbar"`，同步维护：

- `aria-valuemin="0"`
- `aria-valuemax="100"`
- `aria-valuenow`
- 进入时 `aria-label="Entering Work theme"`
- 离开时 `aria-label="Leaving Work theme"`

## 4. 路由触发矩阵

| 来源 | 目标 | 行为 |
| --- | --- | --- |
| 非 Work | `/work` | 完整进入，`0% → 100%` |
| `/work` | 非 Work | 完整离开，`100% → 0%` |
| 非 Work | 非 Work | 不播放 Work 转场 |
| `/work` | `/work` 锚点或当前地址 | 不播放主题转场 |
| 直接打开或刷新 `/work` | `/work` | 使用暖纸预备层完整播放进入 |
| 浏览器后退/前进跨越 Work 边界 | 对应目标 | 按实际来源和目标播放进入或离开 |
| 外链、下载、新标签页、修饰键点击 | 任意 | 不拦截，不播放 |

“每次进入”包括同一会话内重复进入，不使用 sessionStorage 跳过，也不压缩为短版本。

## 5. 视觉结构

### 5.1 层级

从后到前分为五层：

1. **Target Page**：已准备好的目标页面。
2. **Source Page**：当前页面或其 View Transition 快照。
3. **Depth Field**：低对比网格和结构速度线。
4. **Portal Mask**：裁切目标 Work Hero 的圆形窗口。
5. **Progress HUD**：轨道、节点、百分比和方向文字。

HUD 不参与页面透视变形，但其轨道世界可以随摄像机轻微位移。百分比数字必须始终清晰可读。

### 5.2 Carbon 轨道

- 轨道高度：`1px`。
- 完成线：`--work-signal-dim`。
- 当前焦点和 Work 节点：`--work-signal`。
- 节点外圈：`22px`；内部实心点：`8px`。
- 门户初始直径：桌面 `42px`，Compact `36px`。
- 标签：`0 / ARCHIVE`、`50 / SHIFT`、`100 / WORK`。
- 标签使用 `IBM Plex Mono`，`9–11px`，不加入多余步骤编号。

### 5.3 门户

- 门户使用 `clip-path: circle()` 或等价 View Transition 裁切。
- 最大半径按 `hypot(viewportWidth, viewportHeight) × 1.08` 计算，确保所有宽高比均完全覆盖。
- 圆环只使用 `1px` 信号色边界和低于 `0.16` 的柔和外扩散。
- Work Hero 是真实目标页面的视觉层，不是截图图片或复制文案。
- 圆形边界越过视口后立即移除遮罩和临时合成层，不能残留不可见点击层。

### 5.4 摄像机与视差

“视角向点移动”通过空间路径表达，不使用单一 `scale()` 冒充摄像机运动：

- Work 节点从桌面横向 `88%`、Compact `84%` 的位置移动到视口中心 `50%`。
- Source Page 沿相反方向位移，并增加受控的透视深度。
- 背景网格、页面内容、站点 chrome 和轨道使用不同的位移系数。
- 远层网格移动系数约 `0.14`，内容层约 `0.22`，轨道约 `1`。
- Source Page 最大等效纵深放大约 `1.18–1.24`；不得超过 `1.28`。
- 页面文字在高速段最多使用 `1.2px` 模糊，只服务纵深，不影响静止阅读。
- 结构速度线只在中段加速时出现，最大透明度 `0.24`，进入门户前消失。

## 6. 进入 Work 的运动

标准总时长：`1280ms`。实现可在不同设备上调整 ±8%，但进入与离开必须使用同一套 token。

### 6.1 主时间线

| 时间 | 进度 | 运动 |
| --- | --- | --- |
| `0–80ms` | `0%` | 锁定交互，目标页面准备完成后显示 HUD |
| `80–1160ms` | `0–100%` | 摄像机推进、节点移向中心、门户扩张、Work Hero 放大同步进行 |
| `320–860ms` | 约 `18–72%` | 网格纵深和结构速度线达到峰值后回落 |
| `1160–1280ms` | `100%` | Work Hero 比例落到 `1`，清除临时层并恢复交互 |

摄像机可以比门户提前最多 `80ms` 建立方向，但不能先到达节点再等待门户打开。视觉上必须是一段连续穿梭。

### 6.2 同步映射

设归一化主进度为 `p`：

- 百分比：`round(p × 100)`。
- 轨道：`scaleX(p)`。
- 节点屏幕 X：`lerp(sourceNodeX, 50%, camera(p))`。
- 门户半径：`lerp(21px, fullRadius, portal(p)^1.28)`。
- Work Hero 比例：`lerp(0.46, 1, portal(p))`。
- Work Hero 的视觉核心从门户圆心逐渐回到 Hero 最终构图位置。

`camera(p)` 使用快速建立方向、平滑减速的 easing；`portal(p)` 使用连续的 symmetric ease-in-out。两者共享 `p`，不能分别创建独立 timeline。

## 7. 离开 Work 的运动

离开是进入时间线的语义反向，标准总时长同为 `1280ms`：

- 百分比 `100% → 0%`。
- Work Hero 从比例 `1 → 0.46`。
- 全屏 Work 裁切边界收束为圆形门户。
- 当前 Work 页面向 `0 / ARCHIVE` 节点圆心收回。
- 目标非 Work 页面从背后显现。
- 摄像机从视口中心后退，`0%` 节点回到桌面 `12%`、Compact `16%` 的静止位置。
- 结构速度线在拉远中段短暂出现，并在目标页面可读前消失。

离场不能先把 Work 淡出再显示目标页面；两者必须通过同一圆形边界保持空间连续性。

## 8. 动效状态机

控制器只允许以下状态：

| 状态 | 含义 | 允许事件 |
| --- | --- | --- |
| `idle-non-work` | 非 Work 页面稳定 | 进入 Work |
| `preparing-enter` | 目标 Work 文档准备中 | 成功、失败 |
| `entering` | `0 → 100` 正在播放 | 完成 |
| `idle-work` | Work 页面稳定 | 离开 Work |
| `preparing-exit` | 目标非 Work 文档准备中 | 成功、失败 |
| `exiting` | `100 → 0` 正在播放 | 完成 |
| `reduced` | 无空间运动的直接交换 | 完成 |

转场期间第一次有效导航成为目标。后续点击不创建第二条 timeline，也不累计监听器。目标准备失败时：

1. 停止转场。
2. 恢复源页面、滚动和焦点。
3. 清除 `inert`、锁定 class、RAF 和 timeline。
4. 交由 Astro 的错误或普通导航行为处理，不伪造成功终态。

## 9. 实现架构

### 9.1 组件边界

- `Base.astro`：启用 Astro `ClientRouter`，在所有页面挂载一个全局转场宿主。
- `WorkThemeTransition.astro`：只负责 HUD、门户合成层和可访问状态。
- `workThemeTransition.ts`：负责路由判断和可测试的纯运动参数映射。
- `workThemeTransitionClient.ts`：负责 GSAP 主进度、Astro 生命周期、页面合成与幂等清理。
- `work-theme-transition.css`：负责 View Transition 命名层、圆形裁切、纵深和响应式参数。
- Work 页面根节点与 Hero：提供稳定的 transition name，允许真实 Hero 进入门户。

转场宿主必须存在于所有使用 `Base.astro` 的页面，不能只在 `/work` 条件渲染，否则离开 Work 时无法持续承载反向 HUD。

当前真实文件映射：

- `src/layouts/Base.astro`
- `src/components/entry/WorkThemeTransition.astro`
- `src/components/entry/workThemeTransitionClient.ts`
- `src/lib/workThemeTransition.ts`
- `src/lib/workThemeTransition.test.ts`
- `src/styles/work-theme-transition.css`

进入与直达场景均将服务器渲染的真实 Work 页面作为 inert 视口副本放入 Portal Target；动画结束后移除副本并揭示可交互页面。由于 inert 副本不执行 React/SVG 生命周期，过渡层为 `BUILD FUTURE` 提供同构的静态描边兜底，兜底只存在于临时合成层，不形成第二份业务 Hero。

### 9.2 Astro 生命周期

- `astro:before-preparation`：判断来源与目标，锁定输入并显示静止起点。
- 页面准备完成后才启动确定性主题进度。
- `astro:before-swap`：建立 source/target View Transition 层和方向。
- `astro:after-swap`：重新绑定目标页面需要的 DOM 引用。
- `astro:page-load`：完成焦点、滚动和页面脚本初始化。

引入 `ClientRouter` 后，项目现有只在模块首次执行时初始化的脚本必须迁移到幂等的 `astro:page-load` 初始化，并在 `astro:before-swap` 清理。不得因为路由切换产生重复键盘监听、observer、RAF 或 GSAP timeline。

### 9.3 依赖

- 使用现有 `gsap`。
- 使用 Astro 内置 `astro:transitions`。
- 不安装 Carbon React、Swup、Barba、GSAP Flip 或额外进度条包。
- Carbon 仅提供进度结构语义，不复制其品牌样式或组件代码。

## 10. 直接访问与降级

### 10.1 直接访问 `/work`

直接访问没有上一页面快照。此时使用与全站暖纸主题一致的轻量预备层作为 Source Page，真实 Work 页面作为 Portal Target，完整播放 `0% → 100%`。预备层只包含背景、网格和轨道，不伪造另一个页面的正文。

从 Work 进入首页等站内路由时，首页原有 Entry Progress 不得二次播放；它只保留给真正首次打开首页的会话入场。

### 10.2 View Transition 不可用

如果浏览器不支持原生 View Transition：

- 使用 Astro ClientRouter 的 animate fallback 和普通 DOM 合成层。
- 保留百分比、圆形遮罩和 Work Hero 放大。
- 可以减少多层透视和模糊，但不能退化成彩色进度条或白屏跳转。
- 导航与内容可用性优先于完全一致的视觉效果。

### 10.3 JavaScript 不可用

- 使用普通多页导航。
- 不显示固定 Loader。
- Work 页面直接以最终黑曜主题渲染。

## 11. 响应式规则

| 环境 | 摄像机路径 | Hero 初始比例 | 速度线 |
| --- | --- | --- | --- |
| Large/Wide | 节点 `88% → 50%`，完整透视 | `0.46` | 完整但低对比 |
| Medium | 节点 `86% → 50%`，降低纵深 20% | `0.54` | 数量减少 |
| Compact | 节点 `84% → 50%`，主要使用位移与裁切 | `0.62` | 默认关闭或只保留 2–4 条 |
| 短视口 | 减少垂直位移和模糊 | `0.62` | 关闭 |

- 门户最大半径始终通过实际容器尺寸计算。
- HUD 使用安全边距，不与浏览器工具栏或底部安全区冲突。
- 百分比字号 Compact 不低于 `20px`。
- 320px 宽度下标签允许缩写为 `0`、`SHIFT`、`100`，但 accessible name 保持完整。

## 12. Reduced motion 与可访问性

当 `prefers-reduced-motion: reduce` 生效时：

- 不播放摄像机移动、视差、速度线、页面缩放或圆形门户扩张。
- 不人为等待 `1280ms`。
- 目标准备完成后立即交换主题和页面。
- 进度直接设置为最终值，随后移除 HUD。
- 保留路由公告和目标页面标题公告。

转场激活时：

- Source Page 和 Target Page 的非当前交互层使用 `inert`。
- `body` 锁定滚动，补偿 scrollbar 宽度，避免布局横跳。
- HUD 使用 `pointer-events: none`，不截获点击。
- 完成后焦点遵循 Astro 路由公告和页面主标题；不把焦点留在已移除节点。
- 对比度、节点标签和百分比不能只依赖颜色表达。

## 13. 性能与清理

- 动画优先使用合成属性：`transform`、`opacity` 和 `clip-path`。
- 同时运行一个 GSAP timeline 和一个百分比更新回调。
- 不在每帧重复查询 DOM 或测量多个布局；视口和最大半径在开始与 resize 时缓存。
- 模糊最大 `1.2px`，移动与低性能设备关闭。
- 速度线使用单一 CSS/SVG 合成层，不创建大量 DOM 节点或 Canvas 粒子。
- 页面交换、取消、失败、`visibilitychange` 和 reduced-motion 变化时都有幂等清理。
- 完成后不存在不可见 fixed overlay、滚动锁、`inert`、RAF、timer 或残留 class。

## 14. 验收标准

- 进入时可以明确感到视角向 `100%` 节点移动，而不是页面原地放大。
- 节点圆窗、Work Hero 和摄像机在同一主段同步增长，不存在“到点后再开门”的停顿。
- Work Hero 最终无跳变地成为真实全屏页面。
- 离开时动画是空间与语义上的反向，目标页面从背后连续出现。
- 每次跨越 Work 边界都完整播放；同一会话重复进入也不跳过。
- 点击、浏览器后退/前进、直接访问和刷新 `/work` 行为正确。
- 非 Work 页面互相导航不触发 Work HUD。
- 百分比与门户占据进度同步，没有随机数或伪加载。
- 快速重复点击不会创建双重导航或遗留锁定状态。
- reduced-motion 不延迟导航且内容完整。
- `320×568`、`390×844`、`768×1024`、`1280×720`、`1440×900` 和 `1920×1080` 没有裁切、横向滚动或门户覆盖不足。
- `npm run build` 通过，控制台没有重复监听、未处理 Promise 或 View Transition 错误。

## 15. 参考依据

- [Carbon Design System — Progress indicator](https://carbondesignsystem.com/components/progress-indicator/style/)：阶段、完成状态和轨道语义。
- [Astro — View transitions](https://docs.astro.build/en/guides/view-transitions/)：ClientRouter、前后导航、生命周期和 fallback。
- [MDN — View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)：页面状态连续性与跨文档转场模型。
