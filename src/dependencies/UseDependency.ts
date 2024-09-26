import type { ResolvableSimpleDependency, ComplexDependency } from "./IDependencyResolver";
import { useMemo, useRef } from "react";
import { useDependencyResolver } from "./DependencyResolverContext";

const emptyAdditionalDependencies: readonly unknown[] = [];

/**
 * Resolves the requested dependency using the resolver in the current context.
 * @param dependency The dependency to resolve.
 */
export function useDependency<T>(dependency: ResolvableSimpleDependency<T>): T;
/**
 * Resolves the requested complex dependency using the resovler in the current context.
 * @param dependency The complex dependency to resolve.
 * @param additionalDependencies Additional constructor arguments which also act as dependencies, if one of them changes the dependency will be reinitialized.
 */
export function useDependency<T, TAdditional extends readonly any[]>(dependency: ComplexDependency<T, TAdditional>, additionalDependencies: TAdditional): T;
/**
 * Resolves the requested dependency using the resolver in the current context.
 * 
 * This is a function allowing for easier reuse in other similarly defined hooks, such as {@see useViewModelDependency}.
 * @param dependency The dependency to resolve.
 * @param additionalDependencies Additional constructor arguments which also act as dependencies, if one of them changes the dependency will be reinitialized.
 */
export function useDependency<T, TAdditional extends readonly any[]>(dependency: ResolvableSimpleDependency<T> | ComplexDependency<T, TAdditional>, additionalDependencies: TAdditional): T;

export function useDependency<T, TAdditional extends readonly any[]>(dependency: ResolvableSimpleDependency<T> | ComplexDependency<T, TAdditional>, additionalDependencies?: TAdditional): T {
  const normalizedAdditionalDependencies = additionalDependencies === null || additionalDependencies == undefined || !Array.isArray(additionalDependencies) || additionalDependencies.length === 0
    ? emptyAdditionalDependencies as TAdditional
    : additionalDependencies;

  const dependecyResolver = useDependencyResolver();

  const cachedAdditionalDependenciesRef = useRef(normalizedAdditionalDependencies);
  if (cachedAdditionalDependenciesRef.current.length !== normalizedAdditionalDependencies.length || cachedAdditionalDependenciesRef.current.some((cachedAdditionalDependency, additionalDependencyIndex) => cachedAdditionalDependency !== normalizedAdditionalDependencies[additionalDependencyIndex]))
    cachedAdditionalDependenciesRef.current = normalizedAdditionalDependencies.slice() as any as TAdditional;
  const { current: cachedAdditionalDependencies } = cachedAdditionalDependenciesRef;

  const instance = useMemo(
    () => dependecyResolver.resolve<T, TAdditional>(dependency, cachedAdditionalDependencies),
    [dependecyResolver, dependency, cachedAdditionalDependencies]
  );

  return instance;
}