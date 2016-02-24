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
    async = require("async"),
    geocoder = require("geocoder")

var elastic = {}
elastic.index = "honden";
elastic.type = "asielen";

module.exports = function (app) {
    var Asiel = model(db, "Asiel");
    Asiel.schema = {
        name: {type: String, required: true},
        slug: {type: String, required: true},
        street: {type: String, required: true},
        number: {type: String, required: true},
        postalcode: {type: String, required: true},
        city: {type: String, required: true},
        province: {type: String},
        country: {type: String},
        location: {type: String},
        x: {type: Number},
        y: {type: Number},
        phone: {type: String},
        email: {type: String},
        website: {type: String},
        description: {type: String},
        logo: {type: String}
    }

    db.index.createIfNone("Asiel", "slug", function () {
    })
    db.index.createIfNone("Asiel", "name", function () {
    })
    Asiel.setUniqueKey("slug");

    var testGeo = function (location, next) {
        geocoder.geocode(location, next);
    }

    app.get("/location/test", function (req, res) {
        testGeo(req.query.a, function (err, data) {
            res.send(data);
        })
    })

    var createBreed = function (asiel, next) {
        var sb = {}
        if (!asiel || !asiel.name) {
            sb.error = true;
            sb.errmsg = "Please provide shelter information";
            next(sb);
        } else {
            asiel.slug = urlify(asiel.name);
            var l = []
            l.push(asiel.street)
            l.push(asiel.number)
            l.push(asiel.postalcode)
            l.push(asiel.city)
            l.push(asiel.country)
            asiel.location = l.join(" ");

            // Geocoding
            geocoder.geocode(asiel.location, function (err, d) {
                asiel.location = d.results[0].formatted_address;
                asiel.x = d.results[0].geometry.location.lat;
                asiel.y = d.results[0].geometry.location.lng;
                sb.error = false;
                sb.response = asiel;
                Asiel.save(asiel, function(err, node) {
                    if (err) {
                        sb.error = true
                        sb.errmsg = err
                        next(sb)
                    } else {
                        asiel.loc = {
                            lat: asiel.x,
                            lon: asiel.y
                        }
                        es.create({
                            index: elastic.index,
                            type: elastic.type,
                            id: node.id,
                            body: asiel
                        }, function(err, response) {
                            sb.error = (sb.error || err) ? true: false;
                            sb.errmsg = err;
                            sb.response = response
                            next(sb)
                        })
                    }
                })
            })
        }
    }

    app.post("/asielen", function (req, res) {
        createBreed(req.body, function (sb) {
            res.send(sb);
        })
    })
}