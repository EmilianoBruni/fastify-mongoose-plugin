import { checkEnv, initServer, registerPlugin } from './helpers.js';
import t from 'tap';

import accountsModel from './models/accounts.js';
import postsModel from './models/posts.js';

checkEnv(t);

t.test('Check base plugin', async t => {
    const pluginOptions = {
        settings: {
            config: {
                autoIndex: true
            }
        },
        models: [accountsModel, postsModel],
        useNameAndAlias: true
    };

    const fastify = initServer(t, pluginOptions);

    fastify.post('/', async ({ body }) => {
        const { username, password, email } = body;
        const createdAtUTC = new Date();
        const account = new fastify.mongoose.Account({
            username,
            password,
            email,
            createdAtUTC
        });
        await account.save();
        return await fastify.mongoose.Account.findOne({ email });
    });

    fastify.patch('/', async ({ body }) => {
        const { title, content, author } = body;
        const post = new fastify.mongoose.Post({
            title,
            content,
            author
        });
        await post.save();
        const foundPost = await fastify.mongoose.Post.findById(post._id);
        return foundPost.toObject({ virtuals: true });
    });

    registerPlugin(fastify, pluginOptions);
    await fastify.ready();

    t.test('Check models decoration', async t => {
        t.ok(fastify.mongoose.instance);
        t.ok(fastify.mongoose.Account);
    });

    let author_id;

    t.test('Create new record', async t => {
        const testEmail = `${(+new Date()).toString(36).slice(-5)}@example.com`;

        let { statusCode, payload } = await fastify.inject({
            method: 'POST',
            url: '/',
            payload: {
                username: 'test',
                password: 'pass',
                email: testEmail
            }
        });

        const { username, password, email, _id } = JSON.parse(payload);
        t.equal(statusCode, 200);
        t.equal(username, 'test');
        t.equal(password, undefined);
        t.equal(email, testEmail);
        author_id = _id;
    });

    t.test('Create new post with virtual', t => {
        fastify
            .inject({
                method: 'PATCH',
                url: '/',
                payload: {
                    author: author_id,
                    title: 'Hello World',
                    content: 'foo bar'
                }
            })
            .then(({ statusCode, payload }) => {
                t.equal(statusCode, 200);
                const { title, fullTitle, content, author } =
                    JSON.parse(payload);
                t.equal(fullTitle, 'Title: Hello World');
                t.equal(title, 'Hello World');
                t.equal(content, 'foo bar');
                t.equal(author, author_id);
                t.end();
            });
    });
});
