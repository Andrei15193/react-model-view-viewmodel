import type { IDependencyResolver } from "./IDependencyResolver";
import { DependencyContainer } from "./DependencyContainer";
import { type PropsWithChildren, createContext, createElement, useContext, useMemo, useRef } from "react";

const DependencyResolverContext = createContext<IDependencyResolver>(new DependencyContainer());

/**
 * Returns the currently configured dependency resolver.
 * @returns Returns a dependency resolver.
 */
export function useDependencyResolver(): IDependencyResolver {
    return useContext(DependencyResolverContext)!;
}

/**
 * Represents the dependency resolver context provider props.
 */
export interface IDependencyResolverProviderProps {
    /**
     * The dependency resolver to configure in the context of child components.
     */
    readonly dependencyResolver: IDependencyResolver;
}

/**
 * Configures a dependency resolver in the context of child components.
 */
export function DependencyResolverProvider({ dependencyResolver, children }: PropsWithChildren<IDependencyResolverProviderProps>): JSX.Element {
    return createElement(DependencyResolverContext.Provider, {
        value: dependencyResolver,
        children
    });
}

/**
 * Represents the dependency resolver scope context provider props.
 */
export interface IDependencyResolverScopeProps {
    /**
     * An optional set of dependencies for which the scope should be refreshed.
     * The contents of the array is compared at a shallow level to determine if it has changes.
     */
    readonly deps?: readonly any[];
}

const emptyDeps: readonly any[] = [];

/**
 * Configures a dependency resolver scope in the context of child components.
 */
export function DependencyResolverScope({ deps, children }: PropsWithChildren<IDependencyResolverScopeProps>): JSX.Element {
    const normalizedDeps = deps === null || deps === undefined || !Array.isArray(deps) || deps.length === 0
        ? emptyDeps
        : deps;

    const parentDependencyResolver = useDependencyResolver();

    const cachedDepsRef = useRef(normalizedDeps);
    if (cachedDepsRef.current.length !== normalizedDeps.length || cachedDepsRef.current.some((cachedDep, depIndex) => cachedDep !== normalizedDeps[depIndex]))
        cachedDepsRef.current = normalizedDeps.slice();
    const { current: cachedDeps } = cachedDepsRef;

    const scopedDependencyResolver = useMemo(
        () => parentDependencyResolver.createScope(),
        [parentDependencyResolver, cachedDeps]
    );

    return createElement(DependencyResolverContext.Provider, {
        value: scopedDependencyResolver,
        children: children
    });
}