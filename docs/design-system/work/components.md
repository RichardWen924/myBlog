# Work 组件体系

本文件定义 Obsidian Circuit 的组件职责、视觉状态和组合边界。组件名表达设计系统边界，不强制最终文件名完全一致。

## 1. 分层原则

- **Theme** 只提供 token 和环境，不承担页面结构。
- **Structure** 负责章节与网格，不理解具体项目或经历数据。
- **Primitive** 是最小可复用视觉单元。
- **Content** 负责一种内容模型，例如项目或经历。
- **Composition** 组合多个组件完成章节，不复制底层样式。
- **Motion** 只暴露动效能力，不拥有业务内容。

静态组件优先使用 `.astro`；需要交互状态、Canvas、指针响应或复杂时间线时才使用 `.tsx`。

## 2. Theme 与结构组件

### 2.1 `WorkThemeScope`

职责：在 Work 根节点提供主题 token 和颜色作用域。

- 建议使用 `.work-page` 或 `[data-theme="work"]`。
- 不修改 `:root` 中的全站母系统值。
- 允许子组件覆盖局部密度，不允许覆盖核心色彩语义。
- 组件卸载或离开 Work 后不得残留主题 class。

### 2.2 `WorkShell`

职责：提供最大宽度、安全边距、背景网格和章节容器。

- 背景默认使用 `--work-canvas`。
- 全局网格透明度保持低于关键内容结构线。
- 不在 Shell 内直接渲染粒子、轨道或业务文案。
- Shell 支持全宽 Hero 和受限宽度内容区两种 slot。

### 2.3 `WorkGrid`

职责：提供 12/8/4 栏布局和统一 gap。

- 接受栏跨度，不接受具体业务类型。
- 子项可以跨栏，但不得通过任意绝对定位绕开网格完成主要布局。
- 装饰层可绝对定位，但必须 `pointer-events: none`。

### 2.4 `WorkChapter`

职责：包装 Hero、Profile、Systems、Projects、Experience 和 More 六个章节。

- 提供 `id`、章节索引、可选状态和导航观察锚点。
- 桌面长视口可使用整屏吸附；短视口和移动端允许自然高度。
- 支持标题区、主内容区和可选视觉区三个 slot。
- 不在组件内部读取全局项目或经历数据。

### 2.5 `WorkSectionHeader`

职责：统一章节索引、标签、标题和可选说明。

- 索引使用等宽字体，标签使用短英文大写。
- 标题可选择静态或 Kinetic variant。
- 同一标题只允许一个强调机制：描边、裁切或信号色，三者不可叠加。
- 小屏隐藏低价值状态文字，但保留章节含义。

## 3. 导航与进度

### 3.1 `ChapterRail`

职责：显示六个章节并反馈当前章节。

状态：

- Default：透明背景、深绿边框、灰绿编号。
- Hover：边框和编号转为信号色，不进行大幅缩放。
- Active：小面积信号色实心，文字使用黑曜石黑。
- Focus-visible：2px 信号色外描边，offset 3px。
- Mobile：变为底部横向导航，触控目标至少 44px。

信息规则：编号必须与章节对应，使用 `aria-current="step"` 表达当前状态。

### 3.2 `ScrollProgress`

职责：显示当前章节或页面阅读进度。

- 默认高度 2px，不使用粗进度条。
- 进度变化可使用 transform，不逐帧修改宽度。
- 数值只在真实计算时显示；否则仅显示线路。
- 不与 ChapterRail 重复显示同一百分比。

### 3.3 `TransitionLoader`

职责：从全站暖纸母系统过渡到 Work 黑曜构域。

- 首次进入可显示 `900–1100ms`。
- 同一会话返回时应跳过或压缩为 `180–240ms`。
- 过渡只表达主题切换，不展示伪编译、伪联网或伪系统日志。
- reduced-motion 下直接切换最终主题，不阻塞内容。
- Loader 激活时正确管理 `inert`、焦点和滚动锁，退出后完全清理。

## 4. 基础视觉原语

### 4.1 `KineticHeading`

职责：为 Hero 或章节标题提供描边、裁切、粒子解析或遮罩揭示。

- 只用于每屏的主标题。
- 默认静态状态必须清晰可读。
- 描边文本不能成为唯一可访问文本；辅助技术读取实心语义标题。
- 同一实例最多使用两阶段变化，例如 `stroke → solid` 或 `stroke → particle`。

### 4.2 `SignalLabel`

职责：显示短状态或当前结构标签。

