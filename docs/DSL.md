# FormX JSON DSL 与短写

本文件概述 FormX 的纯 JSON 表达式与字段短写规则，便于“在线设计器”与后端配置生成。

## 表达式（Expression）
- 变量：`{"var": "a.b[0].c"}`，支持 `$root` `$self` `$parent` `$item`
- 逻辑：`and` `or` `not`
- 比较：`==` `!=` `>` `>=` `<` `<=` `in` `nin`
- 字符串：`includes` `startsWith` `endsWith` `match`
- 三元/空合并：`iif` `coalesce`
- 数组聚合：`some` `every` `none` `len` `sum` `avg`

示例：
```
{"and": [ {"==": [ {"var": "$self.type" }, "mfa" ] }, {"some": [ "$self.users[]", {">": [ {"var": "$item.weight"}, 10 ] } ] } ]}
```

## 短写 → 规则（Compiler）
- `showWhen`/`hideWhen`/`disableWhen`/`readOnlyWhen`/`requiredWhen`
  - 例：`{"showWhen": "a == 1"}` 编译为规则：`watch: ['a']`，满足时 `setVisible true`，否则 `false`
- `patchWhen: [{ when, patch }]` 动态修改 label/props/style/layout
- `valueWhen: { when, value }` 满足时 `set`
- `change` 简写：`[{ target, action, value|patch }]`，等价于 `watch: [self]` 的 set/patch
- `compute`：`{ expr, when?, watch?, target? }` 若未指定 watch 则自动从 expr/when 抽取依赖
- `optionsFrom` 远程选项：
  - `fetchOnMount` 时编译 `trigger: ['init']`
  - `params` 模板中的 `{{form.xxx}}` 自动抽取为依赖 watch

示例：
```
// 1) showWhen/hideWhen：a == 1 时显示 field b
{ "id": "b", "type": "input", "label": "B", "showWhen": "a == 1" }
// 编译要点：
// - watch: ['a']
// - when: { '==': [ { var: 'a' }, 1 ] }
// - effects: [ { type: 'setVisible', target: 'b', value: true } ]
// - elseEffects: [ { type: 'setVisible', target: 'b', value: false } ]

// 2) compute：c = a + b，在 a/b 任一变化时更新
{ "id": "c", "type": "number", "label": "C", "compute": { "expr": { "+": [ {"var":"a"}, {"var":"b"} ] } } }
// 编译要点：
// - 自动从 expr 中提取 watch: ['a','b']
// - effects: [ { type:'set', target:'c', value: expr } ]

// 3) change：d 变化时清空 e
{ "id": "d", "type": "input", "label": "D", "change": [ { "target": "e", "action": "clearValue" } ] }
// 编译要点：
// - watch: ['d']
// - effects: [ { type: 'set', target:'e', value: undefined } ]

// 4) optionsFrom：select f 的下拉由接口，受 g 影响
{ "id": "f", "type": "select", "label": "F", "optionsFrom": "getOptions", "params": { "g": "{{form.g}}" }, "fetchOnMount": true }
// 编译要点：
// - init 拉取：trigger:['init'] → fetch(requestKey:'getOptions', params)
// - 依赖拉取：watch:['g'] → fetch(...)
// - 如存在 showWhen/hideWhen，则在条件为真时追加一次 fetch
```

容器与作用域：
- `form-object` 子节点路径 `parent.child`
- `field-group` 子节点路径 `parent[].child`，所有短写均在 `$self` 作用域内编译

跨兄弟聚合（数组内同级联动）：
- 目标：同一父容器下的“任意一项”满足条件，影响所有兄弟项（如隐藏/禁用/必填等）。
- 写法要点：
  - 规则使用 `scope: 'list[]'` 落在单个条目的作用域上；`target` 用 `$self.xxx` 表示当前条目的字段。
  - `watch` 指向父容器下的通配路径，如 `'$parent.list[].a'`，表示兄弟项 a 的任何变化。
  - `when` 使用数组高阶表达式：`{ some: [ '$parent.list[]', { '==': [ { var: '$item.a' }, 1 ] } ] }`。
  - 引擎将对命中该通配监听的变更“对同一父容器的所有实例”重算，确保兄弟联动一致。

示例：
```
// 兄弟聚合：任意 a==1 时，隐藏所有 b
{
  id: 'hide_b_if_any_a_1',
  scope: 'list[]',
  watch: ['$parent.list[].a'],
  when: { some: [ '$parent.list[]', { '==': [ { var: '$item.a' }, 1 ] } ] },
  effects: [ { type: 'setVisible', target: '$self.b', value: false } ],
  elseEffects: [ { type: 'setVisible', target: '$self.b', value: true } ]
}
```

## 资源（Resource）与桥接
- 规则动作：`{ type: 'fetch', requestKey, params?, ttl?, cacheKey?, mode?, debounceMs?, retries?, retryDelayMs?, backoff?, onRetry? }`
- 运行时：在 UI 可见时或依赖变化时触发 fetch；Engine 内置缓存、并发去重、重试回退
- UI 桥接（EP）：
  - Cascader：`props.lazy=true` + `props.lazyLoadResource='getNodes'`
  - Upload：`props.httpRequestResource='uploadFile'`

示例：
```
{ "id": "regionLazy", "type": "cascader", "label": "区域(懒加载)",
  "props": { "clearable": true, "filterable": true, "props": { "lazy": true, "lazyLoadResource": "getRegionChildren" } } }

{ "id": "file2", "type": "upload", "label": "上传(资源)",
  "props": { "listType": "text", "httpRequestResource": "uploadFile", "valueType": "fileList" } }
```

## 校验策略
- `policy.validation.mode`：`'immediate' | 'touched' | 'submitOnly'`（默认 `touched`）
- `validatePath(path, trigger)` 支持 `'change'|'blur'|'submit'`
- `getFirstErrorPath()` 可用于滚动到首个错误
// 规则动作 fetch：当 $self.methodType 变化时为 $self.applicableScope 拉取下拉
{ "id":"applicableScope", "type":"select", "optionsFrom":"getApplicableScopeOptions",
  "params": { "methodType": {"var":"$self.methodType"} }, "fetchOnMount": true }

更多路径/作用域示例，请参考：docs/components/formx/paths-cheatsheet.md
设计器友好速查：docs/components/formx/designer-cheatsheet.md
