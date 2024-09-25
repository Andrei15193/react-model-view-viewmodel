import type { IDependencyResolver } from "./IDependencyResolver";
import { useContext } from "react";
import { DependencyResolverContext } from "./DependencyResolverContext";

/**
 * Returns the currently configured dependency resolver.
 * @returns Returns a dependency resolver.
 */
export function useDependencyResolver(): IDependencyResolver {
  return useContext(DependencyResolverContext)!;
}