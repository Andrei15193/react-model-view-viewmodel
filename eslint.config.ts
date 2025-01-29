import type { ESLint, Linter } from 'eslint';
import stylisticPlugin from '@stylistic/eslint-plugin';
import stylisticTypeScriptPlugin from '@stylistic/eslint-plugin-ts';
import esLintTypescriptPlugin from '@typescript-eslint/eslint-plugin';
import esLintTypeScriptParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

export default {
    name: 'React-MVVM',

    languageOptions: {
        parser: esLintTypeScriptParser
    },

    files: ['**/*.ts'],
    ignores: [
        '**/node_modules/',
        '.git/'
    ],

    plugins: {
        '@typescript-eslint': esLintTypescriptPlugin as any as ESLint.Plugin, // trust me bro
        '@stylistic': stylisticPlugin,
        '@stylistic/ts': stylisticTypeScriptPlugin,
        'react-hooks': reactHooksPlugin,
        'import': importPlugin
    },

    rules: {
        '@stylistic/array-bracket-newline': [
            'error',
            {
                multiline: true
            }
        ],
        '@stylistic/array-bracket-spacing': [
            'error',
            'never'
        ],
        '@stylistic/array-element-newline': [
            'error',
            {
                consistent: true,
                multiline: true
            }
        ],
        '@stylistic/arrow-parens': [
            'error',
            'always'
        ],
        '@stylistic/arrow-spacing': [
            'error',
            {
                before: true,
                after: true
            }
        ],
        '@stylistic/block-spacing': [
            'error',
            'always'
        ],
        '@stylistic/brace-style': [
            'error',
            'stroustrup',
            {
                allowSingleLine: false
            }
        ],
        '@stylistic/comma-dangle': [
            'error',
            'never'
        ],
        '@stylistic/comma-spacing': [
            'error',
            {
                before: false,
                after: true
            }
        ],
        '@stylistic/comma-style': [
            'error',
            'last'
        ],
        '@stylistic/computed-property-spacing': [
            'error',
            'never'
        ],
        '@stylistic/curly-newline': [
            'error',
            'always'
        ],
        '@stylistic/dot-location': [
            'error',
            'property'
        ],
        '@stylistic/eol-last': [
            'error',
            'never'
        ],
        '@stylistic/function-call-spacing': [
            'error',
            'never'
        ],
        '@stylistic/function-paren-newline': [
            'error',
            'multiline-arguments'
        ],
        '@stylistic/generator-star-spacing': [
            'error',
            {
                before: true,
                after: false
            }
        ],
        '@stylistic/implicit-arrow-linebreak': [
            'error',
            'beside'
        ],
        '@stylistic/indent': [
            'error',
            4,
            {
                SwitchCase: 1,
                VariableDeclarator: 'first'
            }
        ],
        '@stylistic/indent-binary-ops': [
            'error',
            4
        ],
        '@stylistic/key-spacing': [
            'error',
            {
                beforeColon: false,
                afterColon: true,
                mode: 'strict'
            }
        ],
        '@stylistic/keyword-spacing': [
            'error',
            {
                before: true,
                after: true
            }
        ],
        '@stylistic/lines-between-class-members': [
            'error',
            {
                enforce: [
                    {
                        blankLine: 'always',
                        prev: '*',
                        next: '*'
                    },
                    {
                        blankLine: 'never',
                        prev: 'field',
                        next: 'field'
                    }
                ]
            }
        ],
        '@stylistic/max-statements-per-line': [
            'error',
            {
                max: 1
            }
        ],
        '@stylistic/ts/member-delimiter-style': ['error'],
        '@stylistic/multiline-comment-style': [
            'error',
            'starred-block'
        ],
        '@stylistic/multiline-ternary': [
            'error',
            'always-multiline'
        ],
        '@stylistic/new-parens': ['error'],
        '@stylistic/newline-per-chained-call': [
            'error',
            {
                ignoreChainWithDepth: 1
            }
        ],
        '@stylistic/no-confusing-arrow': ['error'],
        '@stylistic/no-extra-semi': ['error'],
        '@stylistic/no-floating-decimal': ['error'],
        '@stylistic/no-mixed-operators': ['error'],
        '@stylistic/no-mixed-spaces-and-tabs': ['error'],
        '@stylistic/no-multi-spaces': ['error'],
        '@stylistic/no-multiple-empty-lines': [
            'error',
            {
                max: 1,
                maxBOF: 0,
                maxEOF: 0
            }
        ],
        '@stylistic/no-tabs': ['error'],
        '@stylistic/no-trailing-spaces': ['error'],
        '@stylistic/no-whitespace-before-property': ['error'],
        '@stylistic/nonblock-statement-body-position': [
            'error',
            'below'
        ],
        '@stylistic/object-curly-newline': [
            'error',
            {
                ObjectExpression: {
                    consistent: true,
                    minProperties: 2
                },
                ObjectPattern: {
                    consistent: true
                },
                ImportDeclaration: {
                    consistent: true
                },
                ExportDeclaration: {
                    consistent: true
                }
            }
        ],
        '@stylistic/object-curly-spacing': [
            'error',
            'always'
        ],
        '@stylistic/object-property-newline': [
            'error',
            {
                allowAllPropertiesOnSameLine: false
            }
        ],
        '@stylistic/one-var-declaration-per-line': [
            'error',
            'always'
        ],
        '@stylistic/operator-linebreak': [
            'error',
            'before'
        ],
        '@stylistic/padded-blocks': [
            'error',
            'never'
        ],
        '@stylistic/padding-line-between-statements': [
            'error',
            {
                blankLine: 'always',
                prev: '*',
                next: 'case'
            },
            {
                blankLine: 'always',
                prev: '*',
                next: 'default'
            },
            {
                blankLine: 'always',
                prev: 'return',
                next: '*'
            },
            {
                blankLine: 'always',
                prev: '*',
                next: 'return'
            },
            {
                blankLine: 'always',
                prev: 'class',
                next: '*'
            },
            {
                blankLine: 'always',
                prev: '*',
                next: 'class'
            },
            {
                blankLine: 'always',
                prev: 'type',
                next: '*'
            },
            {
                blankLine: 'always',
                prev: '*',
                next: 'type'
            },
            {
                blankLine: 'always',
                prev: 'interface',
                next: '*'
            },
            {
                blankLine: 'always',
                prev: '*',
                next: 'interface'
            },
            {
                blankLine: 'always',
                prev: 'function',
                next: '*'
            },
            {
                blankLine: 'always',
                prev: '*',
                next: 'function'
            },
            {
                blankLine: 'always',
                prev: 'debugger',
                next: '*'
            },
            {
                blankLine: 'always',
                prev: '*',
                next: 'debugger'
            }
        ],
        '@stylistic/quote-props': [
            'error',
            'as-needed',
            {
                keywords: true,
                numbers: true
            }
        ],
        '@stylistic/quotes': [
            'error',
            'single'
        ],
        '@stylistic/rest-spread-spacing': [
            'error',
            'never'
        ],
        '@stylistic/semi': [
            'error',
            'always'
        ],
        '@stylistic/semi-spacing': [
            'error',
            {
                before: false,
                after: true
            }
        ],
        '@stylistic/semi-style': [
            'error',
            'last'
        ],
        '@stylistic/space-before-blocks': [
            'error',
            'always'
        ],
        '@stylistic/space-before-function-paren': [
            'error',
            {
                anonymous: 'always',
                named: 'never',
                asyncArrow: 'always'
            }
        ],
        '@stylistic/space-in-parens': [
            'error',
            'never'
        ],
        '@stylistic/space-infix-ops': ['error'],
        '@stylistic/space-unary-ops': [
            'error',
            {
                words: true,
                nonwords: false
            }
        ],
        '@stylistic/spaced-comment': [
            'error',
            'always',
            {
                block: {
                    balanced: true
                }
            }
        ],
        '@stylistic/switch-colon-spacing': [
            'error',
            {
                after: true,
                before: false
            }
        ],
        '@stylistic/template-curly-spacing': [
            'error',
            'never'
        ],
        '@stylistic/template-tag-spacing': [
            'error',
            'always'
        ],
        '@stylistic/ts/type-annotation-spacing': [
            'error',
            {
                after: true,
                before: false
            }
        ],
        '@stylistic/type-generic-spacing': ['error'],
        '@stylistic/type-named-tuple-spacing': ['error'],
        '@stylistic/wrap-iife': [
            'error',
            'inside'
        ],
        '@stylistic/yield-star-spacing': [
            'error',
            'after'
        ],

        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                vars: 'all',
                varsIgnorePattern: '^_$|^[A-Z]|^(useMemo|useDependency|useViewModelDependency)$',
                args: 'none',
                ignoreRestSiblings: true
            }
        ],
        'no-console': ['warn'],
        'no-extend-native': ['error'],
        'no-var': ['error'],
        'react-hooks/rules-of-hooks': ['error'],
        'react-hooks/exhaustive-deps': ['warn'],
        'import/order': [
            'error',
            {
                pathGroups: [
                    {
                        pattern: '*.scss',
                        group: 'object',
                        patternOptions: {
                            matchBase: true
                        },
                        position: 'after'
                    }
                ],
                groups: [
                    'type',
                    'builtin',
                    'external',
                    'internal',
                    'index',
                    'parent',
                    'sibling',
                    'object'
                ],
                'newlines-between': 'ignore',
                alphabetize: {
                    order: 'asc',
                    caseInsensitive: true
                },
                warnOnUnassignedImports: true
            }
        ],
        'import/newline-after-import': 'warn',
        'import/prefer-default-export': 'off',
        '@typescript-eslint/consistent-type-imports': [
            'error',
            {
                disallowTypeAnnotations: true,
                fixStyle: 'inline-type-imports',
                prefer: 'type-imports'
            }
        ],
        '@typescript-eslint/no-import-type-side-effects': 'error',
        'import/no-duplicates': [
            'error',
            {
                'prefer-inline': true
            }
        ],
        'consistent-return': 'warn',
        radix: [
            'warn',
            'as-needed'
        ],
        'no-useless-escape': 'warn',
        eqeqeq: 'warn',
        'no-unneeded-ternary': 'warn',
        'no-throw-literal': 'warn',
        'guard-for-in': 'warn',
        'no-restricted-syntax': 'warn',
        'no-param-reassign': 'warn',
        'import/no-named-as-default': 'warn'
    }
} satisfies Linter.Config;