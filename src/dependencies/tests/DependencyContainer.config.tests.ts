import { DependencyToken } from "../IDependencyResolver";
import { DependencyContainer } from "../DependencyContainer";

test("Configuring a type as singleton then as scoped updates the configuration", () => {
  class MyClass {
  }

  const dependencyResolver = new DependencyContainer()
    .registerSingletonType(MyClass)
    .registerScopedType(MyClass)
    .createScope();

  const firstInstance = dependencyResolver.resolve(MyClass);
  const secondInstance = dependencyResolver.resolve(MyClass);
  const thirdInstance = dependencyResolver.createScope().resolve(MyClass);

  expect(firstInstance).toBe(secondInstance);
  expect(firstInstance).not.toBe(thirdInstance);
  expect(secondInstance).not.toBe(thirdInstance);
});

test("Configuring a type as scoped then as singleton updates the configuration", () => {
  class MyClass {
  }

  const dependencyResolver = new DependencyContainer()
    .registerScopedType(MyClass)
    .registerSingletonType(MyClass)
    .createScope();

  const firstInstance = dependencyResolver.resolve(MyClass);
  const secondInstance = dependencyResolver.resolve(MyClass);
  const thirdInstance = dependencyResolver.createScope().resolve(MyClass);

  expect(firstInstance).toBe(secondInstance);
  expect(firstInstance).toBe(thirdInstance);
  expect(secondInstance).toBe(thirdInstance);
});

test("Configuring a type as singleton then as transient updates the configuration", () => {
  class MyClass {
  }

  const dependencyResolver = new DependencyContainer()
    .registerSingletonType(MyClass)
    .registerTransientType(MyClass, () => new MyClass())
    .createScope();

  const firstInstance = dependencyResolver.resolve(MyClass);
  const secondInstance = dependencyResolver.resolve(MyClass);
  const thirdInstance = dependencyResolver.createScope().resolve(MyClass);

  expect(firstInstance).not.toBe(secondInstance);
  expect(firstInstance).not.toBe(thirdInstance);
  expect(secondInstance).not.toBe(thirdInstance);
});

test("Configuring a type as transient then as singleton updates the configuration", () => {
  class MyClass {
  }

  const dependencyResolver = new DependencyContainer()
    .registerTransientType(MyClass, () => new MyClass())
    .registerSingletonType(MyClass)
    .createScope();

  const firstInstance = dependencyResolver.resolve(MyClass);
  const secondInstance = dependencyResolver.resolve(MyClass);
  const thirdInstance = dependencyResolver.createScope().resolve(MyClass);

  expect(firstInstance).toBe(secondInstance);
  expect(firstInstance).toBe(thirdInstance);
  expect(secondInstance).toBe(thirdInstance);
});

test("Configuring a type as scoped then as transient updates the configuration", () => {
  class MyClass {
  }

  const dependencyResolver = new DependencyContainer()
    .registerScopedType(MyClass)
    .registerTransientType(MyClass, () => new MyClass())
    .createScope();

  const firstInstance = dependencyResolver.resolve(MyClass);
  const secondInstance = dependencyResolver.resolve(MyClass);
  const thirdInstance = dependencyResolver.createScope().resolve(MyClass);

  expect(firstInstance).not.toBe(secondInstance);
  expect(firstInstance).not.toBe(thirdInstance);
  expect(secondInstance).not.toBe(thirdInstance);
});

test("Configuring a type as transient then as scoped updates the configuration", () => {
  class MyClass {
  }

  const dependencyResolver = new DependencyContainer()
    .registerTransientType(MyClass, () => new MyClass())
    .registerScopedType(MyClass)
    .createScope();

  const firstInstance = dependencyResolver.resolve(MyClass);
  const secondInstance = dependencyResolver.resolve(MyClass);
  const thirdInstance = dependencyResolver.createScope().resolve(MyClass);

  expect(firstInstance).toBe(secondInstance);
  expect(firstInstance).not.toBe(thirdInstance);
  expect(secondInstance).not.toBe(thirdInstance);
});

