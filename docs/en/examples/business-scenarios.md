# Scenario Patterns

The full workbench is available at:

```bash
pnpm --filter @formx/example-vue-ep-basic dev
```

It should be read as a set of general form patterns, not as fixed business templates:

| Pattern | What it demonstrates |
| --- | --- |
| Capability overview | Fields, containers, arrays, remote resources, upload, custom components, runtime patching. |
| Configuration dialog | Multi-section editing, async hydration, submit validation, and reset behavior. |
| Control coverage | Inputs, selects, date/time controls, hierarchical options, upload, read-only display, layout helpers. |
| Dynamic arrays | `field-group`, add/copy/remove, row-level scope, row-level validation. |
| Remote resources | `optionsFrom`, dependent params, cascading refresh, fallback behavior. |
| Runtime mutation | Updating options, props, visibility, and defaults through `rulesV2`. |
| Deep objects | `form-object`, nested arrays, cross-level paths, derived fields. |
| Step-like forms | Organizing sections by step, state, role, or mode. |
| Matrix input | Multi-row configuration, batched items, dynamic required state, submit-time validation. |

These patterns demonstrate how FormX handles nested value trees, array scopes, remote resources, cross-field rules, async hydration, and submit validation without tying the documentation to one business domain.
