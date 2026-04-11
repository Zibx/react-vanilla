/**
 * Observable Store — reactive state management library.
 * By Ivan Kubota, 2016. License: MPL 2.0
 */

/** Callback that receives an update function from D for reactive bindings */
type BackwardCallback<T> = (update: (value: T) => void) => void;

/** Unsubscribe function returned by .hook(), .sub(), .on() */
type Unsubscribe = () => void;

declare class Observable {
  on(event: string, fn: (...args: any[]) => void): Unsubscribe;
  un(event: string, fn: (...args: any[]) => void): void;
  fire(event: string, ...args: any[]): void;
  once(event: string, fn: (...args: any[]) => void): void;
}

/** Reactive primitive value. Base for Store.Value.Boolean, .Number, .String, etc. */
interface ReactiveValue<T> {
  /** Set a new value. Fires subscribers if changed. */
  set(val: T): void;

  /** Get the current value. */
  get(): T;

  /**
   * Subscribe to value changes. Calls fn immediately with current value
   * unless suppressFirstCall is true. Returns unsubscribe function.
   */
  hook(fn: (val: T) => void, suppressFirstCall?: boolean): Unsubscribe;

  /** Create a StoreBinding proxy for this value. */
  binding(): StoreBinding;

  /**
   * Returns a backward callback that tracks equality to compareTo.
   * The callback fires with true/false, only on change.
   */
  valEqual(compareTo: T): BackwardCallback<boolean>;

  /**
   * Returns a backward callback that applies transform to every value change.
   * Use in D.h() style/class/child bindings:
   *   visible.map(v => v ? 'block' : 'none')
   */
  map<U>(transform: (val: T) => U): BackwardCallback<U>;
}

interface BooleanValue extends ReactiveValue<boolean> {
  /** Toggle between true and false. */
  toggle(): void;
}

interface NumberValue extends ReactiveValue<number> {}

interface StringValue extends ReactiveValue<string> {}

interface IntegerValue extends ReactiveValue<number> {}

interface AnyValue extends ReactiveValue<any> {}

interface FunctionValue extends ReactiveValue<Function> {}

/** Proxy to a specific key in a Store instance. */
declare class StoreBinding {
  /**
   * Subscribe to changes at the bound key.
   * - sub(fn) — subscribe to this key
   * - sub(subKey, fn) — subscribe to a sub-key relative to this binding
   * - sub([key1, key2], fn) — subscribe to multiple keys
   */
  sub(fn: (val: any) => void): Unsubscribe;
  sub(key: string, fn: (val: any) => void): Unsubscribe;
  sub(keys: (string | StoreBinding)[], fn: (...vals: any[]) => void): Unsubscribe;

  /** Set value at the bound key. */
  set(val: any): void;

  /** Get value at the bound key. */
  get(): any;

  /** Create a nested binding: store.bind('a').bind('b') === store.bind('a.b') */
  bind(key: string): StoreBinding;

  /** Subscribe to changes (alias for sub with single callback). */
  hook(fn: (val: any) => void): Unsubscribe;

  /**
   * Returns a backward callback that applies transform to every value change.
   * Use in D.h() style/class/child bindings.
   */
  map<U>(transform: (val: any) => U): BackwardCallback<U>;

  /** Get the ArrayStore for an array-typed bound key. */
  array(): ArrayStore;
}

/** Reactive array with granular add/remove events. */
declare class ArrayStore extends Observable {
  /** Number of items in the array. */
  length: number;

  /** Add item to end. Fires 'add' event. */
  push(item: any): number;

  /** Add item to start. Fires 'add' event. */
  unshift(item: any): number;

  /** Remove and return last item. Fires 'remove' event. */
  pop(): any;

  /** Remove and return first item. Fires 'remove' event. */
  shift(): any;

  /** Remove count items at start, insert new items. Returns removed items. */
  splice(start: number, count: number, ...items: any[]): any[];

  /** Insert item at position. Fires 'add' event. */
  insert(item: any, pos: number): void;

  /** Remove item at index. Fires 'remove' event. Returns removed item. */
  remove(pos: number): any;

  /** Remove item by reference. Fires 'remove' event. */
  removeItem(item: any): any;

  /**
   * Replace item at position, or replace entire array.
   * - set(pos, item) — replace one item
   * - set([items]) — replace all items
   */
  set(pos: number, item: any): any;
  set(items: any[]): this;

