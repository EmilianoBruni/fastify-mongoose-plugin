import type {
    TFMPPlugin,
    TFMPModel,
    TFMPModels,
    TFMPOptions,
    TFMPSchema
} from './types.js';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import fp from 'fastify-plugin';
import mongoose from 'mongoose';

let decoratorPlugin: TFMPPlugin;

const initPlugin: FastifyPluginAsync<TFMPOptions> = async (
    fastify: FastifyInstance,
    {
        uri,
        settings,
        models = [],
        useNameAndAlias = false,
        modelDirPath = undefined
    }: TFMPOptions
) => {
    await mongoose.connect(uri, settings);
    decoratorPlugin = { instance: mongoose } as unknown as TFMPPlugin;

    if (modelDirPath)
        models = [...(await loadModelsFromPath(modelDirPath)), ...models];

    if (models.length !== 0) {
        models.forEach(model => {
            fixReferences(decoratorPlugin, model.schema);

            const schema = new mongoose.Schema(model.schema, model.options);

            if (model.class) schema.loadClass(model.class);

            if (model.virtualize) model.virtualize(schema);

            if (useNameAndAlias) {
                /* istanbul ignore next */
                if (model.alias === undefined)
                    throw new Error(`No alias defined for ${model.name}`);

                decoratorPlugin[model.alias] = mongoose.model(
                    model.alias,
                    schema,
                    model.name
                );
            } else {
                decoratorPlugin[
                    model.alias
                        ? model.alias
                        : model.name.charAt(0).toUpperCase() +
                          model.name.slice(1)
                ] = mongoose.model(model.name, schema);
            }
        });
    }

    // Close connection when app is closing
    fastify.addHook('onClose', async app => {
        app.mongoose.instance.connection.on('close', function () {});
        app.mongoose.instance.connection.close();
    });

    fastify.decorate('mongoose', decoratorPlugin);
};

const loadModelsFromPath = async (
    modelDirPath: string
): Promise<TFMPModels> => {
    const modelsFromPath: TFMPModels = [];
    const schemaFiles = walkDir(modelDirPath);
    for await (const file of schemaFiles) {
        try {
            const model = (await import(file)).default;
            modelsFromPath.push(model);
        } catch (e: any) {
            throw new Error(`Error loading schema ${file}: ${e.message}`);
        }
    }
    return modelsFromPath;
};

const walkDir = (modelDirPath: string, fileList: string[] = []): string[] => {
    const dir = readdirSync(modelDirPath);
    dir.forEach(file => {
        const pathFile = join(modelDirPath, file);
        const stat = statSync(pathFile);
        if (stat.isDirectory()) fileList = walkDir(pathFile, fileList);
        else
            if (file.slice(-3) === '.js') 
                fileList.push(pathFile);
    });
    return fileList;
};

const fixReferences = (decorator: TFMPPlugin, schema: TFMPSchema) => {
    Object.keys(schema).forEach(key => {
        const member = schema[key];
        if (member.type === 'ObjectId') {
            fixReferencesObjectId(decorator, member);
        } else if (schema[key].length !== undefined) {
            schema[key].forEach((member: any) =>
                fixReferencesObjectId(decorator, member)
            );
        }
    });
};

const fixReferencesObjectId = (decorator: TFMPPlugin, member: TFMPSchema) => {
    if (member.type === 'ObjectId') {
        member.type = mongoose.Schema.Types.ObjectId;

        if (member.validateExistance) {
            delete member.validateExistance;

            if (!member.ref) {
                throw new Error(
                    'You must provide a reference to validate existance!'
                );
            }

            const ref = member.ref.toString();

            member.validate = {
                validator: async (v: any): Promise<boolean | undefined> => {
                    try {
                        decorator[ref] !== undefined &&
                            (await decorator[ref]!.findById(v));
                    } catch (e) {
                        /* istanbul ignore next */
                        throw new Error(
                            `Post with ID ${v} does not exist in database!`
                        );
                    }
                    return true;
                }
            };
        }
    }
};

const plugin = fp(initPlugin, {
    fastify: '>=2.0.0',
    name: 'fastify-mongoose-plugin'
});

export default plugin;

const decorator = () => decoratorPlugin;

export { decorator };

export type { TFMPPlugin, TFMPModel, TFMPModels, TFMPOptions, TFMPSchema };
