import type { IDependencyContainer, ConfigurableDependency, DependencyFactoryCallback } from "./IDependencyContainer";
import { type IDependencyResolver, type ResolvableSimpleDependency, type BasicDependency, type SimpleDependency, type ComplexDependency, DependencyToken } from "./IDependencyResolver";

type DependencyFactoryKey<T> = DependencyToken<T> | BasicDependency<T> | SimpleDependency<T>;

/**
 * Represents a dependency container for configuring and later on resolving dependencies similar to a dependency injection mechanism.
 */
export class DependencyContainer implements IDependencyContainer, IDependencyResolver {
  private static _dependencyResolutionChain: any[] = [];

  private readonly _parent: DependencyContainer | null;
  private readonly _singletonDependencyFactories = new Map<DependencyFactoryKey<unknown>, IDependencyFactory<unknown>>();
  private readonly _scopedDependencyFactories = new Map<DependencyFactoryKey<unknown>, IDependencyFactory<unknown>>();

  /**
   * Initializes a new instance of the {@linkcode DependencyContainer} class.
   * @param parent Optional, a parent container to use as fallback when resolving dependencies.
   */
  public constructor(parent?: DependencyContainer) {
    this._parent = parent === undefined ? null : parent;

    this.createScope = this.createScope.bind(this);
    this.resolve = this.resolve.bind(this);
  }

  /**
   * Creates a scoped dependency resolver. All scoped configured dependencies are resolved for each scope individually,
   * while singletons are unique from the scope that configured them downwards.
   * @returns Returns a scoped dependency resolver.
   */
  public createScope(): IDependencyResolver {
    return new DependencyContainer(this);
  }

  /**
   * Registers the provided type as a singleton dependency.
   * @template T The dependency type to configure.
   * @param type The type to configure.
   * @returns Returns the dependency container.
   */
  public registerSingletonType<T>(type: ConfigurableDependency<T>): DependencyContainer;
  /**
   * Registers the provided type as a singleton dependency.
   * @template T The dependency type to configure.
   * @param type The type to configure.
   * @param factoryCallback A callback for initializing an instace of the given type.
   * @returns Returns the dependency container.
   */
  public registerSingletonType<T>(type: ConfigurableDependency<T>, factoryCallback: DependencyFactoryCallback<T>): DependencyContainer;

  public registerSingletonType<T>(type: BasicDependency<T> | SimpleDependency<T>, factoryCallback: DependencyFactoryCallback<T> = dependecyResolver => new type(dependecyResolver)): DependencyContainer {
    this._singletonDependencyFactories.set(type, new CachedDelayedDependencyFactory(this, factoryCallback));
    this._scopedDependencyFactories.delete(type);

    return this;
  }

  /**
   * Registers the provided instance for the given token.
   * @template T The dependency type to configure.
   * @param token The token used to resolve dependencies.
   * @param instance The instance to return when resolving the dependency token.
   * @returns Returns the dependency container.
   */
  public registerInstanceToToken<T>(token: DependencyToken<T>, instance: T): DependencyContainer {
    this._singletonDependencyFactories.set(token, new InstanceDependencyFactory(instance));
    this._scopedDependencyFactories.delete(token);

    return this;
  }

  /**
   * Registers the provided type for the given token as a singleton dependency.
   * @template T The dependency type to configure.
   * @param token The token used to resolve dependencies.
   * @param type The type to configure.
   * @returns Returns the dependency container.
   */
  public registerSingletonTypeToToken<T>(token: DependencyToken<T>, type: ConfigurableDependency<T>): DependencyContainer {
    return this.registerSingletonFactoryToToken(token, dependencyResolver => new type(dependencyResolver));
  }

  /**
   * Registers the provided callback for the given token as a singleton dependency.
   * @template T The dependency type to configure.
   * @param token The token used to resolve dependencies.
   * @param factoryCallback A callback for initializing an instace of the given type.
   * @returns Returns the dependency container.
   */
  public registerSingletonFactoryToToken<T>(token: DependencyToken<T>, factoryCallback: DependencyFactoryCallback<T>): DependencyContainer {
    this._singletonDependencyFactories.set(token, new CachedDelayedDependencyFactory(this, factoryCallback));
    this._scopedDependencyFactories.delete(token);

    return this;
  }

  /**
   * Registers the provided type as a scoped dependency.
   * @template T The dependency type to configure.
   * @param type The type to configure.
   * @returns Returns the dependency container.
   */
  public registerScopedType<T>(type: ConfigurableDependency<T>): DependencyContainer;
  /**
   * Registers the provided type as a scoped dependency.
   * @template T The dependency type to configure.
   * @param type The type to configure.
   * @param factoryCallback A callback for initializing an instace of the given type.
   * @returns Returns the dependency container.
   */
  public registerScopedType<T>(type: ConfigurableDependency<T>, factoryCallback: DependencyFactoryCallback<T>): DependencyContainer;

