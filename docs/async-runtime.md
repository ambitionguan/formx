FormX 渲染时机与异步业务接入
================================

适用范围
--------

本文重点说明 **Vue 场景** 下的 FormX 使用时机，尤其是：

- `Dialog / Drawer / 条件渲染` 中的表单挂载
- `CRUD 编辑 -> 打开弹窗 -> 异步拉详情 -> 回填表单`
- `Dialog 未打开时先预取详情`
- `连续点击多条记录` 的竞态覆盖
- `关闭弹窗后旧请求返回`

说明：

- `@formxjs/core` 是 headless 引擎，本身不依赖 UI。
- 本文提到的“挂载时机 / nextTick / formRef / Dialog opened”主要发生在 `@formxjs/vue` / `FormXVueEp` 这层 UI 封装中。


核心结论
--------

- **不是所有异步场景都必须用 `nextTick()`。**
- `nextTick()` 只用于解决：**你已经触发了 UI 显示，但子组件实例还没真正可用**。
- 如果 `FormX` 已经挂载，只是要更新数据，通常**不需要** `nextTick()`。
- 如果你要立刻访问 `formRef.value`、`formRef.value.engine`、`validate()`、`reset()`、`setValue()`，就必须先保证 `FormX` 实例已经存在。
- 标准业务中，异步问题通常不是“值赋不上”，而是下面几类时序错误：
  - 写值时子组件还没挂载
  - 旧请求覆盖新请求
  - 关闭弹窗后旧请求仍继续回填
  - 误把“全量替换”写成了“局部 merge”
  - 误以为 `resetFields()` 会回到“最新详情”，实际上它回到的是“实例创建时的初始值”


FormX 在 Vue 中的关键时序
-------------------------

### 1. 首次创建

`FormX` 组件创建时，会基于当前的：

- `props.value`
- `props.defaultValue`
- `props.schema.model`

三者之一生成初始 model，并创建内部 engine。

因此：

- **如果你希望某次弹窗打开时就带着完整初始值创建实例，应该在组件挂载前先准备好 `value`。**
- 这也是“先拉详情，再开弹窗”最稳定的原因。

### 2. 挂载后的外部值同步

`FormX` 挂载后，外部 `value` 的变化会继续同步到 engine。

但要注意两点：

- 这是**已挂载实例**上的同步，不是“未挂载实例”的预写入。
- 业务语义如果是“整份详情替换当前表单”，优先使用 `engine.reset(payload)`，不要只依赖普通的 `v-model` 回写。

### 3. `resetFields()` 的语义

`resetFields()` 默认回到的是：

- **当前 FormX 实例创建时的初始 model**

而不是：

- 最近一次异步拉回来的详情
- 最近一次手动 `setValue()` 的结果

所以：

- 如果你的业务想要“重置到最新详情”，应显式调用 `engine.reset(latestPayload)`。
- 如果你想让 `resetFields()` 回到某次详情，请在那次详情准备好后再创建/重建表单实例。


什么时候需要 `nextTick()`
--------------------------

需要 `nextTick()` 的典型场景：

- 刚执行 `dialogVisible = true`，马上要访问 `formRef.value`
- 刚切换了 `v-if`
- 刚切换了 `:key`，导致 FormX 即将重建
- 你依赖的是“子组件实例已挂载完成”，而不只是“父组件状态已改掉”

不一定需要 `nextTick()` 的场景：

- `FormX` 已经挂着，只是异步接口返回后要更新数据
- 只是改父级 `model`，并不立刻使用 `formRef` / `engine`
- 只是读取父级响应式状态

一句话：

- **你真正要等待的不是 `nextTick`，而是“FormX 实例已经可用”。**

因此在业务上更推荐的等待条件是：

- `Dialog` 的 `opened`
- `watch(() => formRef.value?.engine)`
- 或你自己维护的“mounted / ready”状态


标准业务模式
------------

### 模式 A：先开弹窗，再异步详情回填

适用场景：

- 用户点击“编辑”时要立即看到弹窗
- 可以先展示骨架数据或占位值
- 详情稍后回填

推荐步骤：

1. 准备一份 shell draft（只放列表行已有字段）
2. 打开 Dialog
3. 等待 FormX 实例 ready
4. 异步详情返回后调用 `engine.reset(detailPayload)`

示例：

```ts
const openEdit = async (row) => {
  formModel.value = buildShellDraft(row)
  dialogVisible.value = true

  await nextTick()
  const detail = await fetchDetail(row.id)
  if (!dialogVisible.value || !formRef.value?.engine) return

  formRef.value.engine.reset(detail, {
    clearErrors: true,
    clearTouched: true,
    silentValidate: true
  })
}
```

注意：

- 这里 `nextTick()` 不是为了“等接口”，而是为了“等 FormX 挂载”
- 真正回填请优先用 `reset(detail)`，因为这是“整份替换”


### 模式 B：先拉详情，再打开弹窗

适用场景：

- 不希望用户看到中间态
- 初始值必须一次性完整呈现
- 可以接受打开速度略慢一点

推荐步骤：

1. 先请求详情
2. 把完整 payload 放进 `formModel`
3. 再打开 Dialog

示例：

```ts
const openEdit = async (row) => {
  const detail = await fetchDetail(row.id)
  formModel.value = detail
  dialogVisible.value = true
}
```

优点：

- 挂载时初始值最稳定
- `resetFields()` 也会回到这份详情

代价：

- 打开弹窗前必须先等接口


### 模式 C：Dialog 未打开时先缓存详情，之后再打开

