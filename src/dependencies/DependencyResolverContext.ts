import type { IDependencyResolver } from "./IDependencyResolver";
import { DependencyContainer } from "./DependencyContainer";
import { createContext } from "react";

export const DependencyResolverContext = createContext<IDependencyResolver>(new DependencyContainer());