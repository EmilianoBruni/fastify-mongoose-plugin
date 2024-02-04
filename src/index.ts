import type { TFMPModels, TFMPOptions } from './types.js';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import fp from 'fastify-plugin';
import mongoose from 'mongoose';

let decorator: { instance: typeof mongoose };

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
    decorator = { instance: mongoose };

    if (modelDirPath) models = [...loadModelsFromPath(modelDirPath), ...models];
};

const loadModelsFromPath = (modelDirPath: string): TFMPModels => {
    const modelsFromPath: TFMPModels = [];
    const schemaFiles = walkDir(modelDirPath);
    schemaFiles.forEach(file => {
        const model = require(file);
        modelsFromPath.push(model);
    });
    return modelsFromPath;
};

const walkDir = (modelDirPath: string, fileList: string[] = []): string[] => {
    const dir = readdirSync(modelDirPath);
    dir.forEach(file => {
        const pathFile = join(modelDirPath, file);
        const stat = statSync(pathFile);
        if (stat.isDirectory()) fileList = walkDir(pathFile, fileList);
        else fileList.push(pathFile);
    });
    return fileList;
};

const plugin = fp(initPlugin, {
    fastify: '>=2.0.0',
    name: 'fastify-mongoose-plugin'
});

export default plugin;
