# 短写对照表（Schema → 规则骨架）

本文列出所有“字段级短写配置”如何被编译器（Compiler）转换为规则 DSL v2，便于表单设计器与后端配置生成器快速对齐。

术语
- rule：规则对象（RuleV2），包含 id/scope/watch/when/effects/elseEffects
- scope：数组容器（field-group）下的模式路径，如 `rules[].items[]`
- $self：当前作用域下的相对根（如 `$self.methodType`）

## 基础短写
1) showWhen（显示条件）
- 输入：`{ showWhen: 'a == 1' }`
- 规则：
```
{ id: `show_${path}`, scope?, watch:[field], when: expr, effects:[{type:'setVisible', target: targetSelf, value:true}], elseEffects:[{...false}] }
```
- 说明：字符串表达式将被解析为 JSON 表达式；在 scope 内，watch/when 的字段被重写为 `$self.field`

2) hideWhen（隐藏条件）
- 与 showWhen 类似，只是 effects/elseEffects 的 true/false 取反

3) disableWhen / readOnlyWhen / requiredWhen
- 输入：`{ disableWhen:'x' }` / `{ readOnlyWhen:'...' }` / `{ requiredWhen:'...' }`
- 规则：`setDisabled / setReadOnly / setRequired`（带 elseEffects 反向）

4) patchWhen
- 输入：`{ patchWhen:[ { when:'a==1', patch:{ label:'Name*' } } ] }`
- 规则：`effects:[{ type:'patch', target: targetSelf, value: patch }]`

5) valueWhen
- 输入：`{ valueWhen: { when:'a in [1,2]', value: 'X' } }`
- 规则：`effects:[{ type:'set', target: targetSelf, value }]`

6) change（值变更动作）
- 输入：
```
{ change:[
  { target:'b', action:'clearValue' },
  { target:'c', action:'setValue', value: 123 },
  { target:'d', action:'patch', patch:{ placeholder:'...' } },
  { target:'e', action:'copyValue' }
]}
```
- 规则：以“自身”为 watch，转为 set/patch 系列动作；copyValue 等价于 `{ type:'set', value: { var: targetSelf } }`

7) compute（计算字段）
- 输入：`{ compute:{ expr:{ '+':[ {var:'a'},{var:'b'} ] }, when?, watch?, target? } }`
- 规则：
```
{ id:`compute_${target}_${i}`, scope?, watch:[auto + whenDeps + userWatch], when?, effects:[ { type:'set', target, value: expr } ] }
```
- 说明：未显式提供 `watch` 时，从 `expr/when` 的 `{var:...}` 中自动抽取依赖

## 远程选项（optionsFrom）
输入：
```
{ id:'select1', type:'select', label:'S', optionsFrom:'getOptions', params:{ p1:'{{form.a}}' }, fetchOnMount:true }
```
编译：
- fetch_init：`trigger:['init']` + `effects:[{ type:'fetch', requestKey, params, ttl?, cacheKey?, retries?, retryDelayMs? }]`
- fetch_deps：`watch:[autoExtract(params)]` + `effects:[{ type:'fetch', ... }]`
- fetch_visible（可选）：当存在 showWhen/hideWhen 时，在可见为 true 的规则中追加一次 fetch
说明：
- params 支持 `{{form.xxx}}` 模板；编译时自动抽取为依赖
- 运行时资源层支持：ttl/cacheKey/mode/latest|queue|drop/debounce/abort/retries/backoff/onRetry

## 作用域与路径
- form-object：路径直接拼接：`parent.child`
- field-group：进入数组作用域，路径变为模式：`parent[].child`；scope = 模式路径；watch/when 中的相对字段重写为 `$self.xxx`
- targetSelf：对当前字段目标路径的 `$self` 形式（在 scope 内）；否则为绝对路径
- $root/$self/$parent/$item：表达式求值与 Compiler 路径改写统一遵循

## 规则 id 约定（便于诊断）
- show/hide/disable/readOnly/required：`<keyword>_${path}`
- patch/value：`patch_${path}_${i}` / `value_${path}`
- change：`change_${path}_${i}`
- compute：`compute_${target}_${i}`
- optionsFrom：`fetch_init_${path}` / `fetch_deps_${path}` / `fetch_visible_${path}`

## Engine 策略（与短写相关）
- onHide：`keep | clear`（当隐藏为 false 且 onHide='clear' 时，清空值）
- validation.mode：`immediate | touched | submitOnly`（校验行为）

## 组合示例（数组作用域）
```
{
  id:'rules', type:'field-group', label:'规则', template:[
    { id:'methodType', type:'select', label:'方式', props:{ clearable:true } },
    { id:'applicableScope', type:'select', label:'适用范围',
      optionsFrom:'getApplicableScopeOptions', params:{ methodType:'{{form.rules[].methodType}}' }, fetchOnMount:true,
      showWhen:'methodType in [\'mfa\',\'desensitization\']' }
  ]
}
```
- 编译要点：
  - scope=`rules[]`
  - showWhen/watch/when 重写为 `$self.methodType`
  - optionsFrom 依赖从 params 中抽取 `$self.methodType`


## 短写矩阵速查（Schema → Rule 形态）
- `showWhen: expr`
  - watch: `[dep(expr)]`；when: `expr`；effects: `setVisible(targetSelf,true)`；elseEffects: `setVisible(false)`
- `hideWhen: expr`
  - 同上，true/false 取反
- `disableWhen: expr`
  - effects: `setDisabled(true)`；elseEffects: `setDisabled(false)`
- `readOnlyWhen: expr`
  - effects: `setReadOnly(true)`；elseEffects: `setReadOnly(false)`
- `requiredWhen: expr`
  - effects: `setRequired(true)`；elseEffects: `setRequired(false)`
  - 自定义动态必填提示：可在 `requiredWhen` 对象上配置 `message`/`i18nKey`，也兼容 `rules: [{ required:false, message, i18nKey }]`
- `patchWhen: [{ when, patch }]`
  - effects: `patch(targetSelf, patch)`（每项一条规则）
- `valueWhen: { when, value }`
  - effects: `set(targetSelf, value)`
- `change: [{ target, action, value|patch }]`
  - watch: `[self]`；action→effect：`clearValue→set(undefined)`/`setValue→set(value)`/`patch→patch(patch)`/`copyValue→copyValue(from:self)`
- `compute: { expr, when?, watch?, target? }`
  - watch: `watch || deps(expr)+deps(when)`；effects: `set(target||self, expr)`
- `optionsFrom`
  - 触发：`fetch_init`（init）+ `fetch_deps`（params 依赖）+（可选）`fetch_visible`（与 show/hide 联动）

## 交互触发（非值触发）
- 自定义事件：规则可写 `trigger: ['event:save']`
- 运行时触发：`engine.dispatch('event:save')`
- 说明：
  - `change:x.y` 仍是值触发的基础形式（等同对路径的 setValue）。
  - `event:xxx` 适合由按钮/菜单/自定义交互触发；若规则处于 scope 内，将对该 scope 的全部实例执行（每个实例按 `$self` 评估一次）。