- 由 6px 方形信号点和等宽短文本组成。
- 仅用于真实状态，例如 `CURRENT RESEARCH` 或 `SELECTED`。
- 不用于装饰性 `ONLINE`、`SYNCING` 或随机系统文字。

### 4.3 `SectionLabel`

职责：显示章节类别，例如 `TECHNICAL PRACTICE`。

- 默认灰绿，字距 `0.12–0.18em`。
- 不与同义中文标签重复展示。
- 长度控制在一行以内。

### 4.4 `MetaLine`

职责：组织日期、年份、技术组合或真实编号。

- 使用中点或短线分隔，不使用胶囊容器。
- 移动端允许换行，但不缩小到 11px 以下。
- 低价值元数据可以在移动端隐藏。

### 4.5 `TechTag`

职责：显示技术、能力类别或可过滤的真实标签。

状态：Default、Hover、Active、Focus-visible。

- 圆角 `0–2px`，1px 深绿边框。
- Active 只使用低透明度信号色底和信号色文字。
- 每个内容项默认不超过 4–6 个标签。
- 标签不是自评等级，不显示星级或百分比。

### 4.6 `TextAction`

职责：主要文字入口，例如 `Explore project →`。

- 最小高度 44px。
- 默认下划线只显示短段，Hover 或 Focus 时展开。
- 箭头最多位移 4px。
- 不使用胶囊背景。

### 4.7 `OutlineAction`

职责：需要明确交互边界的次级操作。

- 透明背景、1px 深绿边框。
- Hover 和 Focus 使用信号色边框，不整体上浮。
- 仅在 TextAction 无法提供足够可发现性时使用。

### 4.8 `IconAction`

职责：上一章、下一章、展开和关闭等图标操作。

- 视觉尺寸可小于 44px，但交互区域必须达到 44×44px。
- 必须提供可访问名称。
- 不单独使用抽象图标表达复杂操作。

### 4.9 `StatusSignal`

职责：表达真实的 active、archived 或 in-progress 状态。

- Active：实心薄荷绿小方点。
- Archived：降低透明度。
- In progress：空心信号点。
- 状态文字必须同时存在，不能只依赖颜色。

### 4.10 `StructureDivider`

职责：建立模块、章节和跨栏关系。

- 默认 1px `--work-line`。
- 当前关系可短暂转为 `--work-signal`。
- 不使用渐变边框、发光边框或装饰性双线。

## 5. 内容与证据组件

### 5.1 `ProfileIntro`

职责：组合姓名、身份陈述和当前研究方向。

- 允许使用一次 Decrypted Text 进入效果。
- 身份文案优先于装饰图形。
- 不把简介拆成多个相同卡片。
- 移动端保持姓名、核心身份和当前方向前三项信息。

### 5.2 `TimelineEntry`

职责：表达一段工作、实习或教育经历。

内容顺序：日期、角色、组织、地点、职责/结果。

- 左侧使用 1px 时间轴和小节点。
- 节点大小不表示重要程度。
- 每段描述控制在 2–4 条真实信息。
- 未完成占位经历应隐藏，不进入正式页面。

### 5.3 `ExperienceTimeline`

职责：排序并组合多个 `TimelineEntry`。

- 默认时间逆序。
- 不承担单条经历的排版细节。
- 小屏保持单列，不转换为横向拖拽时间线。
- 条目进入 stagger 上限为 6 个，更多条目分批或直接显示。

### 5.4 `CapabilityNode`

职责：表示 Backend、Frontend、Infrastructure 或 Tooling 等能力类别。

- 节点大小只在有明确数据模型时表达权重；默认保持一致。
- Hover、Focus 或点击必须关联 `EvidencePanel`。
- 键盘和触控可完成与指针相同的选择。
- 节点连线表示真实组合关系，不表示装饰性网络。

### 5.5 `EvidencePanel`

职责：解释当前能力节点对应的项目、职责和技术组合。

- 内容包括能力定义、1–3 个证据入口和相关技术。
- 桌面保持固定区域更新，避免布局跳动。
- 移动端在选中节点下方展开。
- 空证据节点不得显示为可交互。

### 5.6 `CapabilityMap`

职责：组合能力节点、关系线和证据面板。

- 桌面使用可探索关系图。
- 平板减少次级连线与持续动画。
- 移动端降级为分组列表，不压缩完整轨道图。
- reduced-motion 下线路和节点直接显示最终状态。

### 5.7 `ProjectRow`

职责：以线性、可扫描的方式展示项目摘要。

内容顺序：索引、标题、年份、摘要、技术、入口。

