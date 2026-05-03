# Rules and Shortcuts

FormX has two linkage levels:

- Field shortcuts for common local behavior.
- `rulesV2` for cross-field, scoped, multi-effect business rules.

Shortcuts compile into the same rule pipeline as `rulesV2`.

## Shortcuts

```ts
{
  id: 'reason',
  type: 'textarea',
  label: 'Reason',
  showWhen: 'enabled === false',
  requiredWhen: 'enabled === false'
}
```

```ts
{
  id: 'total',
  type: 'number',
  label: 'Total',
  compute: 'price * count'
}
```

## `rulesV2`

```ts
{
  id: 'admin-disabled-risk',
  watch: ['role', 'enabled'],
  when: 'role === "admin" && enabled === false',
  effects: [
    { type: 'setValue', target: 'riskLevel', value: 'high' },
    { type: 'visible', target: 'reason', value: true }
  ],
  elseEffects: [
    { type: 'visible', target: 'reason', value: false }
  ]
}
```

## Scoped array rules

```ts
{
  id: 'rule-method-condition',
  scope: 'rules[]',
  watch: ['$self.method'],
  when: '$self.method === "custom"',
  effects: [
    { type: 'visible', target: '$self.condition', value: true }
  ]
}
```

Use `$self` to avoid affecting other array rows.

## Recommendation

Use shortcuts for one-field linkage. Use `rulesV2` when a rule affects multiple targets, needs array scope, triggers resources, or must be diagnosed as a named business rule.
