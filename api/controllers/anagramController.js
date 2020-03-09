const anagram = require('./helpers/_anagramHelper');
const { promisify } = require("util");
//const getAsync = promisify(client.get).bind(client);
let redisClient0 = require('redis').createClient({host : 'localhost', port : 6379, db: 0});
let redisClient1 = require('redis').createClient({host : 'localhost', port : 6379, db: 1});

/*
    POST /words.json controller
    Takes in json array of words to add to mongoDB
*/

exports.add_words = function(req, res) {
    
    let words = req.body.words;

    // For each word in body req, first check if word already exists in DB & if not, add it
    words.forEach(word => {
        let key = word.toLowerCase().split('').sort().join();
        redisClient0.sadd(key,word, function(err, reply) {
            if(err) {
                console.log(err);
                res.status(400).send("Error adding word to DB");
            }
            if(reply) {
                console.log(word + " added to DB0");
                anagram.updateDB1(word);
            } else {
                console.log(word + " already exists");
            }
        });
    });

    res.status(201).send(words);
}

/*
    GET /words.json controller
    returns json obj contailing min, max, median, and average length of words Word Collection
*/
exports.list_all_words = function(req, res) {

    // Find all words in Words Collection
    let min = max = median = avg = count = 0;
    redisClient1.lrange("wordLength", 0, -1, function(err, set) {
        set = set.sort(function(a, b){return a - b});
        min = set[0];
        median = set[Math.floor(set.length/2)];
        max = set.pop();
        
        redisClient1.get("count", function(err, value) {
            count = value;
            redisClient1.get("wordsLength", function(err, value) {
                avg = parseInt(value)/parseInt(count);
                res.json({
                    wordCount: count,
                    minLength: min,
                    maxLength: max,
                    medianLength: median,
                    averageLength: avg
                });
            })
        });
    });

}

/*
    DELETE /words.json controller
    Simply removes all words existing in Words Collection
*/
exports.delete_words = function(req, res) {
    
    // Flush redis DB of all key:value pairs
    redisClient0.flushall(function(err, succeed) {
        if(err){
            console.log(err);
            res.status(400).send("Unable to flush DB");
        } else {
            console.log("Flushed DBs");
        }
    }); 

    res.status(204).send("Flushed DB");
    
}

/* 
    DELETE /words/:word.json controller
    Removes single word specified in req from DB
*/
exports.delete_word = function(req, res) {
    
    let word = req.params.word;
    let key = word.toLowerCase().split('').sort().join();

    redisClient0.exists(key, function(error, exists) {
        if(error) {
            console.log(word + " does not exist in DB, cannot delete");
            res.status(400).send("Unable to delete " + word + ", does not exist");
        } else {
            redisClient0.srem(key, word, function(err, removed) {
                if(err) {
                    res.status(400).send("Failed removing " + word + ", from DB");
                } else {
                    if(removed) {
                        anagram.updateDB1(word, false)
                        console.log("Removed " + word + " from DB");
                        res.status(204).json({"deleted": word});
                    } else {
                        console.log("word not in DB");
                        res.status(400).send("Failed removing " + word + ", from DB");
                    }
                }
            });
        }
    });

}

/*
    DELETE /words/:word/anagrams
    Removes word and its anagrams from DB
*/
exports.delete_word_and_anagrams = function(req, res) {

    let word = req.params.word;
    let key = word.toLowerCase().split('').sort().join();
    redisClient0.smembers(key, function(error, set) {
        if(set.length) {

            set.forEach(word => {
                anagram.updateDB1(word, false);
            });

            redisClient0.del(key, function(error, reply) {
                console.log("Flushed " + word + " and its anagrams");
            });

        }
    });
    res.status(204).json();
}

/*
    POST /words.json/anagrams
    Returns true or false if words passed all are anagrams of each other
*/
exports.are_anagrams = function(req, res) {

    let words = req.body.words;
    let response = true;
    let key = words[0].toLowerCase().split('').sort().join();
    words.forEach(word => {
        if(key != word.toLowerCase().split('').sort().join()) {
            response = false;
        }
    });

    res.status(200).json({areAnagrams: response});

}

/*
    GET /anagrams/:word.json/:limit? controller
    Returns anagrams for word specified in req along with optional limit number of anagrams to return param
*/
exports.get_anagrams = async function(req, res) {
    
    // Create initial obj to return
    let anagramsObj = {
        anagrams: []
    };

    // Initilise word, and key(word sorted)
    let word = req.params.word;
    let key = word.toLowerCase().split('').sort().join();

    // First check if key exits: (false) => return empty array. (true) => return full anagram array
    redisClient0.exists(key, function(err, exists) {
        if(err) {
            console.log("Failed querying DB");
            res.status(400).send("Failed querying DB");
        } else {
            if(exists) {
                redisClient0.smembers(key, function(err, set) {
                    if(err) {
                        console.log("Failed querying DB");
                        res.status(400).send("Failed querying DB");
                    } else {
                        set = set.filter(el => el !== word);

                        // If limit exits, splice set to limit
                        if(req.query.limit) {
                            set = set.slice(0, req.query.limit);
                        }

                        // If include Proper Nouns = false, remove them
                        if(req.query.proper == "false") {
                            set.forEach(word => {
                                // Funny conditional to check if first char is upper case, neccesary for edge casese like numbers/punctuation
                                if(!(word.charAt(0) == word.charAt(0).toLowerCase() && word.charAt(0) != word.charAt(0).toUpperCase())) {
                                    set.shift();
                                }
                            })
                        }

                        anagramsObj.anagrams = set
                        res.status(200).json(anagramsObj);
                    }
                })
            } else {
                res.status(200).json(anagramsObj);
            }
        }
    });

}