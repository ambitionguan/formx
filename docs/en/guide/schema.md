# Schema Model

Schema is the primary FormX protocol. It describes fields, containers, default values, validation, linkage, remote resources, and UI hints.

## Top-level shape

```ts
type FormSchema = {
  version: string
  formId?: string
  model?: Record<string, unknown>
  fields: FieldSchema[]
  rulesV2?: RuleV2[]
  ui?: FormUiConfig
  policy?: FormPolicy
}
```

## Field shape

```ts
type FieldSchema = {
  id: string
  type: string
  label?: string
  props?: Record<string, unknown>
  rules?: ValidationRule[]
  showWhen?: string
  requiredWhen?: string
  disableWhen?: string
  readOnlyWhen?: string
  compute?: string
  optionsFrom?: ResourceBinding
  fields?: FieldSchema[]
  template?: FieldSchema[]
  defaultItem?: Record<string, unknown>
}
```

## Containers

Use `form-object` for object values:

```ts
{
  id: 'database',
  type: 'form-object',
  fields: [
    { id: 'host', type: 'input' },
    { id: 'port', type: 'number' }
  ]
}
```

Use `field-group` for arrays of objects:

```ts
{
  id: 'rules',
  type: 'field-group',
  defaultItem: { field: '', operator: 'eq' },
  template: [
    { id: 'field', type: 'select' },
    { id: 'operator', type: 'select' }
  ]
}
```

## Design advice

- Model business structure first.
- Keep nested objects and arrays instead of flattening them for UI convenience.
- Use shortcuts for local linkage and `rulesV2` for complex workflows.
- Keep schema serializable; register functions and components at runtime.