test("Configuring a token as singleton then as scoped updates the configuration", () => {
  const token = new DependencyToken<MyClass>("test-dependency-token");
  class MyClass {
  }

  const dependencyResolver = new DependencyContainer()
    .registerSingletonFactoryToToken(token, () => new MyClass())
    .registerScopedFactoryToToken(token, () => new MyClass())
    .createScope();

  const firstInstance = dependencyResolver.resolve(token);
  const secondInstance = dependencyResolver.resolve(token);
  const thirdInstance = dependencyResolver.createScope().resolve(token);

  expect(firstInstance).toBe(secondInstance);
  expect(firstInstance).not.toBe(thirdInstance);
  expect(secondInstance).not.toBe(thirdInstance);
});

test("Configuring a token as scoped then as singleton updates the configuration", () => {
  const token = new DependencyToken<MyClass>("test-dependency-token");
  class MyClass {
  }

  const dependencyResolver = new DependencyContainer()
    .registerScopedTypeToToken(token, MyClass)
    .registerSingletonTypeToToken(token, MyClass)
    .createScope();

  const firstInstance = dependencyResolver.resolve(token);
  const secondInstance = dependencyResolver.resolve(token);
  const thirdInstance = dependencyResolver.createScope().resolve(token);

  expect(firstInstance).toBe(secondInstance);
  expect(firstInstance).toBe(thirdInstance);
  expect(secondInstance).toBe(thirdInstance);
});

test("Configuring a token as singleton then as transient updates the configuration", () => {
  const token = new DependencyToken<MyClass>("test-dependency-token");
  class MyClass {
  }

  const dependencyResolver = new DependencyContainer()
    .registerSingletonFactoryToToken(token, () => new MyClass())
    .registerTransientTypeToToken(token, MyClass)
    .createScope();

  const firstInstance = dependencyResolver.resolve(token);
  const secondInstance = dependencyResolver.resolve(token);
  const thirdInstance = dependencyResolver.createScope().resolve(token);

  expect(firstInstance).not.toBe(secondInstance);
  expect(firstInstance).not.toBe(thirdInstance);
  expect(secondInstance).not.toBe(thirdInstance);
});

test("Configuring a token as transient then as singleton updates the configuration", () => {
  const token = new DependencyToken<MyClass>("test-dependency-token");
  class MyClass {
  }

  const dependencyResolver = new DependencyContainer()
    .registerTransientTypeToToken(token, MyClass)
    .registerInstanceToToken(token, {})
    .createScope();

  const firstInstance = dependencyResolver.resolve(token);
  const secondInstance = dependencyResolver.resolve(token);
  const thirdInstance = dependencyResolver.createScope().resolve(token);

  expect(firstInstance).toBe(secondInstance);
  expect(firstInstance).toBe(thirdInstance);
  expect(secondInstance).toBe(thirdInstance);
});

test("Configuring a token as scoped then as transient updates the configuration", () => {
  const token = new DependencyToken<MyClass>("test-dependency-token");
  class MyClass {
  }

  const dependencyResolver = new DependencyContainer()
    .registerScopedFactoryToToken(token, () => new MyClass())
    .registerTransientFactoryToToken(token, () => new MyClass())
    .createScope();

  const firstInstance = dependencyResolver.resolve(token);
  const secondInstance = dependencyResolver.resolve(token);
  const thirdInstance = dependencyResolver.createScope().resolve(token);

  expect(firstInstance).not.toBe(secondInstance);
  expect(firstInstance).not.toBe(thirdInstance);
  expect(secondInstance).not.toBe(thirdInstance);
});

test("Configuring a token as transient then as scoped updates the configuration", () => {
  const token = new DependencyToken<MyClass>("test-dependency-token");
  class MyClass {
  }

  const dependencyResolver = new DependencyContainer()
    .registerTransientTypeToToken(token, MyClass)
    .registerScopedTypeToToken(token, MyClass)
    .createScope();

  const firstInstance = dependencyResolver.resolve(token);
  const secondInstance = dependencyResolver.resolve(token);
  const thirdInstance = dependencyResolver.createScope().resolve(token);

  expect(firstInstance).toBe(secondInstance);
  expect(firstInstance).not.toBe(thirdInstance);
  expect(secondInstance).not.toBe(thirdInstance);
});

