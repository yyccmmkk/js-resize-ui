let path = require('path');//test release

let http = require('http');

let express = require('express');

let tempSrc=[];



let app = express();

app.use('/src',express.static(path.resolve(__dirname,'./src/')));



// ************************************
// This is the real meat of the example
// ************************************
(function () {

    // Step 1: Create & configure a webpack compiler
    let webpack = require('webpack');
    let webpackConfig = require(process.env.WEBPACK_CONFIG ? process.env.WEBPACK_CONFIG : './webpack.config');
    let compiler = webpack(webpackConfig);
    //let router=express.Router();

    // Step 2: Attach the dev middleware to the compiler & the server
    app.use(require("webpack-dev-middleware")(compiler, {
        noInfo: true, publicPath: webpackConfig.output.publicPath
    }));

    // Step 3: Attach the hot middleware to the compiler & the server
    app.use(require("webpack-hot-middleware")(compiler, {
        log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000, reload: true
    }));
})();

// Do anything you like with the rest of your express application.

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/demo.html');
});



/*------------------测试接口------------------*/

if (require.main === module) {
    let server = http.createServer(app);
    server.listen(process.env.PORT || 3030, function () {
        console.log("Listening on %j", server.address());
    });
}