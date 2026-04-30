# FormX Context Pack (Headless)

Purpose
- Headless dynamic form engine driven by pure JSON.
- Maintains values tree + per-field state; compiles and executes JSON rules; resolves paths and scopes; handles remote resources and validation.
- UI rendering is handled by a separate package (formx-ep); core has no UI dependencies.

Key refs in repo
- packages/share/components/formx/README.md
- packages/share/components/formx/ARCHITECTURE.md
- packages/share/components/formx/DSL.md
- packages/share/components/formx/SHORTCUTS.md

Schema (top-level)
- version, formId, model, layout, style, presets, fields, rulesV2, resources

Field (common keys)
- id, type, label, default, props, layout, style, visible, disabled
- rules, children, template, flatten, containerOnly, role, render

Paths and scopes
- Path: a.b[2].c
- Wildcard: a.b[].c
- Arrays use stable @key internally.
- In array scope (field-group), scope is pattern path, e.g. rules[].items[]
- Special vars: $root, $self, $parent, $item
- Path resolution prefers nearest scope; ambiguous bare ids should be avoided.

Rule DSL (rulesV2)
- id, scope, watch, trigger, when, effects, elseEffects, options
- watch: paths that trigger evaluation (absolute or $self-relative in scope)
- trigger: non-change events (e.g. init, event:save)
- when: JSON expression, evaluated on change/trigger
- effects: list of actions; elseEffects for inverse branch

Effects (core list)
- set, patch, setVisible, setDisabled, setRequired, setReadOnly
- setOptions, fetch, validate
- addItem, removeItem, splice
- setSchemaPatch, emit

Expression DSL (JSON)
- Logical: and, or, not
- Compare: ==, !=, >, >=, <, <=, in, nin
- String: includes, startsWith, endsWith, match
- Math: +, -, *, /
- Ternary/merge: iif, coalesce
- Arrays: some, every, none, len, includes, uniq, flatten, map, filter, reduce,
  sum, avg, min, max, groupBy

Shortcuts (field-level)
- showWhen / hideWhen / disableWhen / readOnlyWhen / requiredWhen
- patchWhen: [{ when, patch }]
- valueWhen: { when, value }
- change: [{ target, action, value|patch }]
- compute: { expr, when?, watch?, target? }
- optionsFrom + params (+ fetchOnMount)
- Compiler rewrites paths to $self in scope and auto-extracts watch deps from expr/params.

Runtime model
- State: values tree + per-field state (visible/disabled/required/patch/options/errors)
- Dispatch: init/change:path/submit/reset/event:xxx
- Rules are compiled once; expressions are evaluated at runtime per change.

Executors
- LiteExecutor: no wildcard, rule count < threshold
- GraphExecutor: wildcard/scope/aggregate or rule count >= threshold
- Guards: no-change no-propagate, oncePerTick, maxHops, optional DAG check

Resources (fetch)
- Effects.fetch supports requestKey, params, ttl/cacheKey, debounce, retries/backoff
- ResourceManager caches and dedupes in-flight requests

Validation
- policy.validation.mode: immediate | touched | submitOnly
- validatePath(path, trigger) supports change|blur|submit

Core API
- new FormXEngine({ schema, model, rulesV2, resources, performance? })
- getValues / getState / setValue / getValue
- dispatch / subscribe / subscribePaths
- applySchemaPatch / validate / getErrors
- registerFieldContext(path, runtimeContext)

UI bridge (formx-ep)
- Renderer consumes engine state only; maps type -> UI components.
- onChange(path,val) -> engine.dispatch('change:path', val)
