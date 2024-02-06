export class PostClass {
    get fullTitle() {
        return `Title: ${this.title}`;
    }
}

export default {
    name: 'posts',
    alias: 'Post',
    schema: {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        author: {
            type: 'ObjectId',
            ref: 'Account',
            validateExistance: true
        }
    },
    class: PostClass
};
