# FormX AIDSL

This document defines the AI-oriented JSON DSL ("AIDSL") for FormX. It is a
strict superset of the runtime schema and rule model, designed for machine
generation and validation.

## Files
- JSON Schema: `packages/share/components/formx/aidl/formx-aidsl.schema.json`
- Runtime validator: `validateAIDSL()` in `@formx/core`

## Core Shape

```
{
  "version": "1.0",
  "fields": [ ... ],
  "rulesV2": [ ... ],
  "resources": { ... }
}
```

## RuleV2

RuleV2 is the authoritative logic layer. Complex linkage should be expressed
in `rulesV2` rather than shorthand fields.

Key fields:
- `watch`: array of path patterns to react to value changes
- `trigger`: array of `change:<path>` or `event:<name>` triggers
- `when`: JSON expression (see Expression section)
- `effects`: list of actions to apply
- `elseEffects`: optional fallback actions

## Effects (complete list)

- `set` / `patch`
- `setVisible` / `setDisabled` / `setRequired` / `setReadOnly`
- `setOptions`
- `fetch`
- `setSchemaPatch`
- `validate`
- `addItem` / `removeItem` / `splice`
- `batch`
- `dispatch`
- `toggle`
- `copyValue`
- `clearErrors`

## Expressions

Expressions are JSON objects evaluated by the runtime. Supported operators:

- Logic: `and`, `or`, `not`
- Compare: `==`, `!=`, `>`, `>=`, `<`, `<=`, `in`, `nin`
- String: `includes`, `startsWith`, `endsWith`, `match`
- Math: `+`, `-`, `*`, `/`
- Condition: `iif`, `coalesce`
- Aggregation: `some`, `every`, `none`, `len`, `sum`, `avg`
- Vars: `var` with `$root`, `$self`, `$parent`, `$item`, `$state`

## Runtime Extensions

AIDSL can reference runtime-registered capabilities:

- Requests: `FormXEngine.registerRequest(key, handler)`
- Validators: `FormXEngine.registerValidator(name, fn)`
- Custom effects: `EffectRegistry.register(type, handler)`

The DSL only references these names; the runtime must register them.
