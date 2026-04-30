# FormX Advanced Example Templates

These are compact, high-signal patterns meant for retrieval and prompt priming.

Example 1: Shortcuts + compute + change
```jsonc
{
  "fields": [
    { "id": "a", "type": "number", "label": "A" },
    { "id": "b", "type": "number", "label": "B" },
    { "id": "c", "type": "number", "label": "C",
      "compute": { "expr": { "+": [ { "var": "a" }, { "var": "b" } ] } }
    },
    { "id": "d", "type": "input", "label": "D",
      "showWhen": "a == 1",
      "change": [ { "target": "e", "action": "clearValue" } ]
    },
    { "id": "e", "type": "input", "label": "E" }
  ]
}
```

Example 2: Array scope + sibling aggregation rule
```jsonc
{
  "fields": [
    {
      "id": "list",
      "type": "field-group",
      "label": "List",
      "template": [
        { "id": "a", "type": "number", "label": "A" },
        { "id": "b", "type": "input", "label": "B" }
      ]
    }
  ],
  "rulesV2": [
    {
      "id": "hide_b_if_any_a_1",
      "scope": "list[]",
      "watch": ["$parent.list[].a"],
      "when": {
        "some": [
          "$parent.list[]",
          { "==": [ { "var": "$item.a" }, 1 ] }
        ]
      },
      "effects": [
        { "type": "setVisible", "target": "$self.b", "value": false }
      ],
      "elseEffects": [
        { "type": "setVisible", "target": "$self.b", "value": true }
      ]
    }
  ]
}
```

Example 3: optionsFrom + params + visibility
```jsonc
{
  "fields": [
    {
      "id": "rules",
      "type": "field-group",
      "label": "Rules",
      "template": [
        { "id": "methodType", "type": "select", "label": "Method" },
        {
          "id": "applicableScope",
          "type": "select",
          "label": "Scope",
          "optionsFrom": "getApplicableScopeOptions",
          "params": { "methodType": "{{form.rules[].methodType}}" },
          "fetchOnMount": true,
          "showWhen": "methodType in ['mfa','desensitization']"
        }
      ]
    }
  ]
}
```

Example 4: patchWhen for dynamic label/props
```jsonc
{
  "fields": [
    {
      "id": "name",
      "type": "input",
      "label": "Name",
      "patchWhen": [
        {
          "when": "vip == true",
          "patch": {
            "label": "Name (VIP)",
            "props": { "placeholder": "VIP name" }
          }
        }
      ]
    },
    { "id": "vip", "type": "switch", "label": "VIP" }
  ]
}
```

Example 5: event-driven rule (non-change trigger)
```jsonc
{
  "rulesV2": [
    {
      "id": "mark_save_requested",
      "trigger": ["event:save"],
      "effects": [
        { "type": "set", "target": "meta.saveRequested", "value": true }
      ]
    }
  ]
}
```
