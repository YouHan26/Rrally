module.exports = {
    // entry: './entry.js',
    entry: {
        story: './config/story.js',
        utils: './config/utils.js',
        backlog: './config/backlog.js',
        storyList: './config/storyList.js',
        manage: './config/manage.js'
    },
    output: {
        path: __dirname + '/bundle',
        filename: "[name].bundle.js",
        chunkFilename: "[id].bundle.js"
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    module: {
        loaders: [
            {test: /\.js|jsx$/, loaders: ['jsx-loader']}
        ]
    }
};