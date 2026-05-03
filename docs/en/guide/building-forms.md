# Building Complex Forms

Start from the business object, not from UI layout.

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
      "level": "medium"
    }
  ]
}
```

## Map fields

Use `form-object` for objects and `field-group` for arrays.

```ts
{
  id: 'rules',
  type: 'field-group',
  label: 'Rules',
  defaultItem: { field: '', method: '', level: 'medium' },
  template: [
    { id: 'field', type: 'select', label: 'Field' },
    { id: 'method', type: 'select', label: 'Method' },
    { id: 'level', type: 'select', label: 'Level' }
  ]
}
```

## Add rules

Use shortcuts for local linkage and `rulesV2` for workflow-level linkage.

```ts
{
  id: 'refresh-targets',
  watch: ['scope.type'],
  effects: [
    {
      type: 'fetchOptions',
      target: 'scope.targets',
      requestKey: 'getScopeTargets',
      params: { type: '${scope.type}' }
    }
  ]
}
```

## Checklist

- Does the value tree match the business model?
- Are objects and arrays kept as objects and arrays?
- Are local rules written as shortcuts?
- Are cross-field rules centralized in `rulesV2`?
- Are remote requests registered through `ResourceManager`?
- Is async detail loading protected against race conditions?
- Do custom components follow the field protocol?
