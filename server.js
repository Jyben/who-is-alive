const express = require('express'),
    app = express(),
    port = process.env.PORT || 80,
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
app.use('/imalive', limiter);

app.route('/whoisalive').get((req, res) => {
    if (req.body.application === undefined) {
        res.sendStatus(400);
        return;
    }

    const alive = aliveList.find(x => x.application === req.body.application);
    if (alive === undefined) {
        res.sendStatus(400);
        return;
    }

    let counters = alive.counters;
    if (req.body.date !== undefined) {
        counters = alive.counters.find(x => x.date === req.body.date);
    }
    if (counters === undefined) {
        res.sendStatus(400);
        return;
    }

    res.json(counters);
});

app.route('/imalive').post((req, res) => {
    if (req.body.application === undefined) {
        res.sendStatus(400);
        return;
    }

    const alive = aliveList.find(x => x.application === req.body.application);
    if (alive === undefined) {
        aliveList.push({
            application: req.body.application,
            counters: [{
                date: new Date().toLocaleDateString(),
                count: 1
            }]
        });
    } else {
        const counter = alive.counters.find(x => x.date === new Date().toLocaleDateString());
        if (counter === undefined) {
            alive.counters.push({
                date: new Date().toLocaleDateString(),
                count: 1
            });
        }
        else {
            counter.count++;
        }
    }

    file.save(aliveList);

    res.sendStatus(200);
});

app.listen(port);