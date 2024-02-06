import mongoosePlugin from '../dist/index.js';
import { checkEnv, createApp, initServer } from './helpers.js';
import t from 'tap';

t.test('Uri not defined', async t => {
    const app = initServer(t);
    try {
        await app.register(mongoosePlugin);
    } catch (err) {
        t.pass('Throws error when uri not defined');
    }
});

t.test('plugin is loaded and fastify.mongoose available', async t => {
    if (!checkEnv(t)) return;
    const app = await createApp(t);
    t.ok(app.mongoose);
});

t.end();