  /** Find index of item, or first item matching predicate. */
  indexOf(item: any): number;
  indexOf(predicate: (item: any) => boolean): number;

  /** Get internal array. */
  toArray(): any[];

  /** Iterate items. */
  forEach(fn: (item: any, index: number) => void): void;

  /** Map items to plain array (non-reactive). */
  map<U>(fn: (item: any, index: number) => U): U[];

  /** Filter items to plain array (non-reactive). */
  filter(fn: (item: any, index: number) => boolean): any[];

  /**
   * Find items matching criteria. Uses indexes when available.
   * cfg keys are matched by equality, or by predicate function.
   */
  find(cfg: { [key: string]: any | ((val: any) => boolean) }): any[];

  /** Build secondary indexes for fast .find() lookup. */
  index(cfg: { [key: string]: true }): this;

  /**
   * Subscribe to array changes (add and remove).
   * Calls fn with the full array on every mutation.
   */
  sub(fn: (items: any[]) => void, suppressFirstCall?: boolean): void;

  /** Get a child Store for an object item at index. */
  item(key: number | string, refItem?: any): Store;

  /** Create an iterator starting at position. */
  iterator(start?: number): any;

  /**
   * Listen for add events.
   * fn(item, prevItem, nextItem, position)
   */
  on(event: 'add', fn: (item: any, prev: any, next: any, pos: number) => void): Unsubscribe;

  /**
   * Listen for remove events.
   * fn(item, prevItem, nextItem, position)
   */
  on(event: 'remove', fn: (item: any, prev: any, next: any, pos: number) => void): Unsubscribe;

  on(event: string, fn: (...args: any[]) => void): Unsubscribe;
}

/** Key-value reactive store with dot-path notation and nested change tracking. */
declare class Store extends Observable {
  constructor(cfg?: { [key: string]: any });

  events: Observable;

  /**
   * Set value by key. Supports dot-path ('a.b.c') and batch ({ k: v }).
   * Only fires change events for values that actually changed.
   */
  set(key: string, val: any): this;
  set(obj: { [key: string]: any }): this;

  /** Reset all props and optionally set new values. */
  reSet(key?: string, val?: any): this;

  /** Clear all props. */
  clear(): void;

  /**
   * Get value by key. Supports dot-path.
   * No args returns the entire props object.
   */
  get(key?: string): any;

  /**
   * Subscribe to key changes. Calls fn immediately unless suppressed.
   * - sub(key, fn) — single key
   * - sub([keys], fn) — multiple keys, fn receives all values as args
   * - sub({name: key}, fn) — named keys, fn receives {name: value} object
   * Keys can be strings or StoreBinding instances.
   * Returns unsubscribe function.
   */
  sub(key: string, fn: (val: any) => void, suppressFirstCall?: boolean): Unsubscribe;
  sub(keys: (string | StoreBinding | ReactiveValue<any>)[], fn: (...vals: any[]) => void, suppressFirstCall?: boolean): Unsubscribe;
  sub(keys: { [name: string]: string | StoreBinding }, fn: (data: { [name: string]: any }) => void, suppressFirstCall?: boolean): Unsubscribe;

  /** Subscribe that fires when value equals target. */
  equal(key: string, val: any, fn: (isEqual: boolean) => void): this;

  /** Subscribe that fires when value does not equal target. */
  notEqual(key: string, val: any, fn: (isNotEqual: boolean) => void): this;

  /** Subscribe that fires when array value contains target. */
  contain(key: string, val: any, fn: (contains: boolean) => void): this;

  /**
   * Create a StoreBinding proxy for key.
   * Auto-detects arrays and returns ArrayStore for array keys.
   */
  bind(key: string): StoreBinding | ArrayStore;

  /**
   * Create a lazy processing pipeline for a key.
   * Chain .pipe(fn) transforms. Returns a backward callback.
   */
  pipe(key: string): {
    (update: (val: any) => void): Unsubscribe;
    pipe(fn: (val: any) => any): any;
  };

  /** Create a backward callback for a key value. */
  val(key: string): BackwardCallback<any>;

  /** Backward callback that fires true when key equals val. */
  valEqual(key: string, val: any): BackwardCallback<boolean>;

  /** Backward callback that fires true when key does not equal val. */
  valNotEqual(key: string, val: any): BackwardCallback<boolean>;

