import type { IDependencyContainer, ConfigurableDependency } from './IDependencyContainer';
import type { IDependencyResolver, ResolvableSimpleDependency } from './IDependencyResolver';
import type { useDependency } from './UseDependency';
import { type PropsWithChildren, createContext, createElement, useContext, useMemo, useRef } from 'react';
import { DependencyContainer } from './DependencyContainer';

const DependencyResolverContext = createContext<IDependencyResolver>(new DependencyContainer());

/**
 * Gets the currently configured dependency resolver.
 *
 * @returns Returns the currently configured dependency resolver.
 *
 * @see {@link IDependencyResolver}
 * @see {@link IDependencyContainer}
 * @see {@link ConfigurableDependency}
 * @see {@link ResolvableSimpleDependency}
 * @see {@link useDependency}
 * @see {@link DependencyResolverProvider}
 * @see {@link DependencyResolverScope}
 */
export function useDependencyResolver(): IDependencyResolver {
    return useContext(DependencyResolverContext);
}

/**
 * Represents the dependency resolver context provider props.
 *
 * @see {@link DependencyResolverProvider}
 */
export interface IDependencyResolverProviderProps {
    /**
     * The dependency resolver to configure in the context of child components.
     */
    readonly dependencyResolver: IDependencyResolver;
}

/**
 * Configures a dependency resolver in the context of child components.
 *
 * @returns Returns the `children` in the context of the provided `dependencyResolver`.
 *
 * @see {@link IDependencyResolver}
 * @see {@link IDependencyContainer}
 * @see {@link useDependency}
 */
export function DependencyResolverProvider(props: PropsWithChildren<IDependencyResolverProviderProps>): JSX.Element {
    const { dependencyResolver, children } = props;

    return createElement(DependencyResolverContext.Provider, {
        value: dependencyResolver,
        children
    });
}

/**
 * Represents the dependency resolver scope context provider props.
 *
 * @see {@link DependencyResolverScope}
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
 *
 * @see {@link IDependencyResolver}
 * @see {@link IDependencyContainer}
 * @see {@link useDependency}
 */
export function DependencyResolverScope({ deps, children }: PropsWithChildren<IDependencyResolverScopeProps>): JSX.Element {
    const normalizedDeps = deps === null || deps === undefined || !Array.isArray(deps) || deps.length === 0
        ? emptyDeps
        : deps;

    const parentDependencyResolver = useDependencyResolver();

    const scopedDependencyResolverRef = useRef<IDependencyResolver | null>(null);
    const cachedDepsRef = useRef(normalizedDeps);
    if (scopedDependencyResolverRef.current === null || cachedDepsRef.current.length !== normalizedDeps.length || cachedDepsRef.current.some((cachedDep, depIndex) => cachedDep !== normalizedDeps[depIndex])) {
        scopedDependencyResolverRef.current = parentDependencyResolver.createScope();
        cachedDepsRef.current = normalizedDeps.slice();
    }

    return createElement(DependencyResolverContext.Provider, {
        value: scopedDependencyResolverRef.current,
        children: children
    });
}