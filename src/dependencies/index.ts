import type { ResolvableSimpleDependency } from './IDependencyResolver';
import { useDependency } from './UseDependency';

export { type IDependencyResolver, type ResolvableSimpleDependency, type BasicDependency, type SimpleDependency, type ComplexDependency, DependencyToken } from './IDependencyResolver';
export type { IDependencyContainer, ConfigurableDependency, DependencyFactoryCallback } from './IDependencyContainer';
export { DependencyContainer } from './DependencyContainer';

export { useDependency } from './UseDependency';
export { useViewModelDependency } from './UseViewModelDependency';

export {
    type IDependencyResolverProviderProps, DependencyResolverProvider,
    type IDependencyResolverScopeProps, DependencyResolverScope,

    useDependencyResolver
} from './DependencyResolverContext';

interface ILalaProps<T> {
    readonly resolvableDep?: ResolvableSimpleDependency<T>;
}

function LalaComp<T>({ resolvableDep }: ILalaProps<T>): void {
    useDependency(resolvableDep);
}