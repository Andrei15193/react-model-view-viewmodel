import type { ResolvableSimpleDependency, ComplexDependency, IDependencyResolver } from "./IDependencyResolver";
import { useMemo, useRef } from "react";
import { useDependencyResolver } from "./useDependencyResolver";

const emptyAdditionalDependencies: readonly unknown[] = [];

export function useDependency<T>(dependency: ResolvableSimpleDependency<T>): T;
export function useDependency<T, TAdditional extends readonly any[]>(dependency: ComplexDependency<T, TAdditional>, additionalDependencies: TAdditional): T;
export function useDependency<T, TAdditional extends readonly any[]>(dependency: ResolvableSimpleDependency<T> | ComplexDependency<T, TAdditional>, additionalDependencies: TAdditional): T;

export function useDependency<T, TAdditional extends readonly any[]>(dependency: ResolvableSimpleDependency<T> | ComplexDependency<T, TAdditional>, additionalDependencies?: TAdditional): T {
  const normalizedAdditionalDependencies = additionalDependencies === null || additionalDependencies == undefined || !Array.isArray(additionalDependencies) || additionalDependencies.length === 0
    ? emptyAdditionalDependencies as TAdditional
    : additionalDependencies;

  const dependecyResolver = useDependencyResolver();

  const cachedAdditionalDependenciesRef = useRef(additionalDependencies);
  if (
    cachedAdditionalDependenciesRef.current !== normalizedAdditionalDependencies
    || cachedAdditionalDependenciesRef.current.length !== normalizedAdditionalDependencies.length
    || cachedAdditionalDependenciesRef.current.some((cachedAdditionalDependency, additionalDependencyIndex) => cachedAdditionalDependency !== normalizedAdditionalDependencies[additionalDependencyIndex])
  )
    cachedAdditionalDependenciesRef.current = normalizedAdditionalDependencies;
  const { current: cachedAdditionalDependencies } = cachedAdditionalDependenciesRef;

  const instance = useMemo(
    () => dependecyResolver.resolve<T, TAdditional>(dependency, cachedAdditionalDependencies),
    [dependecyResolver, dependency, cachedAdditionalDependencies]
  );

  return instance;
}