- 使用上下分隔线，不包裹成浮动卡片。
- Hover 只改变标题、结构线和箭头，最大位移 2px。
- 整行可以成为链接，但内部不得嵌套第二个交互元素。
- 技术标签显示 3 个左右，其余内容进入项目详情页。

### 5.8 `ProjectIndex`

职责：排序并组合多个 `ProjectRow`。

- 默认按代表性或时间排序，排序规则必须稳定。
- 空数据使用 `EmptyState`。
- 不添加虚构项目填充视觉空间。

### 5.9 `CaseStudyPanel`

职责：在未来组件形态变化时提供项目案例摘要。

内容结构：问题、角色、系统、关键决策、结果、复盘。

- 只在确有足够案例内容时使用。
- 真实截图、架构图和运行结果优先于抽象装饰图。
- 一个页面区域最多突出一个 Case Study Panel。

### 5.10 `StatusList`

职责：展示真实的当前研究、案例状态或探索状态。

- 每行包含状态点、名称和状态文字。
- 只展示用户能够理解或验证的状态。
- 不承担导航职责，除非整行明确为链接。

### 5.11 `ClosingLinks`

职责：提供 Projects、Blog 或联系方式的继续探索入口。

- 使用 TextAction 组成，不创建 CTA 卡片组。
- 入口数量控制在 2–3 个。
- 链接文案描述去向，不使用含糊的 `Learn more`。

### 5.12 `EmptyState`

职责：诚实表达内容缺失。

- 使用虚线或低对比结构线，不使用插画占位。
- 文案说明当前没有内容，不承诺不存在的发布时间。
- 如果用户可以采取下一步操作，可提供一个 TextAction。

## 6. 动效原语

### 6.1 `StrokeToParticle`

职责：Hero 标题从描边建立为粒子或实心文字。

- 每次页面进入最多运行一次。
- 粒子完成后文字必须保持稳定，不持续散开。
- 触控、小屏或性能不足时可降级为 `stroke → solid`。
- reduced-motion 下直接显示实心最终状态。

### 6.2 `MaskReveal`

职责：标题和正文进入视口时揭示。

- 位移上限：桌面 16px、移动 8px。
- 默认只使用 opacity 和 transform。
- 同组 stagger 不超过 6 项。

### 6.3 `LineDraw`

职责：建立网格、节点或章节之间的真实关系。

- 使用 `scaleX`、`scaleY` 或 SVG `pathLength`。
- 关系建立完成后停止。
- 不让所有分隔线重复绘制。

### 6.4 `NodePulse`

职责：提示当前、可交互或刚建立的节点。

- 同屏最多一个持续 pulse。
- 频率缓慢，不模拟警报。
- 非当前节点保持静止。

### 6.5 `DecryptedText`

职责：用于 Profile 或短标题的字符解密进入效果。

- 单次文本建议不超过 18 个拉丁字符或 10 个中文字符。
- 不用于正文、日期或关键信息持续闪烁。
- 动画结束后输出稳定文本。

### 6.6 `MagneticResponse`

职责：为少量主要操作或节点提供精确指针反馈。

- 最大位移 4px。
- 仅在 `(pointer: fine)` 启用。
- 不改变点击目标位置和布局。
- reduced-motion 或 coarse pointer 下关闭。

## 7. 组合模块与章节映射

| 当前章节 | 主要组合 | 可用动效 |
| --- | --- | --- |
| Hero | `WorkChapter` + `KineticHeading` + `ScrollProgress` | `StrokeToParticle`、`LineDraw` |
| Who am I | `ProfileIntro` + `ExperienceTimeline` | `DecryptedText`、`MaskReveal` |
| Systems | `WorkSectionHeader` + `CapabilityMap` + `EvidencePanel` | `LineDraw`、`NodePulse` |
| Projects | `WorkSectionHeader` + `ProjectIndex` | `MaskReveal`、轻量 Hover |
| Experience | `WorkSectionHeader` + `ExperienceTimeline` | `MaskReveal` |
| More | `WorkSectionHeader` + `ClosingLinks` | 线路展开反馈 |

## 8. 禁止的组件模式

- 多列相同圆角卡片墙。
- 无内容依据的 Metric Card、Status Card 和 Terminal Card。
- 纯装饰性 Bento Grid。
- 依赖 Hover 才能读取正文的卡片。
- 同时包含粒子、3D、发光、模糊和磁吸的“全效果组件”。
- 为视觉完整度创建不存在的项目、经历、客户评价或性能数字。
