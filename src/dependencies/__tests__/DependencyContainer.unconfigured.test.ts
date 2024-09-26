import { type IDependencyResolver, DependencyToken } from "../IDependencyResolver";
import { DependencyContainer } from "../DependencyContainer";

describe('DependencyContainer.unconfigured', (): void => {
  test("Resolve works without context", () => {
    const { resolve } = new DependencyContainer();

    const instance = resolve(class { });

    expect(instance).not.toBeNull();
  });

  test("Resolving null dependency returns null", () => {
    const dependencyContainer = new DependencyContainer();

    const resolvedDependency = dependencyContainer.resolve(null);

    expect(resolvedDependency).toBeNull();
  });

  test("Resolving undefined dependency returns undefined", () => {
    const dependencyContainer = new DependencyContainer();

    const resolvedDependency = dependencyContainer.resolve(undefined);

    expect(resolvedDependency).toBeUndefined();
  });

  test("Resolving object dependency returns object", () => {
    const instnace = {};
    const dependencyContainer = new DependencyContainer();

    const resolvedDependency = dependencyContainer.resolve(instnace);

    expect(resolvedDependency).toStrictEqual(instnace);
  });

  test("Resolving a basic dependency returns instance", () => {
    class MyClass { }

    const dependencyContainer = new DependencyContainer();

    const instance = dependencyContainer.resolve(MyClass);

    expect(instance).toBeInstanceOf(MyClass);
  });

  test("Resolving a simple dependency returns instance", () => {
    class MyClass {
      constructor(dependencyResolver: IDependencyResolver) {
      }
    }

    const dependencyContainer = new DependencyContainer();

    const instance = dependencyContainer.resolve(MyClass);

    expect(instance).toBeInstanceOf(MyClass);
  });

  test("Resolving a simple dependency receives dependecy container as first constructor parameter", () => {
    let receivedDependencyResolver: IDependencyResolver | null = null;

    class MyClass {
      constructor(dependencyResolver: IDependencyResolver) {
        receivedDependencyResolver = dependencyResolver;
      }
    }

    const dependencyContainer = new DependencyContainer();

    dependencyContainer.resolve(MyClass);

    expect(receivedDependencyResolver).toBe(dependencyContainer);
  });

  test("Resolving a complex dependency returns instance", () => {
    class MyClass {
      constructor(dependencyResolver: IDependencyResolver, id: number) {
      }
    }

    const dependencyContainer = new DependencyContainer();

    const instance = dependencyContainer.resolve(MyClass, [1]);

    expect(instance).toBeInstanceOf(MyClass);
  });

  test("Resolving a complex dependency receives dependecy container as first constructor parameter", () => {
    let receivedDependencyResolver: IDependencyResolver | null = null;

    class MyClass {
      constructor(dependencyResolver: IDependencyResolver, id: number) {
        receivedDependencyResolver = dependencyResolver;
      }
    }

    const dependencyContainer = new DependencyContainer();

    dependencyContainer.resolve(MyClass, [1]);

    expect(receivedDependencyResolver).toBe(dependencyContainer);
  });

  test("Resolving a complex dependency receives additional dependency as second constructor parameter", () => {
    let receivedAdditionalDependency: object | null = null;
    const additionalDependency = {};

    class MyClass {
      constructor(dependencyResolver: IDependencyResolver, additionalDependency: object) {
        receivedAdditionalDependency = additionalDependency;
      }
    }

    const dependencyContainer = new DependencyContainer();

    dependencyContainer.resolve(MyClass, [additionalDependency]);

    expect(receivedAdditionalDependency).toBe(additionalDependency);
  });

  test("Resolving a complex dependency receives additional dependency as third constructor parameter", () => {
    let receivedAdditionalDependency: object | null = null;
    const additionalDependency = {};

    class MyClass {
      constructor(dependencyResolver: IDependencyResolver, id: number, additionalDependency: object) {
        receivedAdditionalDependency = additionalDependency;
      }
    }

    const dependencyContainer = new DependencyContainer();

    dependencyContainer.resolve(MyClass, [1, additionalDependency]);

    expect(receivedAdditionalDependency).toBe(additionalDependency);
  });

  test("Resolving type dependency returns instance", () => {
    class MyClass {
    }

    const dependencyContainer = new DependencyContainer();

    const instance = dependencyContainer.resolve(MyClass);

    expect(instance).toBeInstanceOf(MyClass);
  });

  test("Resolving type dependency returns different instance each time", () => {
    class MyClass {
    }

    const dependencyContainer = new DependencyContainer();

    const firstInstance = dependencyContainer.resolve(MyClass);
    const secondInstance = dependencyContainer.resolve(MyClass);

    expect(firstInstance).not.toBe(secondInstance);
  });

  test("Resolving unconfigured token dependency throws exception", () => {
    const token = new DependencyToken<unknown>("test-dependency-token");

    const dependencyContainer = new DependencyContainer();

    expect(() => dependencyContainer.resolve(token)).toThrow(new Error("There is no configured dependency for token 'test-dependency-token'."));
  });
});