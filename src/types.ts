import type { FastifyPluginOptions } from 'fastify';
import type {
    MongooseOptions,
    SchemaOptions as MongooseSchemaOptions,
    SchemaDefinition,
    Model
} from 'mongoose';
import type mongoose from 'mongoose';

declare module 'fastify' {
    export interface FastifyInstance {
        mongoose: TFMPPlugin;
    }
}

export type TFMPPlugin = {
    instance: typeof mongoose;
    models: Record<string, <T = unknown>() => Model<T>>;
};

export type TFMPSchema = SchemaDefinition;

export type TFMPModel = {
    name: string;
    alias?: string;
    schema: SchemaDefinition;
    options?: MongooseSchemaOptions;
    class?: () => void;
};

export type TFMPModels = Array<TFMPModel>;

export type TFMPOptions = FastifyPluginOptions & {
    uri: string;
    settings?: MongooseOptions;
    models?: TFMPModels;
    useNameAndAlias?: boolean;
    modelDirPath?: string;
    modelPathFilter?: (dir: string, file: string) => boolean;
};
