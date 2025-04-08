const { mergeConfig } = require('axios');
const path=require('path');
const baseConfig=require("./base.config");

module.exports=mergeConfig(baseConfig,{
    target:"node",
    mode:"production",
    entry:{
        app:path.resolve(__dirname,"../src/server/app.ts"),
    },
    output:{
        path:path.resolve(__dirname,"../dist/server"),
    },
    optimization:{
        minimize: true,
    },
});