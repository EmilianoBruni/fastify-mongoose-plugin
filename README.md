# Fastify MongoDB Plugin using Mongoose ODM

_A modern Fastify plugin with support for Typescript, ES6/commonJS module, to connect to a MongoDB instance via the Mongoose ODM_

Fastify-mongoose-plugin is a rewrite from scratch of [fastify-mongoose/fastify-mongoose-driver](/alex-ppg/fastify-mongoose) which seems not more mantained.

It's is full compatible with fastify-mongoose-driver but add some modern features:

* Support for Typescript (fastify-mongoose-plugin is wrote in typescript)
* Support for ES6 module
* Support for commonJS module
* `modelDirPath` option to define models in separate files.

## Installation

```bash
npm i fastify-mongoose-plugin -s
```

## Usage

```javascript
// ...Other Plugins
import mongoosePlugin, { decorator } from "fastify-mongoose-driver"

fastify.register(
  mongoosePlugin,
  {
    uri: "mongodb://admin:pass@localhost:27017/database_name",
    settings: {
      useNewUrlParser: true,
      config: {
        autoIndex: true,
      },
    },
    models: [
      {
        name: "posts",
        alias: "Post",
        schema: {
          title: {
            type: String,
            required: true,
          },
          content: {
            type: String,
            required: true,
          },
          // We can add references to other Schemas like-so
          author: {
            type: "ObjectId",
            ref: "Account",
            validateExistance: true,
          },
          // We can also add schema configurable options
          options: {
            timestamps: true,
          },
        },
      },
      {
        name: "accounts",
        alias: "Account",
        schema: {
          username: {
            type: String,
          },
          password: {
            type: String,
            select: false,
            required: true,
          },
          email: {
            type: String,
            unique: true,
            required: true,
            validate: {
              validator: (v) => {
                // Super simple email regex: https://stackoverflow.com/a/4964763/7028187
                return /^.+@.{2,}\..{2,}$/.test(v);
              },
              message: (props) => `${props.value} is not a valid email!`,
            },
          },
          createdAtUTC: {
            type: Date,
            required: true,
          },
        },
        virtualize: (schema) => {
          schema.virtual("posts", {
            ref: "Post",
            localKey: "_id",
            foreignKey: "author",
          });
        },
      },
    ],
    useNameAndAlias: true,
    modelDirPath: path.resolve("..."), // will be merged with models
  },
  (err) => {
    if (err) throw err;
  }
);

fastify.get("/", (request, reply) => {
  console.log(fastify.mongoose.instance); // Mongoose ODM instance
  console.log(fastify.mongoose.Account); // Any models declared are available here
});

decorator(); // Returns the decorator pointer, useful for using mongoose in seperate files
```

## Options

| Option            | Description                                                                                                                                                                                           |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `uri`             | Required, the Unique Resource Identifier to use when connecting to the Database.                                                                                                                      |
| `settings`        | Optional, the settings to be passed on to the MongoDB Driver as well as the Mongoose-specific options. [Refer here for further info](https://mongoosejs.com/docs/api.html#mongoose_Mongoose-connect). |
| `models`          | Optional, any models to be declared and injected under `fastify.mongoose`                                                                                                                             |
| `useNameAndAlias` | Optional, declares models using `mongoose.model(alias, schema, name)` instead of `mongoose.model(name, schema)`                                                                                       |
| `modelDirPath` | Optional, directory where it's possible to define models in separate files. The directory will be trasverse includes all subdirectories

Any models declared should follow the following format:

```javascript
{
  name: "profiles", // Required, should match name of model in database
  alias: "Profile", // Optional, an alias to inject the model as
  schema: schemaDefinition, // Required, should match schema of model in database,
  options: schemaOptions, // Optional, schema configurable options
  class: classDefinition // Optional, should be an ES6 class wrapper for the model
}
```

or, if definitions are splitted in separate files using `modelDirPath` option:
```javascript
// modelDirPath/profile.js
module.exports = {
  ...
}
```

The `schemaDefinition` variable should be created according to the [Mongoose Model Specification](https://mongoosejs.com/docs/schematypes.html).

The `schemaOptions` variable should be created according to the [Mongoose Model Options Specification](https://mongoosejs.com/docs/guide.html#options).

The `classDefinition` variable should be created according to the [Mongoose Class Specification](https://mongoosejs.com/docs/4.x/docs/advanced_schemas.html).

## CommonJS

This module supports both ESM and CommonJS. If you are using CommonJS, you can import it like so:

```js
const mongoosePlugin = require('fastify-mongoose-plugin');
```

## Bugs / Help / Feature Requests / Contributing

* For feature requests or help, please visit [the discussions page on GitHub](https://github.com/EmilianoBruni/fastify-mongoose-plugin/discussions).

* For bug reports, please file an issue on [the issues page on GitHub](https://github.com/EmilianoBruni/fastify-mongoose-plugin/issues).

* Contributions welcome! Please open a [pull request on GitHub](https://github.com/EmilianoBruni/fastify-mongoose-plugin/pulls) with your changes. You can run them by me first on [the discussions page](https://github.com/EmilianoBruni/fastify-mongoose-plugin/discussions) if you'd like. Please add tests for any changes.

## Author

[Emiliano Bruni](info@ebruni.it)

Original JS code [Alex Papageorgiou](alex.ppg@pm.me)

## License

Licensed under [APACHE 2.0](./LICENSE)
