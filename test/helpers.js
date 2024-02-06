import mongoosePlugin from '../dist/index.js';
import fastify from 'fastify';

export const createApp = async (t, pluginConfig = {}) => {
    const app = initServer(t);
    registerPlugin(app, pluginConfig);
    await app.ready();
    return app;
};

export const initServer = t => {
    const app = fastify();
    t.after(app.close.bind(app));
    return app;
};

export const registerPlugin = (app, pluginConfig) => {
    if (!pluginConfig.uri) {
        pluginConfig.uri = process.env.MONGO_URI;
    }
    app.register(mongoosePlugin, pluginConfig);
};

export const checkEnv = t => {
    if (!process.env.MONGO_URI) {
        t.skip('MONGO_URI not found in environment');
        t.end();
        return false;
    }
    return true;
};
