import { DependencyToken, type IDependencyResolver } from "../IDependencyResolver";
import { DependencyContainer } from "../DependencyContainer";

describe('DependencyContainer.circular', (): void => {
  test("Attempting to resolve self referencing dependency throws exception", () => {
    class A {
      private static _resolveCount = 0;

      constructor({ resolve }: IDependencyResolver) {
        A._resolveCount++;
        if (A._resolveCount > 1)
          throw new Error('This is only thrown to avoid a stack overflow and stop the test faster. This point should never be reached.');

        resolve(A);
      }
    }

    const { resolve } = new DependencyContainer()
      .registerSingletonType(A);

    expect(() => resolve(A)).toThrow(new Error('Circular dependency detected while trying to resolve \'A -> A\'.'));
  });

  test("Attempting to resolve circular dependency throws exception", () => {
    class A {
      private static _resolveCount = 0;

      constructor({ resolve }: IDependencyResolver) {
        A._resolveCount++;
        if (A._resolveCount > 1)
          throw new Error('This is only thrown to avoid a stack overflow and stop the test faster. This point should never be reached.');

        resolve(B);
      }
    }

    class B {
      constructor({ resolve }: IDependencyResolver) {
        resolve(C);
      }
    }

    class C {
      constructor({ resolve }: IDependencyResolver) {
        resolve(A);
      }
    }

    const { resolve } = new DependencyContainer();

    expect(() => resolve(A)).toThrow(new Error('Circular dependency detected while trying to resolve \'A -> B -> C -> A\'.'));
  });


  test("Attempting to resolve circular dependency with tokens throws exception", () => {
    const dependencyTokenA = new DependencyToken('token A');
    const dependencyTokenB = new DependencyToken('token B');


    class A {
      private static _resolveCount = 0;

      constructor({ resolve }: IDependencyResolver) {
        A._resolveCount++;
        if (A._resolveCount > 2)
          throw new Error('This is only thrown to avoid a stack overflow and stop the test faster. This point should never be reached.');

        resolve(dependencyTokenB);
      }
    }

    class B {
      constructor({ resolve }: IDependencyResolver) {
        resolve(C);
      }
    }

    class C {
      constructor({ resolve }: IDependencyResolver) {
        resolve(dependencyTokenA);
      }
    }

    const { resolve } = new DependencyContainer()
      .registerScopedTypeToToken(dependencyTokenA, A)
      .registerTransientTypeToToken(dependencyTokenB, B);

    expect(() => resolve(A)).toThrow(new Error('Circular dependency detected while trying to resolve \'A -> token B -> C -> token A -> token B\'.'));
  });
});