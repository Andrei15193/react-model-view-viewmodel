import type { IDependencyResolver, ResolvableSimpleDependency, ComplexDependency } from "./IDependencyResolver";
import type { IDependencyContainer } from './IDependencyContainer';
import type { useViewModelDependency } from './UseViewModelDependency';
import { useMemo, useRef } from "react";
import { useDependencyResolver, type DependencyResolverProvider, type DependencyResolverScope } from "./DependencyResolverContext";

const emptyAdditionalDependencies: readonly unknown[] = [];

/**
 * Resolves the requested dependency using the resolver in the current context.
 *
 * @template T The dependency type to resolve.
 *
 * @param dependency The dependency to resolve.
 *
 * @returns Returns the resolved dependency.
 *
 * @see {@link IDependencyResolver}
 * @see {@link IDependencyContainer}
 * @see {@link ResolvableSimpleDependency}
 * @see {@link useDependencyResolver}
 * @see {@link useViewModelDependency}
 * @see {@link DependencyResolverProvider}
 * @see {@link DependencyResolverScope}
 */
export function useDependency<T>(dependency: ResolvableSimpleDependency<T>): T;

/**
 * Resolves the requested complex dependency using the resovler in the current context.
 *
 * @template T The dependency type to resolve.
 * @template TAdditional A tuple representing additional parameters required by the constructor.
 *
 * @param dependency The complex dependency to resolve.
 * @param additionalDependencies Additional constructor arguments which also act as dependencies, if one of them changes the dependency will be reinitialized.
 *
 * @returns Returns the resolved dependency.
 *
 * @see {@link IDependencyResolver}
 * @see {@link IDependencyContainer}
 * @see {@link ResolvableSimpleDependency}
 * @see {@link useDependencyResolver}
 * @see {@link useViewModelDependency}
 * @see {@link DependencyResolverProvider}
 * @see {@link DependencyResolverScope}
 */
export function useDependency<T, TAdditional extends readonly any[]>(dependency: ComplexDependency<T, TAdditional>, additionalDependencies: TAdditional): T;

export function useDependency<T, TAdditional extends readonly any[]>(dependency: ResolvableSimpleDependency<T> | ComplexDependency<T, TAdditional>, additionalDependencies?: TAdditional): T {
  const normalizedAdditionalDependencies = additionalDependencies === null || additionalDependencies == undefined || !Array.isArray(additionalDependencies) || additionalDependencies.length === 0
    ? emptyAdditionalDependencies as TAdditional
    : additionalDependencies;

  const dependecyResolver = useDependencyResolver();

  const cachedAdditionalDependenciesRef = useRef(normalizedAdditionalDependencies);
  if (cachedAdditionalDependenciesRef.current.length !== normalizedAdditionalDependencies.length || cachedAdditionalDependenciesRef.current.some((cachedAdditionalDependency, additionalDependencyIndex) => !Object.is(cachedAdditionalDependency, normalizedAdditionalDependencies[additionalDependencyIndex])))
    cachedAdditionalDependenciesRef.current = normalizedAdditionalDependencies.slice() as any as TAdditional;
  const { current: cachedAdditionalDependencies } = cachedAdditionalDependenciesRef;

  const instance = useMemo(
    () => dependecyResolver.resolve<T, TAdditional>(dependency as ComplexDependency<T, TAdditional>, cachedAdditionalDependencies),
    [dependecyResolver, dependency, cachedAdditionalDependencies]
  );

  return instance;
}