import { DependencyToken } from "../IDependencyResolver";
import { DependencyContainer } from "../DependencyContainer";

test("Resolving transient type dependency returns instance", () => {
  class MyClass {
  }

  const dependencyContainer = new DependencyContainer();
  dependencyContainer.registerTransientType(MyClass, () => new MyClass());

  const instance = dependencyContainer.resolve(MyClass);

  expect(instance).toBeInstanceOf(MyClass);
});

test("Resolving transient type dependency returns different instances", () => {
  class MyClass {
  }

  const dependencyContainer = new DependencyContainer();
  dependencyContainer.registerTransientType(MyClass, () => new MyClass());

  const firstInstance = dependencyContainer.resolve(MyClass);
  const secondInstance = dependencyContainer.resolve(MyClass);

  expect(firstInstance).not.toBe(secondInstance);
});

test("Resolving transient type dependency calls factory each time", () => {
  class MyClass {}
  let callCount = 0;

  const dependencyContainer = new DependencyContainer();
  dependencyContainer.registerTransientType(MyClass, () => {
    callCount++;
    return new MyClass();
  });

  dependencyContainer.resolve(MyClass);
  dependencyContainer.resolve(MyClass);

  expect(callCount).toStrictEqual(2);
});

test("Resolving transient type token dependency returns instance", () => {
  const token = new DependencyToken<MyClass>("test-dependency-token");
  class MyClass {}

  const dependencyContainer = new DependencyContainer();
  dependencyContainer.registerTransientTypeToToken(token, MyClass);

  const instance = dependencyContainer.resolve(token);

  expect(instance).toBeInstanceOf(MyClass);
});

test("Resolving transient type token dependency returns different instances", () => {
  const token = new DependencyToken<MyClass>("test-dependency-token");
  class MyClass {
  }

  const dependencyContainer = new DependencyContainer();
  dependencyContainer.registerTransientTypeToToken(token, MyClass);

  const firstInstance = dependencyContainer.resolve(token);
  const secondInstance = dependencyContainer.resolve(token);

  expect(firstInstance).not.toBe(secondInstance);
});

test("Resolving transient factory token dependency returns instance", () => {
  const token = new DependencyToken<MyClass>("test-dependency-token");
  class MyClass {}

  const dependencyContainer = new DependencyContainer();
  dependencyContainer.registerTransientFactoryToToken(token, () => new MyClass());

  const instance = dependencyContainer.resolve(token);

  expect(instance).toBeInstanceOf(MyClass);
});

test("Resolving transient factory token dependency returns different instances", () => {
  const token = new DependencyToken<MyClass>("test-dependency-token");
  class MyClass {
  }

  const dependencyContainer = new DependencyContainer();
  dependencyContainer.registerTransientFactoryToToken(token, () => new MyClass());

  const firstInstance = dependencyContainer.resolve(token);
  const secondInstance = dependencyContainer.resolve(token);

  expect(firstInstance).not.toBe(secondInstance);
});

test("Resolving transient factory token dependency calls factory each time", () => {
  let callCount = 0;
  const token = new DependencyToken<MyClass>("test-dependency-token");
  class MyClass {}

  const dependencyContainer = new DependencyContainer();
  dependencyContainer.registerTransientFactoryToToken(token, () => {
    callCount++;
    return new MyClass();
  });

  dependencyContainer.resolve(token);
  dependencyContainer.resolve(token);

  expect(callCount).toStrictEqual(2);
});