/**
 * Created by gimtaeu on 2016. 10. 19..
 */

const
    MongoClient = require('mongodb').MongoClient,
    {mongodb}  = require('./config'),
    assert = require('assert'),
    mongoUrl = `mongodb://${mongodb.host}:${mongodb.port}/${mongodb.database}`,
    Promise = require('bluebird');

let timer;

let db;

let log = Promise.coroutine(function*() {
    try {
        db = yield MongoClient.connect(mongoUrl);

        let page = db.collection('page');
        let stat = db.collection('stat');

        let allPagesNumber = yield page.count();
        let formulaPagesNumber = yield page.count({formulasNumber: {$gt: 0}});
        let formulasNumber = yield Promise.resolve({
            then: function(resolve, reject) {
                page.aggregate({$group: { _id: null, total: {$sum: "$formulasNumber"}}}, function(err, [{total}]) {
                    if(err) reject(err);
                    else {
                        resolve(total);
                    }
                });
            }
        });

        let adminDB = db.admin();

        let {opcounters} = yield adminDB.serverStatus();

        let date = new Date();

        yield stat.insertOne({
            allPagesNumber, formulaPagesNumber,  formulasNumber, createdAt: date, opcounters
        });

        //db.close();
    }
    catch(e) {
        console.error(e);
    }
});

function start(interval=10000) {
    if(timer) return;

    log();

    timer = setInterval(log, interval)
}

function stop() {
    if(timer) {
        clearInterval(timer);
    }

    if(db) {
        db.close();
    }
}

module.exports = {
    start,
    stop
};