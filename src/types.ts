import type { FastifyPluginOptions } from 'fastify';
import type { MongooseOptions, SchemaTypeOptions } from 'mongoose';

export type TFMPModel<T = any> = SchemaTypeOptions<T>;
export type TFMPModels<T = any> = Array<TFMPModel<T>>;

export type TFMPOptions<T = any> = FastifyPluginOptions & {
    uri: string;
    settings?: MongooseOptions;
    models?: TFMPModels<T>;
    useNameAndAlias?: boolean;
    modelDirPath?: string;
};
