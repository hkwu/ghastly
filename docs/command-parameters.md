# Command Parameters
The parameter system in Ghastly allows you to specify user inputs for your commands. All parameters are defined within the `parameters` array in your configurator options.

There are two different ways to define parameters: as strings or as object literals. Object literals have more flexibility and power, but strings are more fluent and easier to read.

## Defining Parameters as Strings
The most basic parameters require only a name. The parameter name is used as a key when passing arguments to the command handler.

```js
return {
  parameters: [
    'param',
  ],
};
```

This defines a parameter with the name `param`. The value of this parameter will be passed to the command handler as `args.param`.

### Description
Similarly to commands, you can add a description to your parameter.

```
param : This is a parameter description.
```

### Optional Parameters
Optional parameters are identified by a leading `-` character.

```
- optionalParam : This is an optional parameter.
```

### Parameter Types
It's possible to specify the expected type of a parameter's value by prefacing the parameter name with a type declaration.

```
(int) integerParam : This parameter's value will be interpreted as an integer.
```

Ghastly will attempt to coerce the raw value of the parameter into the specified type. If the raw value cannot be coerced, the input is rejected.

The following are the available parameter types:

* `boolean`, `bool`: either `'true'` or `'false'`, ignoring case.
* `integer`, `int`: an integer.
* `number`, `num`: any valid `Number`.
* `string`, `str`: a string. This is the default type.

### Default Values
Default values may be specified for optional parameters by placing the value after the parameter name followed by a `=` character.

```
- optionalParamWithDefault = default : This is a parameter with a default value.
```

Parameters with defaults are automatically turned into optional parameters.

```
param = default : This is also an optional parameter.
```

?> If a default is not provided, all optional parameters default to `null`.

### Repeatable Values
You can define a parameter which takes multiple values by appending a `*` to the parameter name.

```
repeatableParam* : This parameter can take multiple values as input.
```

When the user calls this command, they can specify multiple values for this parameter as such:

```
@client echo one two three "four five"
```

The inputs will be passed in as an array: `['one', 'two', 'three', 'four five']`. Defaults can also be specified for repeatable parameters.

```
repeatableParam* = one "two three" : This repeatable parameter has defaults.
```

The given values will be parsed into an array: `['one', 'two three']`.

!> Repeatable parameters must not be followed by any other parameter, i.e. they must be the last parameter.

### Literal Values
Literal parameters will take the value of the input verbatim. You can define literals by appending an ellipsis (`...`) to the parameter name.

```
literalParam... : I am a literal.
```

When the user calls this command, the literal argument takes the value of everything after the command name. For instance,

```
@client echo one two three
```

will generate a single argument: `'one two three'`.

!> Literal parameters may only be used when they are the only parameter in a command.

## Defining Parameters as Objects
Object literal definitions are essentially a superset of string definitions. They share the same options though you must specify them as key/value pairs.

```js
{
  name: 'param',
  description: 'An object literal parameter definition.',
  optional: true,
  type: 'int',
  defaultValue: 0, // provide an array of values for repeatable parameters
  repeatable: false,
  literal: false,
}
```

String and object literal definitions can be freely mixed together, so you might opt to use object literals only as required.
