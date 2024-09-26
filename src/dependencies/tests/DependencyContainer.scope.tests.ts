import { DependencyToken } from "../IDependencyResolver";
import { DependencyContainer } from "../DependencyContainer";

describe('DependencyContainer.scope', (): void => {
  test("Resolving scoped type dependency returns instance", () => {
    class MyClass {
    }

    const scopedDependencyResolver = new DependencyContainer()
      .registerScopedType(MyClass)
      .createScope();

    const instance = scopedDependencyResolver.resolve(MyClass);

    expect(instance).toBeInstanceOf(MyClass);
  });

  test("Resolving scoped type dependency returns same instance", () => {
    class MyClass {
    }

    const scopedDependencyResolver = new DependencyContainer()
      .registerScopedType(MyClass)
      .createScope();

    const firstInstance = scopedDependencyResolver.resolve(MyClass);
    const secondInstance = scopedDependencyResolver.resolve(MyClass);

    expect(firstInstance).toBe(secondInstance);
  });

  test("Resolving singleton type dependency returns same instance across scopes", () => {
    class MyClass {
    }

    const dependencyResolver = new DependencyContainer()
      .registerSingletonType(MyClass);

    const firstInstance = dependencyResolver.resolve(MyClass);
    const secondInstance = dependencyResolver.createScope().resolve(MyClass);
    const thirdInstance = dependencyResolver.createScope().resolve(MyClass);

    expect(firstInstance).toBe(secondInstance);
    expect(secondInstance).toBe(thirdInstance);
  });

  test("Resolving scoped type dependency returns different instance across scopes", () => {
    class MyClass {
    }

    const dependencyContainer = new DependencyContainer().registerScopedType(MyClass);

    const firstInstance = dependencyContainer.createScope().resolve(MyClass);
    const secondInstance = dependencyContainer.createScope().resolve(MyClass);

    expect(firstInstance).not.toBe(secondInstance);
  });

  test("Resolving scoped type dependency returns different instance from parent scope", () => {
    class MyClass {
    }

    const dependencyContainer = new DependencyContainer();
    dependencyContainer.registerScopedType(MyClass);
    const scopedDependencyResolver = dependencyContainer.createScope();

    const firstInstance = dependencyContainer.resolve(MyClass);
    const secondInstance = scopedDependencyResolver.resolve(MyClass);

    expect(firstInstance).not.toBe(secondInstance);
  });

  test("Resolving scoped type dependency calls factory once", () => {
    class MyClass { }
    let callCount = 0;

    const scopedDependencyResolver = new DependencyContainer()
      .registerScopedType(MyClass, () => {
        callCount++;
        return new MyClass();
      })
      .createScope();

    scopedDependencyResolver.resolve(MyClass);
    scopedDependencyResolver.resolve(MyClass);

    expect(callCount).toStrictEqual(1);
  });

  test("Resolving scoped type dependency calls factory once per scope", () => {
    class MyClass { }
    let callCount = 0;

    const dependencyContainer = new DependencyContainer()
      .registerScopedType(MyClass, () => {
        callCount++;
        return new MyClass();
      });

    dependencyContainer.createScope().resolve(MyClass);
    dependencyContainer.createScope().resolve(MyClass);

    expect(callCount).toStrictEqual(2);
  });

  test("Resolving scoped type dependency returns cached instance", () => {
    class MyClass { }
    const instance = {};

    const scopedDependencyResolver = new DependencyContainer()
      .registerScopedType(MyClass, () => instance)
      .createScope();

    const firstInstance = scopedDependencyResolver.resolve(MyClass);
    const secondInstance = scopedDependencyResolver.resolve(MyClass);

    expect(firstInstance).toBe(instance);
    expect(secondInstance).toBe(instance);
  });

  test("Resolving scoped type dependency returns cached instance across scopes", () => {
    class MyClass { }
    const instance = {};

    const dependnecyContainer = new DependencyContainer()
      .registerScopedType(MyClass, () => instance);

    const firstInstance = dependnecyContainer.createScope().resolve(MyClass);
    const secondInstance = dependnecyContainer.createScope().resolve(MyClass);

    expect(firstInstance).toBe(instance);
    expect(secondInstance).toBe(instance);
  });

  test("Resolving scoped unconfigured token dependency throws exception", () => {
    const token = new DependencyToken<unknown>("test-dependency-token");

    const scopedDependencyResolver = new DependencyContainer().createScope();

    expect(() => scopedDependencyResolver.resolve(token)).toThrow(new Error("There is no configured dependency for token 'test-dependency-token'."));
  });

  test("Resolving scoped type token dependency returns instance", () => {
    const token = new DependencyToken<MyClass>("test-dependency-token");
    class MyClass { }

    const scopedDependencyResolver = new DependencyContainer()
      .registerScopedTypeToToken(token, MyClass)
      .createScope();

    const instance = scopedDependencyResolver.resolve(token);

    expect(instance).toBeInstanceOf(MyClass);
  });

  test("Resolving scoped type token dependency returns same instance", () => {
    const token = new DependencyToken<MyClass>("test-dependency-token");
    class MyClass {
    }

    const scopedDependencyResolver = new DependencyContainer()
      .registerScopedTypeToToken(token, MyClass)
      .createScope();

    const firstInstance = scopedDependencyResolver.resolve(token);
    const secondInstance = scopedDependencyResolver.resolve(token);

    expect(firstInstance).toBe(secondInstance);
  });

  test("Resolving scoped type token dependency returns different instances across scopes", () => {
    const token = new DependencyToken<MyClass>("test-dependency-token");
    class MyClass {
    }

    const dependnecyContainer = new DependencyContainer().registerScopedTypeToToken(token, MyClass);

    const firstInstance = dependnecyContainer.createScope().resolve(token);
    const secondInstance = dependnecyContainer.createScope().resolve(token);

    expect(firstInstance).not.toBe(secondInstance);
  });

  test("Resolving scoped factory token dependency returns instance", () => {
    const token = new DependencyToken<MyClass>("test-dependency-token");
    class MyClass { }

    const scopedDependencyResolver = new DependencyContainer()
      .registerScopedFactoryToToken(token, () => new MyClass())
      .createScope();

    const instance = scopedDependencyResolver.resolve(token);

    expect(instance).toBeInstanceOf(MyClass);
  });

  test("Resolving scoped factory token dependency returns same instance", () => {
    const token = new DependencyToken<MyClass>("test-dependency-token");
    class MyClass {
    }

    const scopedDependencyResolver = new DependencyContainer()
      .registerScopedFactoryToToken(token, () => new MyClass())
      .createScope();

    const firstInstance = scopedDependencyResolver.resolve(token);
    const secondInstance = scopedDependencyResolver.resolve(token);

    expect(firstInstance).toBe(secondInstance);
  });

  test("Resolving scoped factory token dependency returns different instances across scopes", () => {
    const token = new DependencyToken<MyClass>("test-dependency-token");
    class MyClass {
    }

    const dependencyContainer = new DependencyContainer().registerScopedFactoryToToken(token, () => new MyClass());

    const firstInstance = dependencyContainer.createScope().resolve(token);
    const secondInstance = dependencyContainer.createScope().resolve(token);

    expect(firstInstance).not.toBe(secondInstance);
  });

  test("Resolving scoped factory token dependency calls factory once", () => {
    let callCount = 0;
    const token = new DependencyToken<MyClass>("test-dependency-token");
    class MyClass { }

    const scopedDependencyResolver = new DependencyContainer()
      .registerScopedFactoryToToken(token, () => {
        callCount++;
        return new MyClass();
      })
      .createScope();

    scopedDependencyResolver.resolve(token);
    scopedDependencyResolver.resolve(token);

    expect(callCount).toStrictEqual(1);
  });

  test("Resolving scoped factory token dependency calls factory once per scope", () => {
    let callCount = 0;
    const token = new DependencyToken<MyClass>("test-dependency-token");
    class MyClass { }

    const dependencyContainer = new DependencyContainer()
      .registerScopedFactoryToToken(token, () => {
        callCount++;
        return new MyClass();
      });

    dependencyContainer.createScope().resolve(token);
    dependencyContainer.createScope().resolve(token);

    expect(callCount).toStrictEqual(2);
  });
});