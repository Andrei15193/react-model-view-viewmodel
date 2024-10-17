import type { IDependencyResolver, BasicDependency, SimpleDependency, ComplexDependency, DependencyToken, ResolvableSimpleDependency } from "./IDependencyResolver";
import type { useDependency } from './UseDependency';

/**
 * Represents a configurable dependency.
 *
 * @template T The configurable dependency type.
 *
 * @see {@link IDependencyResolver}
 * @see {@link IDependencyContainer}
 * @see {@link BasicDependency}
 * @see {@link SimpleDependency}
 * @see {@link ComplexDependency}
 * @see {@link DependencyToken}
 * @see {@link useDependency}
 */
export type ConfigurableDependency<T> = BasicDependency<T> | SimpleDependency<T>;

/**
 * Represents a callback for initializing dependencies.
 * 
 * @template T The dependency type that is resolved.
 * 
 * @see {@link IDependencyResolver}
 * @see {@link IDependencyContainer}
 * @see {@link ResolvableSimpleDependency}
 * @see {@link ConfigurableDependency}
 * @see {@link useDependency}
 */
export type DependencyFactoryCallback<T> = (dependecyResolver: IDependencyResolver) => T;

/**
 * Represents a dependency container for configuring and later on resolving dependencies similar to a dependency injection mechanism.
 * 
 * @description There are three levels for configuring dependencies.
 * 
 * **Singleton** - dependencies are initialized only once and each time they are requested the same instance is returned.
 * 
 * **Scoped** - dependencies are initialized only one for each scope. Whenever the same dependency is resolved in the same
 * scope, the same instance is returned. When a dependency is requested in different scopes, different instances are returned.
 * 
 * **Transient** - dependencies are initialized each time they are requested, this is the default for all types allowing
 * for seamless use of the container regardless of whether types are configured or not.
 * 
 * ----
 * 
 * The above is exemplified using the following code snippet.
 * 
 * ```ts
 * const dependencyContainer = new DependencyContainer()
 *   .registerSingletonType(MyFirstClass)
 *   .registerScopedType(MySecondClass);
 * 
 * const singletonInstance1 = dependencyContainer.resolve(MyFirstClass);
 * const singletonInstance2 = dependencyContainer.resolve(MyFirstClass);
 * singletonInstance1 === singletonInstance2; // true
 * 
 * const scope1 = dependencyContainer.createScope();
 * const scope2 = dependencyContainer.createScope();
 * const scopedInstance1 = scope1.resolve(MySecondClass);
 * const scopedInstance2 = scope1.resolve(MySecondClass);
 * const scopedInstance3 = scope2.resolve(MySecondClass);
 * scopedInstance1 === scopedInstance2; // true
 * scopedInstance1 === scopedInstance3; // false
 * 
 * const transient1 = dependencyContainer.resolve(MyThirdClass);
 * const transient2 = dependencyContainer.resolve(MyThirdClass);
 * transient1 === transient2; // false
 * ```
 * @see {@link IDependencyResolver}
 * @see {@link SimpleDependency}
 * @see {@link ConfigurableDependency}
 * @see {@link useDependency}
 */
export interface IDependencyContainer {
  /**
   * Registers the provided type as a singleton dependency.
   * @template T The dependency type to configure.
   * @param type The type to configure.
   * @returns Returns the dependency container.
   */
  registerSingletonType<T>(type: ConfigurableDependency<T>): IDependencyContainer;
  /**
   * Registers the provided type as a singleton dependency.
   * @template T The dependency type to configure.
   * @param type The type to configure.
   * @param factoryCallback A callback for initializing an instace of the given type.
   * @returns Returns the dependency container.
   */
  registerSingletonType<T>(type: ConfigurableDependency<T>, factoryCallback: DependencyFactoryCallback<T>): IDependencyContainer;

  /**
   * Registers the provided instance for the given token.
   * @template T The dependency type to configure.
   * @param token The token used to resolve dependencies.
   * @param instance The instance to return when resolving the dependency token.
   * @returns Returns the dependency container.
   */
  registerInstanceToToken<T>(token: DependencyToken<T>, instance: T): IDependencyContainer;
  /**
   * Registers the provided type for the given token as a singleton dependency.
   * @template T The dependency type to configure.
   * @param token The token used to resolve dependencies.
   * @param type The type to configure.
   * @returns Returns the dependency container.
   */
  registerSingletonTypeToToken<T>(token: DependencyToken<T>, type: ConfigurableDependency<T>): IDependencyContainer;
  /**
   * Registers the provided callback for the given token as a singleton dependency.
   * @template T The dependency type to configure.
   * @param token The token used to resolve dependencies.
   * @param factoryCallback A callback for initializing an instace of the given type.
   * @returns Returns the dependency container.
   */
  registerSingletonFactoryToToken<T>(token: DependencyToken<T>, factoryCallback: DependencyFactoryCallback<T>): IDependencyContainer;

  /**
   * Registers the provided type as a scoped dependency.
   * @template T The dependency type to configure.
   * @param type The type to configure.
   * @returns Returns the dependency container.
   */
  registerScopedType<T>(type: ConfigurableDependency<T>): IDependencyContainer;
  /**
   * Registers the provided type as a scoped dependency.
   * @template T The dependency type to configure.
   * @param type The type to configure.
   * @param factoryCallback A callback for initializing an instace of the given type.
   * @returns Returns the dependency container.
   */
  registerScopedType<T>(type: ConfigurableDependency<T>, factoryCallback: DependencyFactoryCallback<T>): IDependencyContainer;

  /**
   * Registers the provided type for the given token as a scoped dependency.
   * @template T The dependency type to configure.
   * @param token The token used to resolve dependencies.
   * @param type The type to configure.
   * @returns Returns the dependency container.
   */
  registerScopedTypeToToken<T>(token: DependencyToken<T>, type: ConfigurableDependency<T>): IDependencyContainer;
  /**
   * Registers the provided callback for the given token as a scoped dependency.
   * @template T The dependency type to configure.
   * @param token The token used to resolve dependencies.
   * @param factoryCallback A callback for initializing an instace of the given type.
   * @returns Returns the dependency container.
   */
  registerScopedFactoryToToken<T>(token: DependencyToken<T>, factoryCallback: DependencyFactoryCallback<T>): IDependencyContainer;

  /**
   * Registers the provided type as a transient dependency.
   * @template T The dependency type to configure.
   * @param type The type to configure.
   * @param factoryCallback A callback for initializing an instace of the given type.
   * @returns Returns the dependency container.
   */
  registerTransientType<T>(type: ConfigurableDependency<T>, factoryCallback: DependencyFactoryCallback<T>): IDependencyContainer;

  /**
   * Registers the provided type for the given token as a transient dependency.
   * @template T The dependency type to configure.
   * @param token The token used to resolve dependencies.
   * @param type The type to configure.
   * @returns Returns the dependency container.
   */
  registerTransientTypeToToken<T>(token: DependencyToken<T>, type: ConfigurableDependency<T>): IDependencyContainer;
  /**
   * Registers the provided callback for the given token as a transient dependency.
   * @template T The dependency type to configure.
   * @param token The token used to resolve dependencies.
   * @param factoryCallback A callback for initializing an instace of the given type.
   * @returns Returns the dependency container.
   */
  registerTransientFactoryToToken<T>(token: DependencyToken<T>, factoryCallback: DependencyFactoryCallback<T>): IDependencyContainer;
}