  public registerScopedType<T>(type: BasicDependency<T> | SimpleDependency<T>, factoryCallback: DependencyFactoryCallback<T> = dependecyResolver => new type(dependecyResolver)): DependencyContainer {
    this._singletonDependencyFactories.delete(type);
    this._scopedDependencyFactories.set(type, new CachedDelayedDependencyFactory(this, factoryCallback));

    return this;
  }

  /**
   * Registers the provided type for the given token as a scoped dependency.
   * @template T The dependency type to configure.
   * @param token The token used to resolve dependencies.
   * @param type The type to configure.
   * @returns Returns the dependency container.
   */
  public registerScopedTypeToToken<T>(token: DependencyToken<T>, type: ConfigurableDependency<T>): DependencyContainer {
    return this.registerScopedFactoryToToken(token, dependencyResolver => new type(dependencyResolver));
  }

  /**
   * Registers the provided callback for the given token as a scoped dependency.
   * @template T The dependency type to configure.
   * @param token The token used to resolve dependencies.
   * @param factoryCallback A callback for initializing an instace of the given type.
   * @returns Returns the dependency container.
   */
  public registerScopedFactoryToToken<T>(token: DependencyToken<T>, factoryCallback: DependencyFactoryCallback<T>): DependencyContainer {
    this._singletonDependencyFactories.delete(token);
    this._scopedDependencyFactories.set(token, new CachedDelayedDependencyFactory(this, factoryCallback));

    return this;
  }

  /**
   * Registers the provided type as a transient dependency.
   * @template T The dependency type to configure.
   * @param type The type to configure.
   * @param factoryCallback A callback for initializing an instace of the given type.
   * @returns Returns the dependency container.
   */
  public registerTransientType<T>(type: ConfigurableDependency<T>, factoryCallback: DependencyFactoryCallback<T>): DependencyContainer {
    this._singletonDependencyFactories.delete(type);
    this._scopedDependencyFactories.set(type, new DelayedDependencyFactory(this, factoryCallback));

    return this;
  }

  /**
   * Registers the provided type for the given token as a transient dependency.
   * @template T The dependency type to configure.
   * @param token The token used to resolve dependencies.
   * @param type The type to configure.
   * @returns Returns the dependency container.
   */
  public registerTransientTypeToToken<T>(token: DependencyToken<T>, type: ConfigurableDependency<T>): DependencyContainer {
    return this.registerTransientFactoryToToken(token, dependencyResolver => new type(dependencyResolver));
  }

  /**
   * Registers the provided callback for the given token as a transient dependency.
   * @template T The dependency type to configure.
   * @param token The token used to resolve dependencies.
   * @param factoryCallback A callback for initializing an instace of the given type.
   * @returns Returns the dependency container.
   */
  public registerTransientFactoryToToken<T>(token: DependencyToken<T>, factoryCallback: DependencyFactoryCallback<T>): DependencyContainer {
    this._singletonDependencyFactories.delete(token);
    this._scopedDependencyFactories.set(token, new DelayedDependencyFactory(this, factoryCallback));

    return this;
  }

  /**
   * Resolves a dependency based on its configuration, if any. All unconfigured dependencies are transient.
   * @param dependency The dependnecy to resolve.
   * @returns The resolved dependency.
   */
  public resolve<T>(dependency: ResolvableSimpleDependency<T>): T;
  /**
   * Resolves a complex dependency. All such dependencies are transient as they require
   * additional dependencies on the constructor.
   * @param dependency The complex dependnecy to resolve.
   * @param additionalDependencies Additional dependencies requested by the constructor besides the dependency resolver.
   * @returns The resolved dependency.
   */
  public resolve<T, TAdditional extends readonly any[]>(dependency: ComplexDependency<T, TAdditional>, additionalDependencies: TAdditional): T;
  /**
   * Resolves a dependency based on its configuration. All complex dependencies are transient, all unconfigured dependencies are transient.
   * @param dependency The dependency to resolve.
   * @param additionalDependencies Additional dependencies requested by the constructor besides the dependency resolver.
   */
  public resolve<T, TAdditional extends readonly any[] = []>(dependency: ResolvableSimpleDependency<T> | ComplexDependency<T, TAdditional>, additionalDependencies: TAdditional): T;

