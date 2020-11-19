(
    function () {
        "use strict";
        //setup
        let express = require('express');
        let app = express();
        var bodyParser = require('body-parser')

        // create application/json parser
        var jsonParser = bodyParser.json()

        // create application/x-www-form-urlencoded parser
        var urlencodedParser = bodyParser.urlencoded({ extended: false })

        // POST /login gets urlencoded bodies
        app.post('/uploadRequest', urlencodedParser, async function (req, res) {
            console.log('req recieved')

            let data = '';
            req.on('data', chunk => {
              data += chunk;
            })
            req.on('end', async function (req, resOld) {
                let body = JSON.parse(data);
                console.log('post json parse body=', body)
                // at this point, `body` has the entire request body stored in it as a string
                let imgInputPath=body.imgInputPath;
                let audioInputpath=body.audioInputpath;
                let videoOutputPath=body.videoOutputPath;
                console.log(`starting render for \n img=${imgInputPath} \n audioInputpath=${audioInputpath} \n videoOutputPath=${videoOutputPath}`);
                let renderVidResp = await generateVid(audioInputpath, imgInputPath, videoOutputPath, null)
                console.log('render finished')
                res.status(200);
                res.send('DONE');
            })
       
              //req.end();
/*
let body = [];
            req.on('data', (chunk) => {
                body.push(chunk);
            }).on('end', async function (req, res) {
                console.log('startging redner')
                body = Buffer.concat(body).toString();
                console.log('pre json parse body=', body)
                body = JSON.parse(body)
                console.log('post json parse body=', body)
                // at this point, `body` has the entire request body stored in it as a string
                let imgInputPath=body.imgInputPath;
                let audioInputpath=body.audioInputpath || null;
                let videoOutputPath=body.videoOutputPath || null;
                console.log(`starting render for \n img=${imgInputPath} \n audioInputpath=${audioInputpath} \n videoOutputPath=${videoOutputPath}`);
                let renderVidResp = generateVid(audioInputpath, imgInputPath, videoOutputPath, null)
                
                
            });
            res.status(200).send('render started');
            */
       })


        let server = app.listen(1953, function () {
            console.log('Express server listening on port ' + server.address().port);
        });
        module.exports = app;
    }()
);