# Fastify MongoDB Plugin using Mongoose ODM

_A modern Fastify plugin with support for Typescript, ES6/commonJS module, to connect to a MongoDB instance via the Mongoose ODM_

Fastify-mongoose-plugin is a rewrite from scratch of [fastify-mongoose/fastify-mongoose-driver](https://github.com/alex-ppg/fastify-mongoose) which seems not more mantained.

It's is full compatible with fastify-mongoose-driver (see [below](#how-to-upgrade-your-projects-from-fastify-mongoose-driver) how to upgrade your project if you are this) but add some modern features:

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
import mongoosePlugin, { decorator } from "fastify-mongoose-plugin"

fastify.register(
  mongoosePlugin,
  {
    uri: "mongodb://admin:pass@localhost:27017/database_name",
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
| `modelDirPath` | Optional, directory where it's possible to define models in separate files. The directory will be trasverse includes all subdirectories. Scan only files with .js extension.

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
export default {
  ...
}
```

The `schemaDefinition` variable should be created according to the [Mongoose Model Specification](https://mongoosejs.com/docs/schematypes.html).

The `schemaOptions` variable should be created according to the [Mongoose Model Options Specification](https://mongoosejs.com/docs/guide.html#options).

The `classDefinition` variable should be created according to the [Mongoose Class Specification](https://mongoosejs.com/docs/4.x/docs/advanced_schemas.html).

## How to upgrade your projects from fastify-mongoose-driver

* Replace with fastify-mongoose-plugin in you package.json

```bash
pnpm rm fastify-mongoose-driver
pnpm install fastify-mongoose-plugin -s
```
* in your plugins files where fastify-mongoose-driver was used

```javascript
import mongoose from 'fastify-mongoose-driver' // delete this
import mongoose from 'fastify-mongoose-plugin' // replace with
```

* If used `require('fastify-mongoose-api').plugin`, remove `.plugin`.

* If used in plugin settings:
  
  * remove `useCreateIndex: true` because is default from Mongoose 6 and is removed in Mongoose 8
  * remove `useNewUrlParser: true` and `useUnifiedTopology: true` because is default from Mongoose 6 and is marked as deprecated in Mongoose 8

* Optional: Convert your library to ES6 :-)

## Examples 

### Typescript example under @fastify/autoload

Create a config file in `configs/db/db.config.ts` like this

```typescript
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
    uri: 'mongodb://username:password@host:27017/db',
    modelDirPath: __dirname + "/schemas"
};
```

load config via plugin folder `plugins/config.ts`

```typescript
import config from '../configs/app.config.js';
import fp from 'fastify-plugin';

export default fp(
    async app => {
        app.decorate('config', config);
        app.ready(err => {
            if (err) throw err;
        });
    },
    {
        name: 'config'
    }
);
```

load mongoose via plugin folder `plugins/mongoose.ts`


```typescript
import type { TFMPOptions } from 'fastify-mongoose-plugin';
import config from '../configs/db/db.config.js';
import mongoose from 'fastify-mongoose-plugin';
import fp from 'fastify-plugin';

export default fp<TFMPOptions>(
    async app => {
        app.register(mongoose, {
            uri: config.uri,
            modelDirPath: config.modelDirPath
        }).after(err => {
            if (err) throw err;
            app.mongoose.instance.set(
                'debug',
                process.env.NODE_ENV === 'development'
            );
        });
    },
    {
        name: 'mongoose',
        dependencies: ['config']
    }
);
```

Inside `configs/db/schemas` put db schemas, like this `test.ts`

```typescript
import type { TFMPModel } from 'fastify-mongoose-plugin';

const schema: TFMPModel = {
    name: "test",
    options: {
        timestamps: true, // add createdAt and updatedAt fields
        versionKey: false, // remove __v field
    },
    schema: {
        name: { type: 'String', required: true },
        age: { type: 'Number', required: true },
        address: { type: 'String' },
        createdAt: { type: 'Date', default: Date.now },
        updatedAt: { type: 'Date', default: Date.now },
    }
};

export default schema;
```

Now you can use `fastify.mongoose.Test` as a Mongoose Model to test collection. 

As an example, this a REST like entries

```typescript
import { FastifyInstance, FastifyRequest } from "fastify";

type RequestId = { Params: { id: string } };
type RequestBody = {
    Body: {
        name: string,
        age: number,
        address: string
    }
};

const page = async (app: FastifyInstance) => {
    app.get('/test', async function () {
        const Test = app.mongoose.Test;
        if (!Test) { return 'Test is not defined'; }
        const test = await Test.find();
        return test;
    })
    app.post('/test', async function (request: FastifyRequest<RequestBody>) {
        const Test = app.mongoose.Test;
        if (!Test) { return 'Test is not defined'; }
        const test = new Test(request.body);
        return test.save();
    })

    app.get('/test/:id', async function (request: FastifyRequest<RequestId>) {
        const Test = app.mongoose.Test;
        if (!Test) { return 'Test is not defined'; }
        const test = await Test.findById(request.params.id);
        return test;
    })

    app.put('/test/:id', async function (request: FastifyRequest<RequestBody & RequestId>) {
        const Test = app.mongoose.Test;
        if (!Test) { return 'Test is not defined'; }
        const test = await Test.findByIdAndUpdate(request.params.id, request.body);
        return test;
    })

    app.delete('/test/:id', async function (request: FastifyRequest<RequestId>) {
        const Test = app.mongoose.Test;
        if (!Test) { return 'Test is not defined'; }
        const test = await Test.findByIdAndDelete(request.params.id);
        return test;
    })

    app.get('/test/name/:name', async function (request: FastifyRequest<{ Params: { name: string } }>) {
        const Test = app.mongoose.Test;
        if (!Test) { return 'Test is not defined'; }
        const test = await Test.find({ name: request.params.name });
        return test;
    })

    app.get('/test/age/:age', async function (request: FastifyRequest<{ Params: { age: number } }>) {
        const Test = app.mongoose.Test;
        if (!Test) { return 'Test is not defined'; }
        const test = await Test.find({ age: request.params.age });
        return test;
    })
};
export default page;

```

But remember, for automatic REST Api there is [fastify-mongoose-api](https://github.com/jeka-kiselyov/fastify-mongoose-api)

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
