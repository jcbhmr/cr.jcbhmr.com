export default class CaseInsensitiveMap<T extends string, U>
  extends Map<string, U> {
  override set(key: T, value: U): this {
    return super.set(key.toLowerCase(), value);
  }
  override get(key: T): U | undefined {
    return super.get(key.toLowerCase());
  }
  override has(key: T): boolean {
    return super.has(key.toLowerCase());
  }
  override delete(key: T): boolean {
    return super.delete(key.toLowerCase());
  }
}