test("Child dependency container overrides parent singleton configuraiton without affecting it", () => {
  class MyClass {
  }

  const parentDependencyContainer = new DependencyContainer()
    .registerSingletonType(MyClass);
  const childDependencyContainer = new DependencyContainer(parentDependencyContainer)
    .registerTransientType(MyClass, () => new MyClass());

  const firstInstanceFromParent = parentDependencyContainer.resolve(MyClass);
  const secondInstanceFromParent = parentDependencyContainer.resolve(MyClass);
  const firstInstanceFromChild = childDependencyContainer.resolve(MyClass);
  const secondInstanceFromChild = childDependencyContainer.resolve(MyClass);

  expect(firstInstanceFromParent).toBe(secondInstanceFromParent);

  expect(firstInstanceFromParent).not.toBe(firstInstanceFromChild);
  expect(firstInstanceFromParent).not.toBe(secondInstanceFromChild);

  expect(secondInstanceFromParent).not.toBe(firstInstanceFromChild);
  expect(secondInstanceFromParent).not.toBe(secondInstanceFromChild);

  expect(firstInstanceFromChild).not.toBe(secondInstanceFromChild);
});

test("Child dependency container overrides parent transient configuraiton without affecting it", () => {
  class MyClass {
  }

  const parentDependencyContainer = new DependencyContainer()
    .registerTransientType(MyClass, () => new MyClass());
  const childDependencyContainer = new DependencyContainer(parentDependencyContainer)
    .registerSingletonType(MyClass);

  const firstInstanceFromParent = parentDependencyContainer.resolve(MyClass);
  const secondInstanceFromParent = parentDependencyContainer.resolve(MyClass);
  const firstInstanceFromChild = childDependencyContainer.resolve(MyClass);
  const secondInstanceFromChild = childDependencyContainer.resolve(MyClass);

  expect(firstInstanceFromParent).not.toBe(secondInstanceFromParent);

  expect(firstInstanceFromParent).not.toBe(firstInstanceFromChild);
  expect(firstInstanceFromParent).not.toBe(secondInstanceFromChild);

  expect(secondInstanceFromParent).not.toBe(firstInstanceFromChild);
  expect(secondInstanceFromParent).not.toBe(secondInstanceFromChild);

  expect(firstInstanceFromChild).toBe(secondInstanceFromChild);
});

test("Child dependency container uses parent configuraiton as fallback", () => {
  class MyFirstClass {
  }
  class MySecondClass {
    public constructor(public instance: MyFirstClass) {
    }
  }

  const parentDependencyContainer = new DependencyContainer()
    .registerSingletonType(MyFirstClass);
  const childDependencyContainer = new DependencyContainer(parentDependencyContainer)
    .registerScopedType(MySecondClass, ({ resolve }) => new MySecondClass(resolve(MyFirstClass)));

  const parentInstance = parentDependencyContainer.resolve(MyFirstClass);
  const firstChildInstance = childDependencyContainer.resolve(MyFirstClass);
  const secondChildInstance = childDependencyContainer.resolve(MySecondClass);

  expect(firstChildInstance).toBe(parentInstance);
  expect(secondChildInstance.instance).toBe(parentInstance);
});

test("Child dependency container uses own configuraiton when overridden", () => {
  class MyFirstClass {
  }
  class MySecondClass {
    public constructor(public instance: MyFirstClass) {
    }
  }

  const parentDependencyContainer = new DependencyContainer()
    .registerSingletonType(MyFirstClass);
  const childDependencyContainer = new DependencyContainer(parentDependencyContainer)
    .registerSingletonType(MyFirstClass)
    .registerScopedType(MySecondClass, ({ resolve }) => new MySecondClass(resolve(MyFirstClass)));

  const parentInstance = parentDependencyContainer.resolve(MyFirstClass);
  const firstChildInstance = childDependencyContainer.resolve(MyFirstClass);
  const secondChildInstance = childDependencyContainer.resolve(MySecondClass);

  expect(firstChildInstance).not.toBe(parentInstance);
  expect(secondChildInstance.instance).toBe(firstChildInstance);
});