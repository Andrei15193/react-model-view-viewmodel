import React, { type PropsWithChildren, useMemo, useRef } from "react";
import { useDependencyResolver } from "./useDependencyResolver";
import { DependencyResolverProvider } from "./DependencyResolverProvider";

export interface IDependencyResolverScopeProps {
  readonly deps?: readonly any[];
}

const emptyDeps: readonly any[] = [];

export function DependencyResolverScope({ deps, children }: PropsWithChildren<IDependencyResolverScopeProps>): JSX.Element {
  const normalizedDeps = deps === null || deps === undefined || !Array.isArray(deps) || deps.length === 0
    ? emptyDeps
    : deps;

  const parentDependencyResolver = useDependencyResolver();

  const cachedDepsRef = useRef(normalizedDeps);
  if (
    cachedDepsRef.current !== normalizedDeps
    || cachedDepsRef.current.length !== normalizedDeps.length
    || cachedDepsRef.current.some((cachedDep, depIndex) => cachedDep !== normalizedDeps[depIndex])
  )
    cachedDepsRef.current = normalizedDeps;
  const { current: cachedDeps } = cachedDepsRef;

  const scopedDependencyResolver = useMemo(
    () => parentDependencyResolver.createScope(),
    [parentDependencyResolver, cachedDeps]
  );

  return (
    <DependencyResolverProvider dependencyResolver={scopedDependencyResolver} children={children} />
  );
}