/*
    Routes for anagramAPI
    is requred in server.js
*/

module.exports = function(app) {
    
    // Grabbing controllers for routes
    const wordList = require('../controllers/anagramController');

    app.route('/words.json')
        .get(wordList.list_all_words)
        .post(wordList.add_words)
        .delete(wordList.delete_words);

    app.route('/words.json/anagrams')
        .post(wordList.are_anagrams)

    app.route('/words/:word.json')
        .delete(wordList.delete_word);

    app.route('/words/:word.json/anagrams')
        .delete(wordList.delete_word_and_anagrams);

    app.route('/anagrams/:word.json/:limit?')
        .get(wordList.get_anagrams);
     
}