  public resolve<T, TAdditional extends readonly any[]>(dependency: ResolvableSimpleDependency<T> | ComplexDependency<T, TAdditional>, additionalDependencies?: TAdditional): T {
    try {
      DependencyContainer._dependencyResolutionChain.push(dependency);
      if (DependencyContainer._dependencyResolutionChain.lastIndexOf(dependency, -2) >= 0)
        throw new Error(`Circular dependency detected while trying to resolve '${DependencyContainer._dependencyResolutionChain.map(dependency => dependency?.name ?? dependency).join(' -> ')}'.`)

      if (!isDependency<T, TAdditional>(dependency))
        return dependency;

      if (isComplexDependency<T, TAdditional>(dependency, additionalDependencies))
        return new dependency(this, ...additionalDependencies!);

      let resolvedDependencyFactory: IDependencyFactory<unknown> | null = null;
      let scope: DependencyContainer | null = this;
      do {
        let dependencyFactory = scope._scopedDependencyFactories.get(dependency);

        if (dependencyFactory !== null && dependencyFactory !== undefined)
          if (scope === this)
            resolvedDependencyFactory = dependencyFactory;
          else {
            resolvedDependencyFactory = dependencyFactory.withScope(this);
            this._scopedDependencyFactories.set(dependency, resolvedDependencyFactory);
          }
        else {
          dependencyFactory = scope._singletonDependencyFactories.get(dependency);

          if (dependencyFactory !== null && dependencyFactory !== undefined)
            resolvedDependencyFactory = dependencyFactory;
          else
            scope = scope._parent;
        }
      } while (scope !== null && resolvedDependencyFactory === null);

      if (resolvedDependencyFactory === null)
        if (dependency instanceof DependencyToken)
          throw new Error(`There is no configured dependency for token '${dependency.toString()}'.`);
        else
          return new dependency(this);
      else
        return resolvedDependencyFactory.resolve() as T;
    }
    finally {
      DependencyContainer._dependencyResolutionChain.pop();
    }
  }
}

function isDependency<T, TAdditional extends readonly any[]>(maybeDependency: any): maybeDependency is DependencyToken<T> | BasicDependency<T> | SimpleDependency<T> | ComplexDependency<T, TAdditional> {
  return maybeDependency !== null && maybeDependency !== undefined && (typeof maybeDependency === 'function' || maybeDependency instanceof DependencyToken);
}

function isComplexDependency<T, TAdditional extends readonly any[]>(maybeDependency: any, maybeAdditionalDependencies: any): maybeDependency is ComplexDependency<T, TAdditional> {
  return maybeAdditionalDependencies !== null && maybeAdditionalDependencies !== undefined && Array.isArray(maybeAdditionalDependencies) && maybeAdditionalDependencies.length > 0;
}

interface IDependencyFactory<T> {
  resolve(): T;

  withScope(dependencyResolver: IDependencyResolver): IDependencyFactory<T>;
}

class CachedDelayedDependencyFactory<T> implements IDependencyFactory<T> {
  private _initialized: boolean = false;
  private _instance: T | null = null;
  private readonly _dependencyResolver: IDependencyResolver;
  private readonly _factoryCallback: DependencyFactoryCallback<T>;

  public constructor(dependencyResolver: IDependencyResolver, factoryCallback: DependencyFactoryCallback<T>) {
    this._dependencyResolver = dependencyResolver;
    this._factoryCallback = factoryCallback;
  }

  public resolve(): T {
    if (!this._initialized) {
      this._instance = this._factoryCallback(this._dependencyResolver);
      this._initialized = true;
    }

    return this._instance!;
  }

  public withScope(dependencyResolver: IDependencyResolver): IDependencyFactory<T> {
    return new CachedDelayedDependencyFactory(dependencyResolver, this._factoryCallback);
  }
}

class DelayedDependencyFactory<T> implements IDependencyFactory<T> {
  private readonly _dependencyResolver: IDependencyResolver;
  private readonly _factoryCallback: DependencyFactoryCallback<T>;

  public constructor(dependencyResolver: IDependencyResolver, factoryCallback: DependencyFactoryCallback<T>) {
    this._dependencyResolver = dependencyResolver;
    this._factoryCallback = factoryCallback;
  }

  public resolve(): T {
    return this._factoryCallback(this._dependencyResolver);
  }

  public withScope(dependencyResolver: IDependencyResolver): IDependencyFactory<T> {
    return new DelayedDependencyFactory(dependencyResolver, this._factoryCallback);
  }
}

class InstanceDependencyFactory<T> implements IDependencyFactory<T> {
  private readonly _instance: T;

  public constructor(instance: T) {
    this._instance = instance;
  }

  public resolve(): T {
    return this._instance;
  }

  public withScope(dependencyResolver: IDependencyResolver): IDependencyFactory<T> {
    return this;
  }
}