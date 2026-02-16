import type {
    TFMPPlugin,
    TFMPModel,
    TFMPModels,
    TFMPOptions,
    TFMPSchema
} from './types.js';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { readFileSync, readdirSync, statSync } from 'fs';
import { extname, join } from 'path';
import { pathToFileURL } from 'url';
import fp from 'fastify-plugin';
import mongoose from 'mongoose';

let decoratorPlugin: TFMPPlugin;

const initPlugin: FastifyPluginAsync<TFMPOptions<unknown>> = async (
    fastify: FastifyInstance,
    {
        uri,
        settings,
        models = [],
        useNameAndAlias = false,
        modelDirPath = undefined,
        modelPathFilter = (_dir, file) =>
            file.slice(-3) === '.js' || file.slice(-3) === '.ts'
    }
) => {
    await mongoose.connect(uri, settings);
    decoratorPlugin = { instance: mongoose } as unknown as TFMPPlugin;

    if (modelDirPath)
        models = [
            ...(await loadModelsFromPath(modelDirPath, modelPathFilter)),
            ...models
        ];

    if (models.length !== 0) {
        models.forEach(model => {
            fixReferences(decoratorPlugin, model.schema);

            const schema = new mongoose.Schema(model.schema, model.options);

            if (model.class) schema.loadClass(model.class);

            if (useNameAndAlias) {
                /* istanbul ignore next */
                if (model.alias === undefined)
                    throw new Error(`No alias defined for ${model.name}`);

                (decoratorPlugin as unknown as Record<string, TFMPPlugin>)[
                    model.alias
                ] = mongoose.model(
                    model.alias,
                    schema,
                    model.name
                ) as unknown as TFMPPlugin;
            } else {
                (decoratorPlugin as unknown as Record<string, TFMPPlugin>)[
                    model.alias
                        ? model.alias
                        : model.name.charAt(0).toUpperCase() +
                          model.name.slice(1)
                ] = mongoose.model(model.name, schema) as unknown as TFMPPlugin;
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
    modelDirPath: string,
    filterFn: (dir: string, file: string) => boolean
): Promise<TFMPModels<unknown>> => {
    const modelsFromPath: TFMPModels<unknown> = [];
    const schemaFiles = walkDir(modelDirPath, filterFn);
    for await (const file of schemaFiles) {
        try {
            const model = (await loadModelFromFile(file)).default;
            modelsFromPath.push(model);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            const error = new Error(
                `Error loading schema ${file}: ${errorMessage}`
            );
            (error as Error & { cause?: unknown }).cause = e;
            throw error;
        }
    }
    return modelsFromPath;
};

const loadModelFromFile = async (file: string) => {
    const extension = extname(file).toLowerCase();
    if (
        extension === '.js' ||
        extension === '.mjs' ||
        extension === '.cjs' ||
        extension === '.ts'
    ) {
        return import(pathToFileURL(file).href);
    }

    const fileContent = readFileSync(file, 'utf8');
    const sourceUrl = `\n//# sourceURL=${pathToFileURL(file).href}`;
    const moduleSource = `${fileContent}${sourceUrl}`;
    const moduleDataUrl = `data:text/javascript;base64,${Buffer.from(moduleSource).toString('base64')}`;
    return import(moduleDataUrl);
};

const walkDir = (
    modelDirPath: string,
    filterFn: (dir: string, file: string) => boolean,
    fileList: string[] = []
): string[] => {
    const dir = readdirSync(modelDirPath);
    dir.forEach(file => {
        const pathFile = join(modelDirPath, file);
        const stat = statSync(pathFile);
        if (stat.isDirectory())
            fileList = walkDir(pathFile, filterFn, fileList);
        else if (filterFn(modelDirPath, file)) fileList.push(pathFile);
    });
    return fileList;
};

const fixReferences = (decorator: TFMPPlugin, schema: TFMPSchema<unknown>) => {
    Object.keys(schema).forEach(key => {
        const member = schema[key];
        if (member.type === 'ObjectId') {
            fixReferencesObjectId(decorator, member);
        } else if (schema[key].length !== undefined) {
            schema[key].forEach((member: TFMPSchema<unknown>) =>
                fixReferencesObjectId(decorator, member)
            );
        }
    });
};

const fixReferencesObjectId = (
    decorator: TFMPPlugin,
    member: TFMPSchema<unknown>
) => {
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

            member.validate = async (v: unknown): Promise<boolean> => {
                try {
                    if (decorator[ref] !== undefined) {
                        const result = await decorator[ref]!.findById(v);
                        if (!result) {
                            throw new Error(
                                `Post with ID ${v} does not exist in database!`
                            );
                        }
                    }
                } catch {
                    /* istanbul ignore next */
                    throw new Error(
                        `Post with ID ${v} does not exist in database!`
                    );
                }
                return true;
            };
        }
    }
};

const plugin = fp(initPlugin, {
    fastify: '>=5.0.0',
    name: 'fastify-mongoose-plugin'
});

export default plugin;

const decorator = () => decoratorPlugin;

export { decorator };

export type { TFMPPlugin, TFMPModel, TFMPModels, TFMPOptions, TFMPSchema };
