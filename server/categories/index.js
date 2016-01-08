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
    var category = model(db, "Category");
    category.setUniqueKey("name");

    var createCat = function (name, parent, next) {
        if (!name) {
            res.send({
                "error": true,
                "errmsg": "Missing Category name",
                "node": false
            })
        } else {

            category.save({name: name, slug: urlify(name)}, function (err, node) {
                var sb = {}
                sb.error = (err) ? true : false;
                sb.errmsg = err;
                sb.node = node;
                if (parent) {
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

    var deleteCat = function (id, next) {
        sb = {}
        if (!id) {
            sb.error = true;
            sb.errmsg = "Please specify an ID to delete";
            sb.node = ""
            next(sb);
        } else {
            db.delete(id, 1, function (err, node) {
                var sb = {}
                sb.error = (err) ? true : false;
                sb.errmsg = err;
                sb.node = node;
                next(sb);
            })
        }
    }

    app.get("/category/add", function (req, res) {
        createCat(req.query.name, req.query.parent, function (sb) {
            res.send(JSON.stringify(sb))
        })
    })

    app.get("/category/bulk", function(req, res) {
        var names = ["Australian kelpie","Kelpie","Australian shepherd","Australische herder","Bearded collie","Beauceron","Belgische herder","Groenendaeler","Laekense herder","Mechelse herder","Tervuerense herder","Ciobănesc Românesc Carpatin","Roemeens Karpatische herdershond","Bergamasco","Berghond van de Maremmen en Abruzzen","Maremma","Bordercollie","Briard","Ca de bestiar","Majorcaanse herder","Cão da Serra de Aires","Portugese herder","Duitse herder","Gos d'Atura","Catalaanse herder","Hollandse herder","Hrvatski ovčar","Kroatische herder","Komondor","Kuvasz","Mudi","Old English Sheepdog","Picardische herdershond","Polski owczarek nizinny","Poolse laaglandherder","Polski owczarek podhalanski","Tatrahond","Puli","Pumi","Pyrenese herdershond","Saarlooswolfhond","Schapendoes","Schipperke","Schotse herdershond","Schotse herdershond","Shetlandsheepdog","Sheltie","Slovenský čuvač","Cuvac","Tsjecho-Slowaakse wolfhond","Welsh Corgi Cardigan","Welsh Corgi Pembroke","Zwitserse Witte Herder","Zuid-Russische owcharka","Australian cattle dog","Australische veedrijvershond","Bouvier des Ardennes","Bouvier des Flandres","Vlaamse koehond","Affenpinscher","Cão de fila de São Miguel","Dobermann","Duitse Pinscher","Dwergpinscher","Dwergschnauzer","Hollandse smoushond","Smous","Middenslagschnauzer","Oostenrijkse pinscher","Riesenschnauzer","Zwarte Russische terriër","Bordeaux Dog","Broholmer","Bulldog","Engelse Buldog","Bullmastiff","Cão Fila de São Miguel","Saint Miguel Cattle Dog","Ca de bou","Majorca Mastiff","Cane Corso","Dogo Argentino","Argentijnse Dog","Dogo Canario","Canarische Dog","Boxer","Duitse Dog","Bulldog","Engelse Buldog","Fila Brasileiro","Mastiff","Mastino Napoletano","Rottweiler","Shar-Pei","Tosa","Aidi","Atlashond","Anatolische herder","Kangal","Cão da Serra da Estrêla","Estrela berghond","Cão de Castro Laboreiro","Centraal-Aziatische owcharka","Hovawart","Karakachan","Kaukasische owcharka","Kraški ovčar","Karstherder","Landseer E.C.T.","Landseer","Leonberger","Mastín del Pirineo","Pyrenese mastiff","Mastín español","Spaanse mastiff","Newfoundlander","Pyrenese berghond","Rafeiro do Alentejo","Alentejo mastiff","Šarplaninac","Sint-Bernard","Tibetaanse mastiff","Do-khyi","Appenzeller sennenhond","Berner sennenhond","Entlebucher sennenhond","Grote Zwitserse sennenhond","Airedaleterriër","Bedlingtonterriër","Borderterriër","Braziliaanse terriër","Duitse jachtterriër","Foxterriër","Foxterriër","Glen of Imaalterriër","Ierse softcoated wheaten terriër","Ierse terriër","Kerry Blue-terriër","Lakelandterriër","Manchesterterriër","Parson Russell-terriër","Welsh terriër","Australische terriër","Cairnterriër","Ceskyterriër","Dandie Dinmont-terriër","Jack Russell terriër","Japanse terriër","Norfolk terriër","Norwich terriër","Schotse terriër","Sealyham terriër","Skye terriër","West Highland white terriër","Amerikaanse Staffordshireterriër","Bulterriër","Staffordshire-bulterriër","Australische silkyterriër","Silkyterriër","Engelse toyterriër","Yorkshireterriër","Dashond","Teckel","Alaska-malamute","Groenlandse hond","Samojeed","Siberische husky","Finse spits","Jämthund","Zweedse elandhond","Karelische berenhond","Noorse elandhond","Noorse elandhond","Noorse lundehond","Norrbottenspets","Oostsiberische laika","Russisch-Europese laika","Westsiberische laika","Lapinporokoira","Lappen-herdershond","Noorse buhund","Suomenlapinkoira","Finse lappenhond","Västgötaspets","Vallhund","IJslandse hond","Zweedse lappenhond","Keeshond","Volpino italiano","Akita","Amerikaanse akita","Great Japanese dog","Chowchow","Eurasiër","Hokkaido","Japanse spits","Kai","Kishu","Koreaanse jindohond","Shiba","Shikoku","Basenji","Kanaänhond","Mexicaanse naakthond","Peruaanse naakthond","Pharaohond","Cirneco dell'Etna","Podenco canario","Podenco ibicenco","Podengo português","Thai ridgebackdog","Thaise pronkrug","American foxhound","Billy","Black and tan coonhound","Bloedhond","Sint-Hubertushond","Foxhound","Français blanc et noir","Français blanc et orange","Français tricolore","Grand Anglo-Français blanc et noir","Grand Anglo-Français blanc et orange","Grand Anglo-Français tricolore","Grand bleu de Gascogne","Grand Gascon Saintongeois","Grand griffon vendéen","Otterhound","Poitevin","Anglo-Français de petit vénerie","Ariégeois","Beagle-harrier","Bosanski ostrodlaki gonic barak","Brandlbracke","Oostenrijkse gladharige brak","Briquet griffon vendéen","Chien d'Artois","Crnogorski planinski gonic","Dunker","Erdélyi kopó","Finse brak","Griffon bleu de Gascogne","Griffon fauve de Bretagne","Griffon nivernais","Haldenstøvare","Hamiltonstövare","Harrier","Hellinikos ichnilatis","Hygenhund","Istarski kratkodlaki gonic","Istarski ostrodlaki gonic","Ogar polski","Petit bleu de Gascogne","Petit Gascon saintongeois","Porcelaine","Posavski gonic","Sabueso español","Schillerstövare","korthaar","ruwhaar","Slovensky kopov","Smalandstövare","Srpski gonic","Srpski trobojni gonic","Steirische rauhhaarbracke","Tiroler brak","Zwitserse lopende hond","Berner Laufhund","Jura Laufhund","Luzerner Laufhund","Schwyzer Laufhund","Basset artésien normand","Basset bleu de Gascogne","Basset fauve de Bretagne","Basset hound","Beagle","Drever","Duitse brak","Grand Basset griffon vendéen","Kleine Zwitserse lopende hond","Berner Niederlaufhund","Jura Niederlaufhund","Luzerner Niederlaufhund","Schwyzer Niederlaufhund","Petit Basset griffon vendéen","Westfaalse dasbrak","Alpenländische Dachsbracke","Beierse bergzweethond","Hannoveraanse zweethond","Dalmatische hond","Dalmatiër","Rhodesian Ridgeback","Pronkrug","Bracco italiano","Braque d'Auvergne","Braque de l'Ariège","Braque du Bourbonnais","Braque Français type Gascogne","Braque Français type Pyrénées","Braque Saint-Germain","Duitse staande hond (draadhaar)","Duitse staande hond (korthaar)","Duitse staande hond (stekelhaar)","Gammel Dansk Hønsehund","Perdigueiro de Burgos","Staande hond van Burgos","Perdigueiro português","Portugese pointer","Poedelpointer","Vizsla","Vizsla","Weimarse staande hond","Drentsche patrijshond","Duitse staande hond (langhaar)","Epagneul bleu de Picardie","Epagneul breton","Epagneul de Pont-Audemer","Epagneul français","Epagneul picard","Grote Münsterländer","Kleine Münsterländer","Heidewachtel","Stabij","Cesky Fousek","Griffon Korthals","Slovensky Hrubosrsty stavac","Slowaakse staande hond","Spinone italiano","Engelse setter","Gordon setter","Ierse rode setter","Ierse rood-witte setter","Pointer","Chesapeake Bayretriever","Curly coated retriever","Flatcoated retriever","Golden retriever","Labrador retriever","Nova Scotia duck tolling retriever","Toller","Amerikaanse cockerspaniël","Clumberspaniël","Duitse wachtelhond","Kwartelhond","Engelse cockerspaniël","Engelse springerspaniël","Fieldspaniël","Kooikerhondje","Sussex-spaniël","Welsh springerspaniël","Amerikaanse waterspaniël","Barbet","Ierse waterspaniël","Lagotto romagnolo","Perro de agua español","Spaanse waterhond","Portugese waterhond","Wetterhoun","Bichon frisé","Bolognezer","Coton de Tuléar","Havanezer","Leeuwhondje","Maltezer","Franse poedel","Griffon belge","Griffon bruxellois","Petit Brabançon","Chinese gekuifde naakthond","Lhasa Apso","Shih Tzu","Tibetaanse spaniël","Tibetaanse terriër","Chihuahua","Cavalier King Charles-spaniël","King Charles-spaniël","Japanse spaniël","Chin","Pekingees","Epagneul nain continental","Kromfohrländer","Bostonterriër","Franse buldog","Mopshond","Afghaanse windhond","Barzoi","Saluki","Deerhound","Ierse wolfshond","Azawakh","Chart polski","Galgo español","Greyhound","Italiaans windhondje","Hongaarse windhond","Magyar agár","Sloughi","Whippet","Australian Stumpy Tail Cattle Dog","Ciobanesc Romanesc De Bucovina","Ciobanesc Romanesc Carpatin","Ciobanesc Romanesc Mioritic","Cimarrón Uruguayo","Dansk-Svensk Gardshund","Gończy Polski","Russkiy Toy","Russische Toy Terriër","Tai Bangkaew Dog","Taiwan Dog","Tornjak","Amerikaanse buldog","Amerikaanse naakthond","Amerikaanse pitbullterriër","Amerikaanse toyterriër","Barbado da Terceira","Boerboel","Boerenfox","Boheemse herder","Labradoodle","Markiesje","Oud Duitse Herder","Patterdaleterriër","Prazsky krysarik","Puggle","Schafpudel","Silken Windhound"]
        async.each(names, function(name, cb) {
            createCat(name, 19, function(sb) {
                cb(null, sb);
            })
        }, function(err, sb) {
            res.send(sb);
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

    app.get("/category/delete/:id", function (req, res) {
        deleteCat(req.params.id, function (sb) {
            res.send(JSON.stringify(sb));
        })
    })

    app.get("/category/:id", function (req, res) {
        if (!req.params.id) {
            // Send a list of all categories

        }
    })

    app.get("/category", function (req, res) {
        category.findAll(function (err, all) {
            sb = {}
            sb.error = (err) ? true : false;
            sb.errmsg = err;
            sb.nodes = all;
            res.send(JSON.stringify(sb));
        })
    })

}