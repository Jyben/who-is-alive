const express = require('express'),
    app = express(),
    port = process.env.PORT || 8080,
    bodyParser = require('body-parser'),
    rateLimit = require('express-rate-limit');
let aliveList = [];
const limiter = rateLimit({
    windowMs: 86400000,
    max: 1
});
const File = require('./file');
const file = new File();
const aliveListPersisted = file.read();

if (aliveListPersisted !== undefined) {
    aliveList = aliveListPersisted;
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api/imalive', limiter);

// app.route('/whoisalive').get((req, res) => {
//     if (req.body.application === undefined) {
//         res.sendStatus(400);
//         return;
//     }

//     const alive = aliveList.find(x => x.application === req.body.application);
//     if (alive === undefined) {
//         res.sendStatus(400);
//         return;
//     }

//     let counters = alive.counters;
//     if (req.body.date !== undefined) {
//         counters = alive.counters.find(x => x.date === req.body.date);
//     }
//     if (counters === undefined) {
//         res.sendStatus(400);
//         return;
//     }

//     res.json(counters);
// });

app.route('/api/imalive').post((req, res) => {
    console.log(req.headers);
    if (req.headers.application === undefined || req.headers.version === undefined) {
        res.sendStatus(400);
        return;
    }

    const app = req.headers.application;
    const version = req.headers.version;

    const alive = aliveList.find(x => x.application === app);
    if (alive === undefined) {
        aliveList.push({
            application: app,
            counters: [{
                date: new Date().toLocaleDateString(),
                count: 1,
                version: version
            }]
        });
    } else {
        const counterDate = alive.counters.find(x => x.date === new Date().toLocaleDateString());
        const counterVersion = alive.counters.find(x => x.date === new Date().toLocaleDateString() && x.version === version);

        if (counterDate === undefined) {
            alive.counters.push({
                date: new Date().toLocaleDateString(),
                count: 1,
                version: version
            });
        }
        else if (counterVersion === undefined) {
            alive.counters.push({
                date: new Date().toLocaleDateString(),
                count: 1,
                version: version
            });
        }
        else {
            counterVersion.count++;
        }
    }

    file.save(aliveList);

    res.sendStatus(200);
});

app.listen(port);