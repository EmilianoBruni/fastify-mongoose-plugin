export default {
    name: 'accounts',
    alias: 'Account',
    schema: {
        username: {
            type: String
        },
        password: {
            type: String,
            select: false,
            required: true
        },
        email: {
            type: String,
            unique: true,
            required: true,
            validate: {
                validator: v => {
                    // Super simple email regex: https://stackoverflow.com/a/4964763/7028187
                    return /^.+@.{2,}\..{2,}$/.test(v);
                },
                message: props => `${props.value} is not a valid email!`
            }
        },
        posts: [
            {
                type: 'ObjectId',
                ref: 'Post',
                validateExistance: true
            }
        ],
        createdAtUTC: {
            type: Date,
            required: true
        }
    }
};
