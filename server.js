const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    bodyParser = require('body-parser'),
    rateLimit = require('express-rate-limit');
let aliveList = [];
let ad = {};
const limiter = rateLimit({
    windowMs: 86400000,
    max: 1
});
const File = require('./file');
const file = new File();
const aliveListPersisted = file.readAlive();
const adPersisted = file.readAd();

if (aliveListPersisted !== undefined) {
    aliveList = aliveListPersisted;
}

if (adPersisted !== undefined) {
    ad = adPersisted;
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api/imalive', limiter);
app.use('/api/ad', limiter);
app.disable('x-powered-by');

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

app.set('trust proxy', 2)

app.route('/').get((req, res) => {
    res.send("");
    return;
});

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

    file.saveAlive(aliveList);

    res.sendStatus(200);
});

app.route('/api/ad').post((req, res) => {
    if (ad.count === undefined) {
        ad.count = 1;
    } else {
        ad.count++;
    }

    file.saveAd(ad);

    res.sendStatus(200);
});

app.listen(port);