import { DependencyToken } from "../IDependencyResolver";
import { DependencyContainer } from "../DependencyContainer";

describe('DependencyContainer.singleton', (): void => {
  test("Resolving singleton type dependency returns instance", () => {
    class MyClass {
    }

    const dependencyContainer = new DependencyContainer();
    dependencyContainer.registerSingletonType(MyClass);

    const instance = dependencyContainer.resolve(MyClass);

    expect(instance).toBeInstanceOf(MyClass);
  });

  test("Resolving singleton type dependency returns same instance", () => {
    class MyClass {
    }

    const dependencyContainer = new DependencyContainer();
    dependencyContainer.registerSingletonType(MyClass);

    const firstInstance = dependencyContainer.resolve(MyClass);
    const secondInstance = dependencyContainer.resolve(MyClass);

    expect(firstInstance).toBe(secondInstance);
  });

  test("Resolving singleton type dependency calls factory once", () => {
    class MyClass { }
    let callCount = 0;

    const dependencyContainer = new DependencyContainer();
    dependencyContainer.registerSingletonType(MyClass, () => {
      callCount++;
      return new MyClass();
    });

    dependencyContainer.resolve(MyClass);
    dependencyContainer.resolve(MyClass);

    expect(callCount).toStrictEqual(1);
  });

  test("Resolving singleton type dependency returns same instance", () => {
    class MyClass { }
    const instance = {};

    const dependencyContainer = new DependencyContainer();
    dependencyContainer.registerSingletonType(MyClass, () => instance);

    const firstInstance = dependencyContainer.resolve(MyClass);
    const secondInstance = dependencyContainer.resolve(MyClass);

    expect(firstInstance).toBe(instance);
    expect(secondInstance).toBe(instance);
  });

  test("Resolving singleton type token dependency returns instance", () => {
    const token = new DependencyToken<MyClass>("test-dependency-token");
    class MyClass { }

    const dependencyContainer = new DependencyContainer();
    dependencyContainer.registerSingletonTypeToToken(token, MyClass);

    const instance = dependencyContainer.resolve(token);

    expect(instance).toBeInstanceOf(MyClass);
  });

  test("Resolving singleton type token dependency returns same instance", () => {
    const token = new DependencyToken<MyClass>("test-dependency-token");
    class MyClass {
    }

    const dependencyContainer = new DependencyContainer();
    dependencyContainer.registerSingletonTypeToToken(token, MyClass);

    const firstInstance = dependencyContainer.resolve(token);
    const secondInstance = dependencyContainer.resolve(token);

    expect(firstInstance).toBe(secondInstance);
  });

  test("Resolving instance token dependency returns same instance", () => {
    const token = new DependencyToken<unknown>("test-dependency-token");
    const instance = {};

    const dependencyContainer = new DependencyContainer();
    dependencyContainer.registerInstanceToToken(token, instance);

    const resolvedInstance = dependencyContainer.resolve(token);

    expect(resolvedInstance).toBe(instance);
  });

  test("Resolving singleton factory token dependency returns instance", () => {
    const token = new DependencyToken<MyClass>("test-dependency-token");
    class MyClass { }

    const dependencyContainer = new DependencyContainer();
    dependencyContainer.registerSingletonFactoryToToken(token, () => new MyClass());

    const instance = dependencyContainer.resolve(token);

    expect(instance).toBeInstanceOf(MyClass);
  });

  test("Resolving singleton factory token dependency returns same instance", () => {
    const token = new DependencyToken<MyClass>("test-dependency-token");
    class MyClass {
    }

    const dependencyContainer = new DependencyContainer();
    dependencyContainer.registerSingletonFactoryToToken(token, () => new MyClass());

    const firstInstance = dependencyContainer.resolve(token);
    const secondInstance = dependencyContainer.resolve(token);

    expect(firstInstance).toBe(secondInstance);
  });

  test("Resolving singleton factory token dependency calls factory once", () => {
    let callCount = 0;
    const token = new DependencyToken<MyClass>("test-dependency-token");
    class MyClass { }

    const dependencyContainer = new DependencyContainer();
    dependencyContainer.registerSingletonFactoryToToken(token, () => {
      callCount++;
      return new MyClass();
    });

    dependencyContainer.resolve(token);
    dependencyContainer.resolve(token);

    expect(callCount).toStrictEqual(1);
  });
});