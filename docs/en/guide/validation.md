# Validation

Validation is a Core capability. UI skins display errors and map user interactions, but validation rules are part of the runtime protocol.

## Field rules

```ts
{
  id: 'email',
  type: 'input',
  label: 'Email',
  rules: [
    { required: true, message: 'Email is required' },
    { type: 'email', message: 'Invalid email' }
  ]
}
```

## Dynamic required

```ts
{
  id: 'rejectReason',
  type: 'textarea',
  requiredWhen: 'action === "reject"'
}
```

## Named validators

```ts
FormXEngine.registerValidator('uniqueName', async ({ value }) => {
  const result = await api.checkName(value)
  return result.available || 'Name already exists'
})
```

## Submit

```ts
const valid = await formRef.value?.validate()
if (!valid) return

const values = formRef.value?.getSubmitValues()
```

## Advice

- Put required and format rules on fields.
- Use named validators for reusable business checks.
- Skip hidden or disabled fields unless the business requires otherwise.
- Run expensive async validation on blur or submit.
