import { checkEnv, createApp } from './helpers.js';
import t from 'tap';
import { decorator } from '../dist/index.js';

import accountsModel from './models/accounts.js';
import postsModel from './models/posts.js';

checkEnv(t);

t.test('Check decorator', async t => {
    const pluginOptions = {
        models: [accountsModel, postsModel]
    };

    await createApp(t, pluginOptions);

    t.ok(decorator().instance);
    t.ok(decorator().Account);
});
