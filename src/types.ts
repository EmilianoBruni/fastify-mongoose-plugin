import type { FastifyPluginOptions } from 'fastify';
import type { MongooseOptions, SchemaTypeOptions } from 'mongoose';
import type mongoose from 'mongoose';

declare module 'fastify' {
    export interface FastifyInstance {
        mongoose: TFMPPlugin;
    }
}

export type TFMPPlugin = {
    [key: string]: typeof mongoose.Model;
} & {
    instance: typeof mongoose;
};

export type TFMPSchema<T = any> = SchemaTypeOptions<T> & {
    validateExistance?: boolean;
};

export type TFMPModel<T = any> = {
    name: string;
    alias?: string;
    schema: TFMPSchema<T>;
    options?: any;
    class?: any;
    virtualize?: (schema: any) => void;
};

// export type TFMPModel<T = any> = SchemaTypeOptions<T>;
export type TFMPModels<T = any> = Array<TFMPModel<T>>;

export type TFMPOptions<T = any> = FastifyPluginOptions & {
    uri: string;
    settings?: MongooseOptions;
    models?: TFMPModels<T>;
    useNameAndAlias?: boolean;
    modelDirPath?: string;
};