  /** Backward callback that fires once when key equals val. */
  valEqualOnly(key: string, val: any): BackwardCallback<boolean>;

  /** Backward callback that fires once when array key contains val. */
  valContains(key: string, val: any): BackwardCallback<boolean>;

  /** Backward callback that fires true when key is true. */
  valTrue(key: string): BackwardCallback<boolean>;

  /** Backward callback that fires true when key is false. */
  valFalse(key: string): BackwardCallback<boolean>;

  /** Get all bindings as { key: StoreBinding } object. */
  bindings(): { [key: string]: StoreBinding; _addOther(obj: { [key: string]: any }): any };

  /** Get singleton ArrayStore for an array-typed key. */
  array(key: string): ArrayStore;

  /** Get child Store for an object-typed key (WeakMap-cached). */
  item(key: string | number, refItem?: any): Store;

  /** Auto-persist to storage with versioning. */
  sync(key: string, version: number, saveInterface?: any): void;

  /** Trigger save (available after sync()). */
  save?(): void;

  /** Reactive value constructors. */
  static Value: {
    Boolean: { new(val?: boolean): BooleanValue; (val?: boolean): BooleanValue };
    Number: { new(val?: number): NumberValue; (val?: number): NumberValue };
    String: { new(val?: string): StringValue; (val?: string): StringValue };
    Integer: { new(val?: number): IntegerValue; (val?: number): IntegerValue };
    Any: { new(val?: any): AnyValue; (val?: any): AnyValue };
    Array: { new(val?: any[]): ReactiveValue<any[]> & ArrayStore; (val?: any[]): ReactiveValue<any[]> & ArrayStore };
    Function: { new(val?: Function): FunctionValue; (val?: Function): FunctionValue };
    /** Initialize a typed value, reusing existing instance if same type. */
    init<K extends keyof Store['Value']>(type: K, value?: any): any;
  };

  /** ArrayStore constructor (exposed for instanceof checks). */
  static ArrayStore: { new(cfg?: any[]): ArrayStore };

  /** StoreBinding constructor (exposed for instanceof checks). */
  static StoreBinding: { new(store?: Store, key?: string): StoreBinding };

  /** HookPrototype base (exposed for instanceof checks). */
  static HookPrototype: { new(): any };

  /**
   * Build custom aggregate combinator.
   * fn receives (values[], length) and returns derived value.
   */
  static AGGREGATE(fn: (values: any[], length: number) => any): (...args: (ReactiveValue<any> | BackwardCallback<any>)[]) => BackwardCallback<any>;

  /** Reactive AND — all inputs must be truthy. */
  static AND: (...args: (ReactiveValue<any> | BackwardCallback<any>)[]) => BackwardCallback<boolean>;

  /** Reactive OR — any input must be truthy. */
  static OR: (...args: (ReactiveValue<any> | BackwardCallback<any>)[]) => BackwardCallback<boolean>;

  /** Reactive NOT — inverts a single input. */
  static NOT: (arg: ReactiveValue<any> | BackwardCallback<any>) => BackwardCallback<boolean>;

  /** JSX conditional: <IF condition={bool}>...<ELSE/>...</IF> */
  static IF: any;

  /** Separator for IF/ELSE blocks. */
  static ELSE: { new(): any; (): any };

  /**
   * Debounce a function call.
   * Returns wrapped function with .now(anyway?) to flush immediately.
   */
  static debounce<F extends (...args: any[]) => any>(fn: F, dt: number, strictDelay?: boolean): F & { now(anyway?: boolean): void };

  /**
   * Auto-persist reactive values to storage.
   * data: { key: ReactiveValue }
   */
  static Persistent(data: { [key: string]: ReactiveValue<any> }, key?: string, storeInterface?: any): void;

  /** Subscribe to multiple reactive values (static helper). */
  static sub(keys: (string | StoreBinding | ReactiveValue<any>)[] | { [name: string]: string | StoreBinding }, fn: (...vals: any[]) => void, suppressFirstCall?: boolean): Unsubscribe;

  /** Storage interface for sync/Persistent. */
  static SaveInterface: {
    LocalStorage: { new(key: string, store: Store): any };
  };

  /** Get raw value from a StoreBinding or return as-is. */
  static getValue(val: any): any;
}

export = Store;
export as namespace Store;
