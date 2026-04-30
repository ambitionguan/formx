# FormX — Headless 动态表单引擎与渲染桥

目标
- 纯 JSON 驱动：一份配置描述字段树、联动规则与资源，无函数、无框架依赖
- 任意层级联动：对象、对象数组、数组的数组；作用域复制与通配聚合
- 逻辑与 UI 解耦：Headless 引擎 + UI 套件；可接 Vue/React/原生 DOM
- 高性能：编译期静态化、运行期增量化；轻/重执行器自动切换
- 设计器友好：导出路径注册表、依赖图与表达式 AST（本期预留接口）

目录结构（计划）
packages/share/components/formx/            # 核心包（Headless）
  ├─ ARCHITECTURE.md
  ├─ README.md
  ├─ package.json
  └─ src/
     ├─ core/                # 引擎内核（无 UI）
     │  ├─ Engine.ts         # 外部主入口（Headless API）
     │  ├─ Orchestrator.ts   # 规则调度：依赖图/事务/循环保护
     │  ├─ Compiler.ts       # 短写→规则 DSL v2；配置预处理/索引生成
     │  ├─ Expression.ts     # JSON 表达式求值（含数组高阶运算）
     │  ├─ Path.ts           # 路径解析/相对作用域/通配展开/注册表
     │  ├─ WatchIndex.ts     # Lite 索引：path → rules（直连）
     │  ├─ DepGraph.ts       # Graph 索引：节点/边/拓扑
     │  ├─ Effects.ts        # set/patch/visible/disabled/... 动作
     │  ├─ ResourceManager.ts# 远程数据请求/缓存/并发治理
     │  └─ Validation.ts     # 字段与表单级校验
     ├─ executors/
     │  ├─ LiteExecutor.ts   # 轻规则执行器（<阈值且无通配）
     │  └─ GraphExecutor.ts  # 复杂规则执行器（通配/作用域/聚合）
     └─ demo/
        └─ data-policy.json  # 数据保护规则示例配置

packages/share/components/formx-ep/         # UI 集成包（Element Plus）
  ├─ README.md
  ├─ package.json
  └─ src/
     ├─ renderer/
     │  └─ FormXRenderer.vue # 渲染桥（仅消费 engine 状态）
     └─ kits/element-plus/
        └─ index.ts          # 组件映射表（ElementPlus）

一、配置规范（纯 JSON）
- 顶层：version/formId/model/layout/style/presets/fields/rulesV2/resources
- 字段：id/type/label/default/props/layout/style/visible/disabled/rules/children/template/flatten/containerOnly/role/render
- 短写：showWhen/hideWhen/disableWhen/requiredWhen/valueWhen/patchWhen/optionsFrom/loadOptionsWhen/params/change/clearDependents/compute
- 路径：a.b[2].c；////@key；通配 a.b[].c

二、规则 DSL v2
- id, scope, watch, trigger, when(JSON 表达式), effects, elseEffects, options
- effects：set/patch/setVisible/setDisabled/setRequired/setReadOnly/setOptions/fetch/validate/addItem/removeItem/splice/setSchemaPatch/emit
- 编译一次的是“规则与表达式→索引与指令”；运行期每次变化都会动态求值与执行；隐藏≠移除

三、表达式 DSL
- 基础：== != > >= < <= and or not in nin includes match + - * / iif coalesce
- 变量：{var:a.b[0].c} / {var:.qty}
- 数组高阶：some/every/none/len/includes/uniq/flatten/map/filter/reduce/sum/avg/min/max/groupBy
- 预编译：常量折叠、路径绑定、短路；导出依赖路径集缩小重算

四、路径与作用域
- 路径注册：为每个字段注册完整真实路径；数组元素用稳定 @key
- 近端优先解析：裸 id 按“当前作用域→父级→同级子域聚合→根”解析；歧义提示
- 通配展开：按首个[*] 分段，从前缀对象向后展开；flatten 自动纠正

五、布局与样式（在 UI 包中消费）
- 三层覆盖：全局 layout → 容器 innerLayout → 字段 layout
- 布局类型：grid/flex/horizontal/inline/table/steps/absolute
- 容器：form-object role='layout'、containerOnly、flatten、collapse/legend/header/footer
- 样式：style/styleVars/className/presets；effects.patch 可动态修改

六、运行时引擎（Headless）
- 状态：values（值树）+ state（每字段的 visible/disabled/required/patch/options/errors）
- 事件与事务：dispatch(init/change:path/submit/reset) → 命中规则 → when 求值 → effects 执行 → 单次补丁提交
- 远程资源：requestKey/params/map/ttl/debounce；onInit/onVisible/manual；缓存与并发去重

七、执行器策略（性能）
- LiteExecutor：规则<阈值且无通配 → Map<path, rules> 直连，简化求值器，微任务合并
- GraphExecutor：通配/作用域/聚合或规则≥阈值 → 依赖图 + scope 实例工厂 + 聚合缓存
- 循环保护：值未变不传播 + oncePerTick + maxHops；开发态可开启 DAG 检测

八、Headless API（核心包暴露）
- new FormXEngine({ schema, model, rulesV2, resources, performance? })
- getValues()/getState()/setValue()/getValue()/dispatch()/subscribe()/subscribePaths()/applySchemaPatch()/validate()/getErrors()
- registerFieldContext(path, runtimeContext)

九、UI 包（formx-ep）职责
- 渲染桥：FormXRenderer.vue 仅消费 engine 的 values/state 和 fields
- 组件映射：kits/element-plus/index.ts 定义 type → 实际组件 + props 转换
- 事件桥接：onChange(path,val) → engine.dispatch('change:path', val)
- 样式落地：className/styleVars/presets 的具体渲染
- 与核心解耦：核心包不依赖任何 UI；UI 包通过 peer 依赖核心包

十、开发者体验（少记忆）
- 裸 id 与  就近解析；常用布局默认；容器=布局（role='layout'）
- 资源短写：optionsFrom + params 模板，自动推断依赖 watch 与清空
- 运行时 patch：effects.patch 统一改 label/props/style/layout

十一、性能默认值
- liteRuleThreshold: 30；debounceDefault: 16ms；maxHops: 12；aggregateCache: true；lazyScope: true；virtualizationWindow: 50；schedule: 'microtask'

十二、与现有项目集成
- 保留旧 dynamic-form；新增 formx 与 formx-ep 并行试用
- 首个用例：数据保护规则（rules[].protectionMethods[] 的任意层级联动与远程 optionsFrom）

十三、后续（预留）
- 规则设计器、依赖图可视化、片段库
