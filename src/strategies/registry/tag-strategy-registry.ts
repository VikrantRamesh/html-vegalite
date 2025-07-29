import { TagStrategy } from '../interfaces/tag-strategy.interface';

/**
 * Registry for managing tag strategies
 */
export class TagStrategyRegistry {
  private strategies = new Map<string, TagStrategy>();

  constructor() {
    // Registry is initialized empty - strategies need to be registered explicitly
  }

  /**
   * Register a new tag strategy
   */
  public registerStrategy(strategy: TagStrategy): void {
    for (const tagName of strategy.getTagNames()) {
      this.strategies.set(tagName.toLowerCase(), strategy);
    }
  }

  /**
   * Get strategy for a tag name
   */
  public getStrategy(tagName: string): TagStrategy | undefined {
    return this.strategies.get(tagName.toLowerCase());
  }

  /**
   * Check if a tag is supported
   */
  public isSupported(tagName: string): boolean {
    return this.strategies.has(tagName.toLowerCase());
  }

  /**
   * Get all supported tag names
   */
  public getSupportedTags(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Remove a strategy by tag name (removes all tags handled by the same strategy)
   */
  public removeStrategy(tagName: string): boolean {
    const strategy = this.strategies.get(tagName.toLowerCase());
    if (!strategy) {
      return false;
    }

    // Remove all tags handled by this strategy
    let removed = false;
    for (const tag of strategy.getTagNames()) {
      if (this.strategies.delete(tag.toLowerCase())) {
        removed = true;
      }
    }
    return removed;
  }

  /**
   * Clear all strategies
   */
  public clearStrategies(): void {
    this.strategies.clear();
  }
}
