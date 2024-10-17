import type { IDependencyContainer, ConfigurableDependency } from "./IDependencyContainer";
import type { useDependency } from './UseDependency';

/**
 * Represents a dependency resolver as an information expert responsible with initializing and providing requested dependencies.
 *
 * @see {@link IDependencyContainer}
 * @see {@link ResolvableSimpleDependency}
 * @see {@link ConfigurableDependency}
 * @see {@link useDependency}
 */
export interface IDependencyResolver {
  /**
   * Creates a scoped dependency resolver. All scoped configured dependencies are resolved for each scope individually,
   * while singletons are unique from the scope that configured them downwards.
   *
   * @returns Returns a scoped dependency resolver.
   */
  createScope(): IDependencyResolver;

  /**
   * Resolves a dependency based on its configuration, if any. All unconfigured dependencies are transient.
   *
   * @template T The dependency type to resolve.
   * 
   * @param dependency The dependnecy to resolve.
   *
   * @returns The resolved dependency.
   */
  resolve<T>(dependency: ResolvableSimpleDependency<T>): T;
  /**
   * Resolves a complex dependency. All such dependencies are transient as they require
   * additional dependencies on the constructor.
   *
   * @template T The dependency type to resolve.
   * @template TAdditional A tuple representing additional parameters required by the constructor.
   *
   * @param dependency The complex dependnecy to resolve.
   * @param additionalDependencies Additional dependencies requested by the constructor besides the dependency resolver.
   *
   * @returns The resolved dependency.
   */
  resolve<T, TAdditional extends readonly any[]>(dependency: ComplexDependency<T, TAdditional>, additionalDependencies: TAdditional): T;
}

/**
 * Represents a resolvable dependency, this being an already resolved instance which is returned immediatelly,
 * a dependency token, a basic or a simple dependency.
 * 
 * Resolvable dependencies provide an option where a dependency is resolved, but if there is an edge case where
 * said dependency was already resolved in a different way, it is provided through the same call allowing for
 * different use cases.
 *
 * @template T The resolvable dependency type.
 *
 * @see {@link IDependencyResolver}
 * @see {@link IDependencyContainer}
 * @see {@link BasicDependency}
 * @see {@link SimpleDependency}
 * @see {@link ComplexDependency}
 * @see {@link DependencyToken}
 * @see {@link useDependency}
 */
export type ResolvableSimpleDependency<T> = Exclude<T, Function> | DependencyToken<T> | BasicDependency<T> | SimpleDependency<T>;

/**
 * Represents a basic dependency where the constructor does not require a resolver or any other dependencies
 * to create an instance.
 *
 * @template T The basic dependency type.
 *
 * @see {@link IDependencyResolver}
 * @see {@link IDependencyContainer}
 * @see {@link ResolvableSimpleDependency}
 * @see {@link ConfigurableDependency}
 * @see {@link useDependency}
 */
export type BasicDependency<T> = {
  new(): T;
};

/**
 * Represents a simple dependnecy where any additional dependencies are resolved through the provided dependnecy resolver.
 *
 * @template T The simple dependency type.
 *
 * @see {@link IDependencyResolver}
 * @see {@link IDependencyContainer}
 * @see {@link ResolvableSimpleDependency}
 * @see {@link ConfigurableDependency}
 * @see {@link useDependency}
 */
export type SimpleDependency<T> = {
  new(dependencyResolver: IDependencyResolver): T;
};

/**
 * Represents a complex dependency where additional dependencies are both resolved through the provided dependnecy resolver
 * as well as providing them as constructor parameters.
 * 
 * This is a more complex case where some parameters are page or component specific, such as the entity ID that is loaded.
 * 
 * @template T The complex dependency type.
 * @template TAdditional A tuple representing additional parameters required by the constructor.
 *
 * @see {@link IDependencyResolver}
 * @see {@link IDependencyContainer}
 * @see {@link ResolvableSimpleDependency}
 * @see {@link ConfigurableDependency}
 * @see {@link useDependency}
 */
export type ComplexDependency<T, TAdditional extends readonly any[]> = {
  new(dependencyResolver: IDependencyResolver, ...additionalDependencies: TAdditional): T;
};

/**
 * Represents a dependency token for which types, factories or instances can be configured.
 * 
 * This is an abstraction where definitions cannot be configured directly, such as interfaces.
 * Instead binding an interface to an implementation, a dependency token is configured for
 * an implementation.
 * 
 * @template T The type that is associated with the dependency token.
 *
 * @see {@link IDependencyResolver}
 * @see {@link IDependencyContainer}
 * @see {@link ResolvableSimpleDependency}
 * @see {@link ConfigurableDependency}
 * @see {@link useDependency}
 */
export class DependencyToken<T> {
  /**
   * Initializes a new instance of the {@linkcode DependencyToken} class.
   * @param description A textual description of the token used in exception messages.
   */
  public constructor(description: string) {
    this.description = description;
  }

  /**
   * Gets the dependency token textual description.
   */
  public readonly description: string;

  /**
   * Gets the string representation of the dependency token.
   */
  public toString(): string {
    return this.description;
  }
}