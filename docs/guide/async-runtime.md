# 异步运行时

真实业务表单很少是“页面加载时就有完整数据”。更多时候是打开 Dialog、拉详情、回填、用户编辑、提交、关闭，再快速切换下一条记录。

FormX 可以处理这些场景，但应用侧需要明确运行时边界。

## 关键结论

- schema 描述结构和规则。
- model 是当前会话的值。
- engine 维护运行时状态。
- 异步详情回填要区分 replace 和 merge。
- Dialog / Drawer 场景必须处理挂载时序和竞态。

## 模式 A：先打开，再回填

适合需要快速展示弹窗骨架的场景。

```ts
const visible = ref(false)
const formModel = ref({})
let sessionId = 0

async function openEdit(id: string) {
  visible.value = true
  const current = ++sessionId

  const detail = await api.detail(id)
  if (current !== sessionId) return

  formModel.value = detail
  formRef.value?.setValues(detail, { replace: true })
}
```

重点是 `sessionId`。如果用户快速切换记录，旧请求返回时不能覆盖新表单。

## 模式 B：先拉详情，再打开

适合详情接口很快，或者不希望用户看到 loading 表单的场景。

```ts
async function openEdit(id: string) {
  const detail = await api.detail(id)
  formModel.value = detail
  visible.value = true
}
```

这种模式简单，但打开速度依赖接口。

## 模式 C：关闭后旧请求返回

关闭弹窗时让当前会话失效：

```ts
function close() {
  sessionId++
  visible.value = false
  formRef.value?.resetFields()
}
```

旧请求返回时会因为会话不一致被忽略。

## replace 与 merge

整份详情回填：

```ts
formRef.value?.setValues(detail, { replace: true })
```

局部修正：

```ts
formRef.value?.setFieldValue('status', 'enabled')
```

不要把局部 merge 当成整份替换，否则旧字段可能残留。

## reset 的语义

`resetFields()` 通常回到当前会话的初始值，而不是“最新接口详情”。如果你希望 reset 回到新详情，需要在回填后更新表单会话初始值。

## 远程选项的时序

如果详情回填依赖远程选项，例如先有 `province` 再拉 `city`，要确保下游资源能在依赖值变化后刷新。

```ts
{
  id: 'city',
  type: 'select',
  optionsFrom: {
    requestKey: 'getCities',
    params: {
      province: '${province}'
    }
  }
}
```

回填 `province` 后，资源层会根据依赖刷新 `city` 选项。

## 常见错误

错误：打开 Dialog 后立刻访问 `formRef`。

```ts
visible.value = true
formRef.value.setValues(detail)
```

此时组件可能还没挂载。更稳的是等待组件可用，或让 `v-model:value` 承载初始值。

错误：不处理竞态。

```ts
const detail = await api.detail(id)
formRef.value?.setValues(detail)
```

当连续点击多条记录时，旧请求可能覆盖新请求。

错误：关闭后不失效旧请求。

```ts
visible.value = false
```

旧请求仍然可能回写。

## 接入 Checklist

- Dialog 打开和表单挂载是否解耦。
- 详情回填是否有竞态保护。
- 整份替换和局部更新是否区分。
- 关闭后旧请求是否失效。
- reset 是否符合用户预期。
- 远程选项是否能在依赖回填后刷新。
- 提交时是否读取 `getSubmitValues()`。
