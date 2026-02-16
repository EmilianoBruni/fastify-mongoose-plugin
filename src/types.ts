import type { FastifyPluginOptions } from 'fastify';
import type {
    MongooseOptions,
    SchemaTypeOptions,
    SchemaOptions as MongooseSchemaOptions
} from 'mongoose';
import type mongoose from 'mongoose';

declare module 'fastify' {
    export interface FastifyInstance {
        mongoose: TFMPPlugin;
    }
}

export type TFMPPlugin = Record<string, mongoose.Model<object, object>> & {
    instance: typeof mongoose;
};

export type TFMPSchema<T = unknown> = SchemaTypeOptions<T> & {
    validateExistance?: boolean;
};

export type TFMPModel<T> = {
    name: string;
    alias?: string;
    schema: TFMPSchema<T>;
    options?: MongooseSchemaOptions<T>;
    class?: () => void;
};

// export type TFMPModel<T = any> = SchemaTypeOptions<T>;
export type TFMPModels<T = unknown> = Array<TFMPModel<T>>;

export type TFMPOptions<T = unknown> = FastifyPluginOptions & {
    uri: string;
    settings?: MongooseOptions;
    models?: TFMPModels<T>;
    useNameAndAlias?: boolean;
    modelDirPath?: string;
    modelPathFilter?: (dir: string, file: string) => boolean;
};