适用场景：

- 列表 hover / 预读 / 预编辑
- 用户点击前就想把详情先拿回来
- 但 UI 还没真正打开

推荐步骤：

1. 先请求详情
2. 先存到 `pendingDraft / prefetchedDraft`
3. 打开 Dialog 时，如果 FormX 未挂载则只缓存，不硬写
4. 等 FormX ready 后，再把缓存 payload 注入

示例：

```ts
const pendingDraft = ref(null)

const prefetch = async (row) => {
  pendingDraft.value = await fetchDetail(row.id)
}

watch(
  () => formRef.value?.engine,
  (engine) => {
    if (!engine || !pendingDraft.value) return
    engine.reset(pendingDraft.value, {
      clearErrors: true,
      clearTouched: true,
      silentValidate: true
    })
    pendingDraft.value = null
  }
)
```

关键点：

- **Dialog 未打开时不要写 `formRef.value.engine`**
- 那时通常根本没有实例


### 模式 D：连续快速切换多条记录（竞态控制）

适用场景：

- 列表中快速点击 A / B / C
- 接口返回顺序不稳定
- 只允许最后一次点击生效

推荐做法：

- 为每次请求分配 `requestId / sessionId`
- 返回时校验“是否仍是当前会话”
- 旧结果直接丢弃

示例：

```ts
let currentRequestId = 0

const openEdit = async (row) => {
  const requestId = ++currentRequestId
  const detail = await fetchDetail(row.id)
  if (requestId !== currentRequestId) return

  formModel.value = detail
  dialogVisible.value = true
}
```

不要依赖：

- “后返回的自然会覆盖前返回的”

这在实际业务里非常危险。


### 模式 E：弹窗关闭后旧请求返回

适用场景：

- 用户打开编辑弹窗
- 请求还没返回就先关闭了
- 旧请求回来后又把表单写脏

推荐做法：

- 关闭弹窗时递增 `sessionId` 或清空 `requestId`
- 异步返回时校验当前会话是否仍有效

示例：

```ts
let sessionId = 0

const openDialog = async (row) => {
  const localSession = ++sessionId
  dialogVisible.value = true
  const detail = await fetchDetail(row.id)
  if (localSession !== sessionId || !dialogVisible.value) return
  formRef.value?.engine?.reset(detail)
}

const closeDialog = () => {
  dialogVisible.value = false
  sessionId += 1
}
```


API 选型建议
------------

### 1. 整份详情替换

优先使用：

- `engine.reset(payload, { clearErrors: true, clearTouched: true, silentValidate: true })`

适合：

- 编辑详情回填
- 打开弹窗时初始化一整份表单
- 切换不同记录

### 2. 局部字段修正

优先使用：

- `engine.setValue(path, value)`

适合：

- 手工填一个审批单号
- 接口只返回少量补充字段
- 单个字段联动修正

### 3. 清理错误态

优先使用：

- `engine.clearValidationState({ clearErrors: true, clearTouched: true })`

适合：

- 切换记录后清空上一条记录的校验痕迹
- 异步详情覆盖后重新进入“干净表单态”

### 4. 读取提交值

优先使用：

- `formRef.value.getValues()`
- 或 `engine.getValues()`

适合：

- 保存前取值
- 调试快照
- 与列表行回写对比

### 5. 重置到“当前会话初始值”

使用：

- `formRef.value.resetFields()`

前提：

- 你确认当前实例的初始值就是你想回去的目标

如果不是：

- 不要用 `resetFields()`
- 改用 `engine.reset(targetPayload)`


常见错误写法
------------

### 错误 1：打开 Dialog 后立刻访问 `formRef`

```ts
dialogVisible.value = true
formRef.value.engine.reset(detail)
```

问题：

- 这时 `formRef.value` 很可能还是 `undefined`

### 错误 2：把“局部 merge”当成“整份替换”

```ts
formModel.value = detail
```

问题：

- 如果当前实例没重建，这更像“同步进现有 engine”
- 对“旧字段清空 / 整体替换”的语义不如 `engine.reset()` 明确

### 错误 3：没有竞态保护

```ts
const detail = await fetchDetail(id)
formRef.value.engine.reset(detail)
```

问题：

- A 请求回来时，用户可能已经切到 B

### 错误 4：关闭弹窗后不取消旧会话

问题：

- 旧请求回来会把已经关闭的弹窗状态污染到下一次会话

### 错误 5：误以为 `resetFields()` 会回到“最新详情”

问题：

- 它回到的是 **当前实例创建时的初始值**


业务接入 Checklist
-------------------

接入 CRUD + Dialog + FormX 时，建议逐项确认：

- 是否明确区分“整份替换”与“局部 patch”
- 是否明确 `FormX` 在何时挂载完成
- 是否所有异步请求都带了 `requestId / sessionId`
- 是否在关闭弹窗时使旧请求结果失效
- 是否区分了 `resetFields()` 与 `engine.reset(payload)` 的语义
- 是否在切换记录后清理了旧的错误态
- 是否避免在 `Dialog 未打开` 时操作 `formRef.value.engine`


参考实现
--------

仓库内完整业务示例可参考：

- `examples/vue-ep-basic` can be used as the starting point for async runtime examples.

该示例覆盖：

- 先开弹窗再回填
- 先拉详情再打开
- Dialog 未打开先缓存草稿
- 快速切换记录的竞态保护
- 关闭弹窗后旧请求返回
- `validate / resetFields / getValues / engine.setValue / clearValidationState / getDiagnostics`
