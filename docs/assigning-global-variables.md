---
title: Setting global variables or functions
---

import { SideBySide } from "@site/src/components/SideBySide";

In some Lua environments, the host application expects you to define some global variables or functions as part of the API. For example, some engines might allow you to define some event handlers in your Lua, that will be called by the engine when different events happen:

```lua title=example.lua
function OnStart()
    -- start event handling code
end

function OnStateChange(newState)
    -- state change event handler code
end
```

Due to the way TSTL translates module code, functions will be `local` after translation, causing the engine not to find them:

<SideBySide>

```typescript title=input.ts
function OnStart(this: void) {
  // start event handling code
}
function OnStateChange(this: void, newState: State) {
  // state change event handler code
}
```

```lua title=output.lua
local function OnStart()
end
local function OnStateChange(newState)
end
```

</SideBySide>

This means we need some extra helper code to correctly register these global variables so your environment can access them.

## Setting global variables with a helper function

One way to assign global variables and functions is to use a helper function like this:

```typescript
function registerEventHandler<TArgs extends unknown[]>(
  handlerName: string,
  handler: (this: void, ...args: TArgs) => void,
): void {
  // @ts-ignore tell TS to ignore us 'illegally' writing to global scope
  globalThis[handlerName] = handler;
}
```

This helper function can be added in some shared TypeScript helper file and imported wherever you need it.

You can now write the example code like this:

```typescript
registerEventHandler("OnStart", () => {
  // start event handling code
});
registerEventHandler("OnStateChanged", (newState: State) => {
  // state change event handler code
});
```

Of course you can modify `registerEventHandler` to your needs if you need to assign variables of different types to the global scope. For example, you could add a second `register` function for assigning non-function values if needed:

```typescript
function registerGlobalVariable<T>(variableName: string, value: T): void {
  // @ts-ignore tell TS to ignore us 'illegally' writing to global scope
  globalThis[handlerName] = value;
}
```

## Registering functions as class methods with a decorator

Sometimes you don't want to register just a loose function, but instead register a class or class method. A very nice way to do this is to use decorators (they unfortunately only work on classes, and not for loose functions).

One example of such a decorator is:

```typescript
function registerEventHandler<TReturn, TArgs extends unknown[]>(
  method: (...args: TArgs) => TReturn,
  context: ClassMethodDecoratorContext,
) {
  /** @noSelf - the engine will not pass self parameter so wrap in lambda without self */
  const contextless = (...args: TArgs) => method(...args);
  // We can read the name of the method from the context
  const globalName = context.name;
  // @ts-ignore tell TS to ignore us 'illegally' writing to global scope
  globalThis[globalName] = contextless;
}
```

You can then write above example as:

```typescript
class EventHandlers {
  @registerEventHandler
  public OnStart() {
    // start event handling code
  }
  @registerEventHandler
  public OnStateChanged(newState: State) {
    // state change event handler code
  }
}
```

:::note
In the above example, `this` will be `nil` in the methods, do not try to use other members in the EventHandlers class!
:::

## Registering classes with a decorator

Sometimes you want to register classes as globals, you can also do that with a decorator:

```typescript
function registerClass<TClass, TArgs extends unknown[]>(
  c: new (...args: TArgs) => TClass,
  context: ClassDecoratorContext,
) {
  if (context.name) {
    // @ts-ignore tell TS to ignore us 'illegally' writing to global scope
    globalThis[context.name] = c;
  }
}
```

You can now register any class by simply adding the decorator:

```typescript
@registerClass
class EventHandlers {
  public OnStart() {
    // start event handling code
  }
  public OnStateChanged(newState: State) {
    // state change event handler code
  }
}
```

### Custom global name decorator

In the examples above, the decorators directly used the name of the decorated class or method, but with decorator parameters you can also specify custom override names:

```typescript
const registerClass =
  (globalName: string) =>
  <TClass, TArgs extends unknown[]>(c: new (...args: TArgs) => TClass, context: ClassDecoratorContext) => {
    if (context.name) {
      // @ts-ignore tell TS to ignore us 'illegally' writing to global scope
      globalThis[globalName] = c;
    }
  };
```

Now instead of taking the global name from the class, you can specify a custom name yourself:

```typescript
@registerClass("CustomGlobalName")
class EventHandlers {
  public OnStart() {
    // start event handling code
  }
  public OnStateChanged(newState: State) {
    // state change event handler code
  }
}
```

## Assigning to globals with declarations

The main weakness of the above methods is that you can declare any string, not protecting you from typos, and not giving any kind of editor support. This is fine if there are only a few such registrations that need to be done, but is somewhat error prone.

An alternative method would be to explicitly declare the global variables in a declarations file:

```ts
declare var OnStart: (this: void) => void;
declare var OnStateChanged: (this: void, newState: State) => void;
```

You can then assign to these functions as if they were global variables:

```typescript
OnStart = () => {
  // start event handling code
};
OnStateChanged = (newState: State) => {
  // state change event handler code
};
```

This of course only works if you know the names of the global variables beforehand, if these names are dynamic, consider using one of the other methods instead.
