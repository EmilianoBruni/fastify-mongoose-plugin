import fastify from 'fastify';
import plugin from '../dist/index.js';
import t from 'tap';

t.test('load', async t => {
    t.plan(1);
    const app = fastify();
    app.register(plugin);
    app.ready(err => {
        t.error(err);
    });
});
