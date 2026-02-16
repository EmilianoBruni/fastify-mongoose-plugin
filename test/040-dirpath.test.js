import { checkEnv, createApp } from './helpers.js';
import { dirname, resolve } from 'path';
import t from 'tap';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const modelDirPath = resolve(__dirname, 'models');

checkEnv(t);

t.test('Load models from modelDirPath with default filter', async t => {
    const app = await createApp(t, {
        modelDirPath
    });

    t.ok(app.mongoose.instance);
    t.ok(app.mongoose.Account);
    t.ok(app.mongoose.Post);
    t.notOk(app.mongoose.Author);
});

t.test('Load models from modelDirPath with custom filter', async t => {
    const app = await createApp(t, {
        modelDirPath,
        modelPathFilter: (_dir, file) => file.endsWith('.customfilter')
    });

    t.ok(app.mongoose.instance);
    t.ok(app.mongoose.Author);
    t.notOk(app.mongoose.Account);
    t.notOk(app.mongoose.Post);
});
