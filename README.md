# DOM

Library for create, and modify DOM elements

Library is implemented in a way similar to `jsx` `h` function.

There is a <a href="https://www.npmjs.com/package/express-react-vanilla-adapter">adapter package</a> that use this library as a jsx templates for express library.

There is a <a href="https://www.npmjs.com/package/cms-tapir">cms-tapir package</a> that implements a web server capable of creating REST requests and also use this library as jsx templates `h` function.

Library is capable of using reactive values.

Properties and children can be defined as functions. If function is presented — it would be called with a callback parameter. When callback parameter is called with some value — parameter would be updated with this value.

Async functions are also supported.

# Store

Storage that provide reactive values for DOM part. Tests covered. Read docs of above packages for examples.

# Ajax

Simple XMLHttpRequest wrapper.

GET:
```js
Ajax.get( url, data, callback, config );
Ajax.get( url, callback, config );
await Ajax.async.get(url, data);
```

POST, DELETE are implemented in the same way.

# Random.seeded

Extends `Math.random` with `seeded` method.

`mulberry32` is used as the source of seeded random.

`Math.random.seeded.rand([1, 2, 3])` would return one value from the array

`Math.random.seeded.setSeed( someString | someNumber)` set a new seed

`var newSeeded = new Math.random.seeded.constructor()` create a uniq seeded random

<a href="https://blog.form.dev/random/random">Article about random</a>


# Versions

List of old versions are here: <a href="https://form.dev/vanilla">form.dev</a>
