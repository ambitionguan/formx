# Paths and Scope

Paths connect values, rules, validation, resources, and error locations.

## Path forms

```txt
name
database.host
rules[0].field
rules[].field
```

Use indexed paths for runtime instances and pattern paths for schema/rule definitions.

## Scope variables

| Variable | Meaning |
| --- | --- |
| `$root` | The whole value tree. |
| `$self` | Current scoped item, usually an array row. |
| `$parent` | Parent scope. |
| `$item` | Current item in an aggregate expression. |

## Example

```ts
{
  scope: 'rules[]',
  watch: ['$self.method'],
  when: '$self.method === "custom"',
  effects: [
    { type: 'required', target: '$self.condition', value: true }
  ]
}
```

## Advice

- Keep paths close to the business model.
- Use `scope` and `$self` for array rules.
- Avoid hard-coded indexes in schema-level rules.
