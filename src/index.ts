import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { TFMPOptions } from "./types.js";


const initPlugin: FastifyPluginAsync<TFMPOptions> = async (fastify: FastifyInstance, options: TFMPOptions) => {
};


const plugin = fp(initPlugin, {
    fastify: '>=2.0.0',
    name: 'fastify-mongoose-plugin'
});

export default plugin;