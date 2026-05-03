# Async Runtime

Real business forms often open a dialog, fetch details, patch values, validate, submit, close, and quickly switch to another record. The runtime must handle these sequences explicitly.

## Key ideas

- Schema describes structure and rules.
- Model is the current session value.
- Engine owns runtime state.
- Full detail hydration should use replace semantics.
- Dialogs and drawers need race protection.

## Session pattern

```ts
let sessionId = 0

async function openEdit(id: string) {
  visible.value = true
  const current = ++sessionId

  const detail = await api.detail(id)
  if (current !== sessionId) return

  formRef.value?.setValues(detail, { replace: true })
}

function close() {
  sessionId++
  visible.value = false
  formRef.value?.resetFields()
}
```

## Replace vs merge

Use replace for full detail hydration:

```ts
formRef.value?.setValues(detail, { replace: true })
```

Use field updates for local fixes:

```ts
formRef.value?.setFieldValue('status', 'enabled')
```

## Checklist

- Is form mount timing handled?
- Are stale requests ignored?
- Is close invalidating the session?
- Are remote options refreshed after dependent values hydrate?
- Does reset match user expectations?
