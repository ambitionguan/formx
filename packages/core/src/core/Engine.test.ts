import { describe, expect, it } from 'vitest'
import { FormXEngine } from './Engine'
import type { FormSchema } from './Types'

describe('FormXEngine', () => {
  it('updates values and validates required fields', async () => {
    const schema: FormSchema = {
      version: '1.0.0',
      model: {
        name: ''
      },
      fields: [
        {
          id: 'name',
          type: 'input',
          label: 'Name',
          rules: [{ required: true, message: 'Name is required' }]
        }
      ]
    }

    const engine = new FormXEngine({ schema })
    engine.dispatch('init')

    expect(await engine.validate()).toBe(false)
    expect(engine.getErrors()).toEqual({ name: ['Name is required'] })

    engine.setValue('name', 'Ada')

    expect(engine.getValue('name')).toBe('Ada')
    expect(await engine.validate()).toBe(true)
    expect(engine.getErrors()).toEqual({})
  })

  it('executes simple linkage rules on value changes', () => {
    const schema: FormSchema = {
      version: '1.0.0',
      model: {
        mode: 'basic',
        advancedValue: 'visible'
      },
      fields: [
        {
          id: 'mode',
          type: 'select',
          label: 'Mode'
        },
        {
          id: 'advancedValue',
          type: 'input',
          label: 'Advanced Value',
          showWhen: { field: 'mode', eq: 'advanced' }
        }
      ]
    }

    const engine = new FormXEngine({ schema })
    engine.dispatch('init')

    expect(engine.getState().advancedValue.visible).toBe(false)

    engine.setValue('mode', 'advanced')

    expect(engine.getState().advancedValue.visible).toBe(true)
  })
})
