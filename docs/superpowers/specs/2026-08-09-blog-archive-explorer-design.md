# Blog Archive Explorer Design

**Date:** 2026-08-09

## Goal

改造 `/blog` 的第二屏 Archive：默认提供每页 5 篇文章的分页浏览，并在 Archive 标题右侧提供模式滑块，切换到基于 React Bits `AnimatedList` 参考实现的快速浏览模式。

## Confirmed requirements

- 分页模式是默认模式，每页 5 篇。
- 分页状态写入 `?page=N`，刷新和浏览器前进/后退可以恢复页码。
- 快速浏览模式不写入 URL；刷新后回到分页模式。
- 快速浏览使用固定高度的滚动框，保留文章标题、标签、日期和可选图片。
- 两种模式共享文章行的视觉与链接行为。
- 快速浏览支持鼠标滚轮、触摸滚动和键盘操作，并保留 React Bits 的进入/离开视口动画与上下渐变提示。

## Architecture

`src/pages/blog/index.astro` 继续通过 `getPublishedPosts()` 获取内容、执行静态渲染，并把可序列化的文章摘要传入一个 `client:load` React Island。Island `BlogArchiveExplorer` 统一管理模式、分页、URL 和浏览器历史状态。文章行由 `ArchivePostRow` 复用；`AnimatedArchiveList` 只负责快速模式的滚动容器、选中状态和动效。

现有 `framer-motion` 依赖提供 `motion` 与 `useInView`，实现参考组件的动画，不额外引入重复的 `motion` 包。组件样式沿用 `src/styles/blog.css` 的颜色变量、字体和 Archive 行视觉，新增样式集中在该文件末尾，避免改变首页或文章详情页。

## Data flow and interaction

文章摘要包含 `id`、`title`、`description`、ISO 日期字符串、`tags`、可选 `image` 和用于标题分组的 `year`。Island 初始化时从 `window.location.search` 读取页码，将非法值、负数和超出范围的值归一到有效页码。

分页模式把文章按当前页切片后按年份分组，渲染年份标题、最多 5 行文章和 Previous/Next/页码控件。分页变化通过 `history.pushState` 更新 `?page=N`，监听 `popstate` 使浏览器前进/后退同步 UI。分页控件在只有一页时隐藏。

模式滑块使用原生 checkbox 语义和可见文字标签，默认关闭。开启时渲染完整文章数组的快速列表；关闭时回到当前 URL 页码对应的分页内容。快速列表中的文章链接使用 `/blog/{id}`，不会阻止普通链接行为。

键盘导航只在快速列表容器获得焦点或其子元素操作时生效，避免与现有页面级 ArrowUp/ArrowDown 章节导航冲突。Enter 激活当前文章，Escape 将焦点返回模式滑块。

## Accessibility and responsive behavior

- 模式切换控件提供明确的 `label`、`role="switch"`/checkbox 语义和 `aria-checked` 状态。
- 分页控件使用 `nav`、按钮名称和 `aria-current="page"`；状态文本使用 `aria-live="polite"` 宣布页码变化。
- 快速列表容器有可见焦点样式、合理的 `aria-label` 和原生滚动语义；文章链接保持键盘可达。
- `prefers-reduced-motion: reduce` 时关闭缩放/淡入动效并使用即时滚动。
- 桌面端滑块与 Archive 标题同一行；窄屏下允许换行，快速列表高度降低，文章行图片按现有移动端规则铺到下一行。

## Empty and error states

- 无文章时保留 Archive 标题，显示现有 “No posts yet.” 文案，隐藏分页和快速模式切换。
- 可选图片加载失败不影响文章行，图片元素保留布局但不显示破损图标。
- URL 页码无效时自动归一化到第一页或最后一页，不抛出运行时错误。

## Verification and acceptance

- `npm run build` 成功，静态生成 `/blog` 及所有文章详情页。
- 手动验证：默认分页、5 篇边界、上一页/下一页、直接打开 `?page=N`、浏览器后退/前进、模式切换、快速滚动、点击文章、空列表和移动端布局。
- 检查浏览器控制台无 hydration、React 或未处理事件错误。
- 在减少动画设置下确认页面仍可操作，且 Archive 第二屏滚动吸附和现有章节导航不受影响。

## Alternatives considered

1. Astro 分页与 React 快速列表分离：首屏脚本更少，但需要维护两套列表结构和状态同步。
2. 纯 Astro/原生脚本移植：依赖更少，但无法直接复用给出的 React Bits 组件结构，键盘和动画状态更复杂。

单一 React Island 被选中，因为它把两种模式的状态与可访问性边界集中在一个组件中，同时保留 Astro 的静态内容读取和页面外壳。
