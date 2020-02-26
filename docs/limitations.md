---
title: Limitations
---

There are certain features of Typescript, that are either not allowed or only partially supported. The following is a list of limitations.

## Config / CompilerOptions

Important Supported options are:

- rootDir
- outDir
- project
- (baseUrl)
- skipLibCheck
- strict
- noImplicitAny
- noImplicitThis

For options not listed here, as a rule of thumb: **all options that configure type checking will work.**

All other options are most likely not supported and will have no effect.

**baseUrl**

Does only work if your base url points to a directory inside your rootDir. Avoid using baseUrl if possible.

## String functions

Not all string functions are supported. The supported functions are:

- indexOf
- substring
- replace <sup>[[1](#stringreplace)]</sup>
- charAt
- split
- toLowerCase
- toUpperCase

### string.replace

Regular expressions in calls to `string.replace` are not supported. You can use Lua's Pattern strings (https://www.lua.org/pil/20.2.html) instead.

## Array functions

Not all array functions are supported. The supported functions are:

- push
- forEach
- map
- filter
- some
- every
- slice
- splice
- join
- indexOf

## Bit Operations

Bit operations require Lua version `> 5.1`

For `JIT` the LuaBitOp module (http://bitop.luajit.org) is required.

## Try/Catch & Throw

Basic support exists, but you are only allowed to throw string literals.

## Iterating an array with `for ... in`

Not allowed.