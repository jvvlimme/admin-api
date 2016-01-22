var db = require("seraph")({server: process.env.NEO, user: "", pass: ""}),
    model = require("seraph-model"),
    elasticsearch = require("elasticsearch"),
    es = new elasticsearch.Client({
        host: process.env.ES
    })
urlify = require('urlify').create({
    addEToUmlauts: true,
    szToSs: true,
    spaces: "-",
    nonPrintable: "-",
    trim: true
}),
    async = require("async");

var elastic = {}
elastic.index = "honden";
elastic.type = "media";

module.exports = function (app) {

    var Media = model(db, 'Media');
    Media.schema = {
        name: {type: String, required: true},
        url: {type: String, required: true},
        dt: {type: Date, required: true},
        source: {type: String},
        creator: {type: String},
        license: {type: String},
        height: {type: Number},
        width: {type: Number},
        size: {type: Number},
        mimetype: {type: String}
    }
    db.index.createIfNone("Media", "url", function() {})
    Media.setUniqueKey("url");

    var addMedia = function(media, next) {

        // Save in Neo4j
        Media.save(media, function(err, o) {
            sb = {}
            sb.error = (err) ? true: false;
            sb.errmsg = err;
            console.log(err)
            console.log(o);
            sb.response = o;
            media.id = o.id;
            if (!err) {
                // Save in ES
                es.create({
                    index: elastic.index,
                    type: elastic.type,
                    id: o.id,
                    body: media
                }, function(err, response) {
                    sb.error = (err) ? true: false;
                    sb.errmsg = err;
                    next(sb);
                })
            } else {
                next(sb);
            }
        })
    }

    var deleteMedia = function(id, next) {
        sb = {}
        if (id) {
            db.delete(id, 1, function(err, node) {
                sb.error = (err) ? true: false;
                sb.errmsg = err;
                sb.response = node;
                if (!err) {
                    es.delete({index: elastic.index, type: elastic.type, id: id}, function(err, response) {
                        sb.error = (err) ? true: false;
                        sb.errmsg = err;
                        sb.response = response;
                        next(sb)
                    })
                } else {
                    next(sb);
                }

            })
        } else {
            sb.error = true;
            sb.errmsg = "Please specify an ID to delete";
            sb.response = ""
            next(sb);
        }
    }

    var getMedia = function(id, next) {
        if (id) {
            es.get({
                index: elastic.index,
                type: elastic.type,
                id: id
            }, function(err, response) {
                sb = {}
                sb.error = (err) ? true: false;
                sb.errmsg = err;
                sb.response = response._source || response;
                next(sb);
            })
        } else {
            es.search({
                index: elastic.index,
                type: elastic.type
            }, function(err, response) {
                sb = {}
                console.log(err)
                console.log(response)
                sb.error = (err) ? true: false;
                sb.errmsg = err;
                async.map(response.hits.hits, function(resp, cb) {
                    cb(resp._source)
                }, function(x) {
                    sb.response = x;
                    next(sb);
                })
            })
        }

    }

    var searchMedia = function(q, next) {
        es.search({
            index: elastic.index,
            type: elastic.type,
            q: q
        }, function(err, response) {
            sb = {}
            sb.error = (err) ? true: false;
            sb.errmsg = err;
            async.map(response.hits.hits, function(resp, cb) {
                cb(resp._source)
            }, function(x) {
                sb.response = x;
                next(sb);
            })


        })
    }

    app.post("/media/add", function(req, res) {
        addMedia(JSON.parse(req.body.media), function(sb) {
            res.send(sb);
        })
    })

    app.get("/media/delete/:id", function(req, res) {
        deleteMedia(req.params.id, function(sb) {
            res.send(sb);
        })
    })

    app.get("/media/search/", function(req, res) {
        searchMedia(req.query.q, function(sb) {
            res.send(sb);
        })
    })

    app.get("/media/get/:id", function(req, res) {
        getMedia(req.params.id, function(sb) {res.send(sb)});
    })

    app.get("/media/get", function(req, res) {
        getMedia(null, function(sb) {res.send(sb)})
    })

}