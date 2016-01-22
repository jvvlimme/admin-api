var db = require("seraph")({server: process.env.NEO, user: "", pass: ""}),
    model = require("seraph-model"),
    urlify = require('urlify').create({
        addEToUmlauts: true,
        szToSs: true,
        spaces: "-",
        nonPrintable: "-",
        trim: true
    }),
    async = require("async");


module.exports = function (app) {

    // Create Model
    var category = model(db, "Category");

    // Create Index
    db.index.createIfNone("Category", "id", function(err, index) { console.log (err, index)});
    db.index.createIfNone("Category", "name", function(err, index) { console.log (err, index)});
    db.index.createIfNone("Category", "slug", function(err, index) { console.log (err, index)});

    // Set Constraints
    category.setUniqueKey("name");

    // Functions
    var createCat = function (name, parent, next) {
        if (!name) {
            res.send({
                "error": true,
                "errmsg": "Missing Category name",
                "response": false
            })
        } else {
            console.log(name);
            console.log(urlify(name).toLowerCase());
            category.save({name: name, slug: urlify(name)}, function (err, node) {
                var sb = {}
                sb.error = (err) ? true : false;
                sb.errmsg = err;
                sb.response = node;
                if (!err && parent != null && typeof node.id != "undefined") {
                    db.relate(parent, "has_child", node.id, function (err, relationship) {
                        if (err) {
                            e = []
                            e.push(sb.err);
                            e.push(err);
                            sb.error = true;
                            sb.errmsg = e;
                        }
                        sb.relationship = relationship;
                        next(sb);
                    });
                } else {
                    next(sb);
                }
            })
        }
    }
    var getCat = function(id, next) {
        sb = {}
        if (id) {
            category.read(id, function(err, node) {
                sb.error = (err) ? true: false;
                sb.errmsg = err;
                sb.response = node;
                next(sb);
            })
        }
        else {
            // List All Categories
            category.findAll(function (err, all) {
                sb.error = (err) ? true : false;
                sb.errmsg = err;
                sb.response = all;
                next(sb);
            })
        }
    }
    var deleteCat = function (id, next) {
        sb = {}
        if (!id) {
            sb.error = true;
            sb.errmsg = "Please specify an ID to delete";
            sb.response = ""
            next(sb);
        } else {
            db.delete(id, 1, function (err, node) {
                var sb = {}
                sb.error = (err) ? true : false;
                sb.errmsg = err;
                sb.response = node;
                next(sb);
            })
        }
    }
    var getChildren = function(id, next) {
        var sb = {}
        if (id) {
            db.relationships(id, "out", 'has_child', function(err, relationships) {
                if (err) {
                    sb.error = true;
                    sb.errmsg = err;
                    next(sb);
                } else {
                    async.map(relationships, function(r, cb) {
                        getCat(r.end, function(sb) {
                            console.log(sb);
                            if (sb.error) cb(sb.errmsg);
                            cb(null, sb.nodes);
                        })
                    }, function(err, nodes){
                        sb.error = false;
                        sb.errmsg= err;
                        sb.response = nodes;
                        next(sb);
                    })

                }
            })
        } else {
            sb.error = true;
            sb.errmsg = "Please supply an ID";
            next(sb);
        }
    }

    // Routes

    app.get("/category/add", function (req, res) {
        createCat(req.query.name, req.query.parent, function (sb) {
            res.send(JSON.stringify(sb))
        })
    })
    app.post("/category/add", function(req, res) {
        console.log(req.body.names)
        async.each(req.body.names, function(name, cb) {
            createCat(name, req.query.parent, function(sb) {
                cb(null, sb);
            })
        }, function(err, sb) {
            res.send(sb);
        })
    })
    app.get("/category/children/:id", function(req, res) {
        getChildren(req.params.id, function(sb) {
            res.send(sb);
        })
    })
    app.get("/category/delete/:id", function (req, res) {
        deleteCat(req.params.id, function (sb) {
            res.send(JSON.stringify(sb));
        })
    })
    app.get("/category/:id", function (req, res) {
        console.log(req.params.id)
        getCat(req.params.id, function(sb) {
            res.send(JSON.stringify(sb));
        })
    })
    app.get("/category", function (req, res) {
        getCat(null, function(sb) {
            res.send(JSON.stringify(sb));
        })
    })

}