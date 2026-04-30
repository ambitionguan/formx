export * from './core/Types'
export * from './core/Engine'
export * from './core/MessageResolver'
export * from './core/PathRegistry'
export * from './core/ResourceManager'
export * from './core/validators/ValidatorRegistry'
export * from './core/Path'
export * from './aidl/validateAIDSL'

import { FormXEngine } from './core/Engine'

export const createFormXEngine = (
  cfg: ConstructorParameters<typeof FormXEngine>[0]
) => new FormXEngine(cfg)
