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
elastic.type = "breeds";

module.exports = function(app) {
    var Breed = model(db, 'Breed');
    Breed.schema = {
        name: {type: String, required: true},
        slug: {type: String, required: true},
        description: {type: String},
        adaptability: {type: Number},
        apartment: {type: Number},
        novice_owner: {type: Number},
        sensitivity: {type: Number},
        alone: {type: Number},
        friendliness: {type: Number},
        affectionate: {type: Number},
        kid_friendly: {type: Number},
        dog_friendly: {type: Number},
        stranger_friendly: {type: Number},
        health_grooming: {type: Number},
        shedding: {type: Number},
        drooling: {type: Number},
        ease_grooming: {type: Number},
        general_health: {type: Number},
        weight_gain_risk: {type: Number},
        size: {type: Number},
        trainability: {type: Number},
        easy_to_train: {type: Number},
        intelligence: {type: Number},
        mouthiness: {type: Number},
        prey_drive: {type: Number},
        bark: {type: Number},
        wanderlust: {type: Number},
        exercise: {type: Number},
        playfull: {type: Number},
        height: {type: Number},
        weight: {type: Number}
    }
    db.index.createIfNone("Breed", "slug", function() {})
    db.index.createIfNone("Breed", "name", function() {})
    Breed.setUniqueKey("slug");

    var createBreed = function(breed, next) {
        sb = {}
        if (!breed) {
            sb.error = true;
            sb.errmsg = "Please provide breed information";
            next(sb);
        } else {
            breed.description = JSON.stringify (breed.description)
            breed.slug = urlify(breed.name).toLowerCase();
            Breed.save(breed, function(err, node) {
                if (err) {
                    sb.error = true
                    sb.errmsg = err
                    next(sb)
                } else {
                    db.relate(breed.category, "has_page", node.id, function(err, relationship) {
                        if (err) {
                            sb.error = true;
                            sb.errmsg = err
                        }
                        sb.relationship = relationship;
                        es.create({
                            index: elastic.index,
                            type: elastic.type,
                            id: node.id,
                            body: breed
                        }, function(err, response) {
                            sb.error = (sb.error || err) ? true: false;
                            sb.errmsg = err;
                            sb.response = response
                            next(sb)
                        })
                    })
                }
            })
        }
    }
    var deleteBreed = function(id, next) {

    }

    var findBreed = function(params, next) {}

    var getBreed = function(slug, next) {
        es.seach({
            index: "honden",
            type: "breeds",
            q:"slug:"+slug
        }, function(err, result) {
            sb = {}
            sb.error = (err) ? true: false;
            sb.errmsg = err;
            sb.response = result;
        })
    }

    app.post("/breeds/add", function(req, res) {
        createBreed(JSON.parse(req.body.breed), function(sb) {
            res.send(sb);
        })
    })

}