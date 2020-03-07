redisClient = require('redis').createClient({host : 'localhost', port : 6379});

// Helper functions for anagramController

/*
    Helper func to update DB1 holding word count, wordLength, and wordsLength
    if increment = true it means we are adding a word to the DB
    if increment = false it means we are removing a word to the DB
*/
exports.updateDB1 = function(word, increment = true) {
    if(increment) {
        redisClient.select(1, function(err) {
            if(err) {
                console.log(err)
            } else {
                redisClient.incr('count', function (err) {
                    if(err) {
                        console.log(err)
                    }
                });
                redisClient.rpush("wordLength", word.length, function(err) {
                    if(err) {
                        console.log(err);
                    }
                });
                redisClient.incrby("wordsLength", word.length, function(err, value) {
                    if(err) {
                        console.log(err);
                    }
                });
            }
        });
    } else {
        redisClient.select(1, function(err) {
            if(err) {
                console.log(err)
            } else {
                redisClient.decr('count', function (err) {
                    if(err) {
                        console.log(err)
                    }
                });
                redisClient.lrem("wordLength", -1, word.length, function(err, reply) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log(reply);
                    }
                })
                redisClient.incrby("wordsLength", (word.length * -1), function(err, value) {
                    if(err) {
                        console.log(err);
                    }
                });
            }
        });
    }

}