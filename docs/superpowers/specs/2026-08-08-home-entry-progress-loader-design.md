# Home Entry Progress Loader Design

## Goal

在博客首页首次进入时增加一个约 1.3 秒的全屏入口加载层，只展示从左到右推进的 `0% / 25% / 50% / 75% / 100%` 进度条；完成后加载层退出，用户进入现有 Hero 与正文内容。

## Visual direction

- 延续当前的暖纸色 `#faf8f5`、墨色 `#1a1a1a`、sage `#5b7553`、terracotta `#c97b5a` 和细边线体系。
- 加载层保持极简，只保留一条细横线、五个节点及百分比刻度，不加入标题、插画或额外品牌文案。
- 中文/数字组合采用当前系统字体栈：中文使用 `PingFang SC` / `Microsoft YaHei` 等系统黑体，数字使用当前项目的等宽字体栈，形成喜茶式的高字重中文与 Claude 式编辑感的克制排版。
- 不嵌入喜茶或其他品牌的专有字体文件；如后续取得合法字体资产，只替换字体 token，不改变组件结构。

## Behavior

1. 首页载入时显示 fixed 全屏遮罩，默认进度为 `0%`。
2. GSAP timeline 在约 1300ms 内依次激活五个节点，进度线平滑增长至 `100%`。
3. 达到 `100%` 后执行一次向上退出动画，遮罩设置为不可见并从交互层移除。
4. 组件只在当前页面生命周期内运行一次；刷新页面时重新播放，站内其他页面不加入入口遮罩。
5. `prefers-reduced-motion: reduce` 时跳过进度动画，直接呈现 `100%` 并快速退出，同时仍保留可感知的加载层状态。
6. 进度条与节点使用语义化的 `role="progressbar"`、`aria-valuenow`、`aria-valuemin` 和 `aria-valuemax`，不依赖颜色表达唯一状态。

## Architecture

- `src/components/entry/EntryProgressLoader.astro`: 负责静态标记、可访问性属性、GSAP 客户端脚本和组件局部样式。
- `src/layouts/Base.astro`: 在页面主体 z-index 层之前渲染入口加载器，使其覆盖 Header、main 和 Footer，但只在首页通过 props 开启。
- `src/pages/index.astro`: 传入 `showEntryLoader`，保留现有 Hero 与内容层级；不修改 Hero 的数据与导航行为。
- `src/styles/global.css`: 仅新增可复用的入口加载器字体 token/颜色引用（如确有必要），不改动现有章节和 Hero 样式。
- `package.json` / `package-lock.json`: 增加 `gsap` 运行时依赖。

## Testing and verification

- 新增静态测试，确认组件包含五个百分比节点、progressbar ARIA 属性、GSAP 入口和 reduced-motion 分支。
- 扩展首页测试，确认首页挂载入口加载器而其他页面不挂载。
- 运行现有测试、`npm run build`，并在真实浏览器中检查首次载入、完成退出、移动端宽度、控制台错误和 reduced-motion 样式。

## Scope boundaries

- 不重做现有 Hero，不加入 ScrollTrigger 或改变 Hero 的滚动行为。
- 不下载外部字体、不接入外部字体 CDN。
- 不在加载层展示动态业务数据；百分比是入口视觉节奏，不代表真实资源下载进度。
