# Expression DSL

FormX expressions are used by shortcuts, `rulesV2.when`, `compute`, resource params, and dynamic configuration.

They are meant to be serializable and reviewable, not a replacement for all JavaScript logic.

## Examples

```ts
showWhen: 'status === "disabled"'
requiredWhen: 'action === "reject"'
compute: 'price * count'
```

Object paths:

```ts
showWhen: 'database.type === "mysql"'
```

Scoped array paths:

```ts
showWhen: '$self.method === "custom"'
```

Resource params:

```ts
params: {
  province: '${province}',
  source: '${$self.source}'
}
```

## Avoid

Do not put network requests, DOM operations, complex algorithms, or side effects inside expressions. Use resources, validators, or rule effects instead.
