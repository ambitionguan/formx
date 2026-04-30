FormX 使用注意事项（Best Practices）
==================================

补充文档
- Vue / Dialog / 异步回填 / 竞态控制：见 `async-runtime.md`

配置与 Schema
- JSON 化：表单与规则必须是纯 JSON；不支持直接放函数。逻辑用 JSON 表达式与短写（showWhen/hideWhen/compute/change 等）。
- 字段 id：同一容器（form-object/field-group）下 id 必须唯一。数组（field-group）下的模板 id 相对于容器唯一即可。
- 布局容器：form-object 常作为布局容器使用；其 children 仅影响路径前缀与 PathRegistry 组织，不直接产生值。
- 渲染模式：renderMode 'show' 仅隐藏 DOM；'if' 彻底移除节点（建议与 onHide 策略配合）。

路径与作用域
- 绝对/相对路径：规则与 effect 的 target/watch 支持 $root/$self/$parent，编译时/运行时会解析到绝对路径。
- Pattern：'[]' 表示数组中任意索引；'[*]' 在 watch 模式下等价。'$parent.list[].a' 命中时可触发同父容器 siblings 重算。
- PathRegistry：buildPathRegistry(schema) 会记录每个字段的模式路径与父容器，便于定位/诊断。
- resolveNearestPath：用于把裸 id（如 'name'）解析为当前作用域最近的模式路径（在嵌套容器下尤为有用）。

表达式与短写
- JSON 表达式：`var` / `and` / `or` / `not` / `==` / `!=` / `>` / `>=` / `<` / `<=` / `in` / `nin` / `includes` / `startsWith` / `endsWith` / `match` / `iif` / `coalesce` / `some` / `every` / `none` / `len` / `sum` / `avg` / `+` / `-` / `*` / `/`。
- $item：在 some/every/none/sum/avg 中，谓词/映射表达式通过 { var: '$item.xxx' } 访问当前迭代项。
- 短写编译：showWhen/hideWhen/disableWhen/readOnlyWhen/requiredWhen/valueWhen/change/compute 在编译期转为 RuleV2。
- 模板：'{{ form.a.b }}'/'{{ $self.xxx }}'/'{{ $parent.xxx }}'/'{{ $root.xxx }}' 支持混合文本与表达式，运行期通过 resolveParams 展开。
- 真值语义：表达式严格比较（===）；逻辑型操作不会做隐式字符串转数字转换，注意类型一致性。

规则与效果
- rule.id：必须全局唯一；用于诊断、增量更新与 ownerIndex。
- watch vs trigger：watch 监听值变化；trigger 支持 `change:<path>` 和 `event:<name>` 主动触发规则。
- when/elseEffects：条件不满足时执行 elseEffects。建议尽量避免两侧都写大量 effect 造成抖动。
- effect 常用：set/patch/setVisible/setDisabled/setRequired/setReadOnly/setOptions/fetch/validate/addItem/removeItem/splice/setSchemaPatch/batch/dispatch/toggle/copyValue。
- setVisible 策略：EnginePolicyOptions.onHide='clear' 时，隐藏字段会清空值（并加入 diff 队列）。
- omitOnSubmit：提交时是否剔除隐藏字段的值。

远程资源
- 注册：FormXEngine.registerRequest(key, async (params) => data)。
- fetch 效果：{ type:'fetch', target:'$self.select', requestKey:'users', params:{ q:'{{ form.keyword }}' }, mode:'latest', debounceMs:300, ttl:3_000 }。
- 模式：mode 'latest'（默认）自动取消过期请求；'queue' 顺序执行；'drop' 丢弃并发。
- 映射：map 可将远端字段映射为 { label, value, children }；fallbackOptions 在失败时使用。

性能与调优
- 执行器：useGraph 'auto'（默认）/ 'on' / 'off'；liteRuleThreshold（默认 30）决定 auto 的切换阈值。
- 通配重算：recalcScope 'siblings' 建议在大数组 + 通配聚合场景使用，明显减少实例重算量。
- 聚合缓存：aggregateCache=true 可缓存一次 dispatch 内 some/every/none/sum/avg 的结果（按 op + 基路径 + 表达式），与 siblings 搭配更佳。
- tokenize LRU：内部针对 tokenize 做了小型 LRU，无需配置；避免重复解析路径。
- 调度：schedule 'microtask'（默认）或 'raf'（大页面渲染时更友好，避免频繁同步渲染）。
- 传播限制：maxHops（默认 12），超过会触发 'cycle:detected' 事件；排查循环时降低规则互相 set 的耦合。

增量 Schema 变更
- applySchemaPatch([{ op:'add'|'replace'|'remove', path, value }])：引擎会对受影响子树重新编译，并增量更新 watch 索引与执行图。
- 短写兼容：新增字段的 showWhen/hideWhen 等会被编译为 RuleV2，参与增量索引。
- 缓存失效：数组结构变更后，如绕过 effect 直接操作 values，需调用 engine.invalidateScopeCacheForPath('rules[3]') 精确失效。

诊断与调试
- getDiagnostics():
  - rules/watchIndex/patternWatchers/pathRegistry：结构与索引预览
  - graph：拓扑/子图/candidates/ordered；scopeRecalc（total/last）
  - perfTrace：最近 50 次调度时延（p50/p95/max/last）
- 事件：fetch:success/fetch:error/graph:cycles/graph:cycles:detail/cycle:detected，可在 UI 订阅打印与提示。
- 子图输出：getGraphSubgraphForPath('rules[0].items[0].a') 导出子图节点/有向边/拓扑序，便于定位联动链路。

UI 适配建议
- Headless：UI 适配器仅依赖 Engine 公共 API。渲染时读取 values 与 state[path] 的 visible/disabled/required/readOnly/options/errors/loading/patch。
- 订阅：subscribe（全局 diff）、subscribePaths（路径模式）、on（自定义事件）；渲染时最小化重渲成本（建议控制容器粒度）。
- 虚拟化：大表单建议组件层做虚拟化，仅渲染可视区字段；减少不必要的 diff->render 抖动。

常见坑位（Checklist）
- rule.id 重复：导致增量更新与诊断异常；务必唯一。
- 过度耦合的 set：两条规则相互 set 可能形成循环；利用 oncePerTick（预留）/debounce/事件触发化解。
- `$parent` 拼接：当 `$parent.<base>` 与 `selfPath` 的父路径相同，系统会避免重复拼接；无需手动去重。
- optionsFrom 与 fetch 并用：若仅要静态选项，使用 setOptions；远端选项用 fetch 并设置 map/fallbackOptions。
- onHide='clear'：隐藏后值被清空，可能触发更多联动；必要时配合 oncePerTick 或条件避免抖动。
- 大数组 + 通配：优先开启 recalcScope='siblings' 与 aggregateCache。
