# 构建复杂表单

这一页从实际建设角度说明如何用 FormX 构建一个可维护的复杂业务表单。

## 从业务对象开始

先建值树，不要先想 UI。

例如“数据保护策略”可以拆成：

```json
{
  "name": "",
  "enabled": true,
  "scope": {
    "type": "department",
    "targets": []
  },
  "rules": [
    {
      "field": "",
      "method": "",
      "level": "medium",
      "condition": ""
    }
  ]
}
```

这一步决定 schema 的长期可维护性。值树应该贴近业务模型，而不是贴近某个页面布局。

## 再映射字段

把每个业务属性映射成字段：

```ts
{
  fields: [
    { id: 'name', type: 'input', label: '策略名称' },
    { id: 'enabled', type: 'switch', label: '启用' },
    {
      id: 'scope',
      type: 'form-object',
      label: '适用范围',
      fields: [
        { id: 'type', type: 'select', label: '范围类型' },
        { id: 'targets', type: 'tree-select', label: '目标对象' }
      ]
    },
    {
      id: 'rules',
      type: 'field-group',
      label: '保护规则',
      template: [
        { id: 'field', type: 'select', label: '字段' },
        { id: 'method', type: 'select', label: '方法' },
        { id: 'level', type: 'select', label: '级别' },
        { id: 'condition', type: 'input', label: '条件' }
      ]
    }
  ]
}
```

## 用短写处理局部规则

字段自己的规则优先写在字段上：

```ts
{
  id: 'condition',
  type: 'input',
  label: '条件',
  showWhen: '$self.method === "conditional"',
  requiredWhen: '$self.method === "conditional"'
}
```

这样设计器也容易展示和编辑。

## 用 `rulesV2` 管理流程规则

当一个规则影响多个字段时，使用 `rulesV2`：

```ts
{
  id: 'scope-targets-by-type',
  watch: ['scope.type'],
  effects: [
    {
      type: 'fetchOptions',
      target: 'scope.targets',
      requestKey: 'getScopeTargets',
      params: { type: '${scope.type}' }
    },
    {
      type: 'setValue',
      target: 'scope.targets',
      value: []
    }
  ]
}
```

这比在 Vue 里写 watch 更可审查，也能被诊断工具看到。

## 远程资源单独注册

不要把接口实现写进 schema。

```ts
ResourceManager.register('getScopeTargets', async (params) => {
  return api.scopeTargets(params)
})

ResourceManager.register('getProtectMethods', async () => {
  return api.protectMethods()
})
```

schema 只保存 `requestKey`、参数模板和映射配置。

## 自定义组件作为插件

如果标准控件不够，用 `custom` 字段接入：

```ts
{
  id: 'conditionBuilder',
  type: 'custom',
  label: '条件构造器',
  component: 'ConditionBuilder'
}
```

自定义组件应该遵守 FormX 字段协议，避免绕过 engine 直接改业务对象。

## 提交前处理

提交时使用组件 API：

```ts
const valid = await formRef.value?.validate()
if (!valid) return

const values = formRef.value?.getSubmitValues()
await api.save(values)
```

如果隐藏字段不应该提交，在 policy 中配置：

```ts
{
  policy: {
    omitOnSubmit: true,
    validation: {
      skipHidden: true
    }
  }
}
```

## 何时拆 schema

表单大到难以维护时，可以按业务区域拆：

```txt
schemas/
  base.ts
  scope.ts
  rules.ts
  validation.ts
  resources.ts
```

但最终导出的仍然是一份 schema。拆文件是工程组织，不应该破坏运行时协议。

## 构建 Checklist

- 值树是否贴近业务对象。
- 对象和数组是否保留层级。
- 简单联动是否用短写。
- 复杂规则是否集中在 `rulesV2`。
- 资源请求是否统一注册。
- 异步回填是否处理竞态。
- 自定义组件是否遵守字段协议。
- 大表单是否开启诊断。
- 提交值是否符合后端契约。
