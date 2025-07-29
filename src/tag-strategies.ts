// Backward compatibility layer - re-exports from the new strategies system
export * from './strategies/index';

// Legacy named export for TagStrategyRegistry
export { createDefaultTagStrategyRegistry as TagStrategyRegistry } from './strategies/index';