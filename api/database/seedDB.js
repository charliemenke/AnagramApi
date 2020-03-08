const fs = require('fs');
const readline = require('readline');
const stream = require('stream');
const redisClient = require('redis').createClient({host : 'localhost', port : 6379});;

// On initial server start, create array:dictionaryWords of words from dictionary.txt in mem for fast access
const instream = fs.createReadStream('dictionary.txt');
const outstream = new stream();
const rl = readline.createInterface(instream,outstream);

dictionaryWords = [];
rl.on('line', function(line) {
    dictionaryWords.push(line);
})
.on('close', function() {
    dictionaryWords.forEach(word => {
        let key = word.toLowerCase().split('').sort().join();
        redisClient.sadd(key, word, function(err, reply) {
            if(err) {
                console.log(err);
            }
        });
    });
    redisClient.select(1, function() {
        let totalWordsLength = 0;
        let count = 0
        dictionaryWords.forEach(word => {
            totalWordsLength += word.length;
            count++;
            redisClient.rpush("wordLength", word.length, function(err, reply) {
                if(err) {
                    console.log(err);
                }
            });
            redisClient.set("wordsLength", totalWordsLength, function(err, reply) {
                if(err) {
                    console.log(err);
                }
            });
            redisClient.set("count", count, function(err, reply) {
                if(err) {
                    console.log(err);
                }
            });
        });
        console.log("Finished seeding DB");
        process.exit();
    });
    
});

