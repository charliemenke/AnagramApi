# Anagram API

This API reads from english dictionary and supports multiple endpoints that returns anagrams

## Installation

```bash
git clone https://github.com/charliemenke/AnagramApi.git
```

Using the npm package manager

```bash
cd AnagramApi
npm install
```

## Usage

Before running the API, you should seed the database from the dictionary.txt file

```bash
npm run seed
```
Now you are ready to start the server

```bash
npm start
```

## Endpoints

There are multiple endpoints supported. Listed below are their paths and relative parameters

### Add Words To Database
Add words to data corpus ```POST /words.json```
Input
| Name        | Type           | Description  |
| ------------- |:-------------:| -----:|
| words      | json object | A json object containing words to add to corpus |

Example Request
```curl -i -X POST -d '{ "words": ["read", "dear", "dare"] }' -H Content-Type:application/json http://localhost:3000/words.json```
Response ```HTTP/1.1 201 Created [*words added]```

### Check If Words Are Anagrams
Check if words posted in request are anagrams of each other ```POST /words.json/anagrams```
Input
| Name        | Type           | Description  |
| ------------- |:-------------:| -----:|
| words      | json object | A json object containing words to check |

Example Request
```curl -i -X POST -d '{ "words": ["read", "dear", "dare"] }' -H Content-Type:application/json http://localhost:3000/words.json/anagrams```

Response ```HTTP/1.1 200 {areAnagrams: true|false}```

### Delete Word
Delete single word from corpus ```DELETE /words/word.json```

Example Request
```curl -i -X DELETE http://localhost:3000/words/read.json```

Response ```HTTP/1.1 204 No Content```

### Delete Word and Anagrams
Delete single word and its anagrams from corpus ```DELETE /words/word.json/anagrams```

Example Request
```curl -i -X DELETE http://localhost:3000/words/read.json/anagrams```

Response ```HTTP/1.1 204 No Content```

### Delete Words
Delete all word from corpus ```DELETE /words.json```

Example Request
```curl -i -X DELETE http://localhost:3000/words.json```

Response ```HTTP/1.1 204 No Content```

### Get Anagrams
Get all anagrams of word posted ```POST /anagrams/:word.json```

Input
| Name        | Type           | Description  |
| ------------- |:-------------:| -----:|
| word      | word string | word to get anagrams of |

Parameters
| Name        | Type           | Description  |
| ------------- |:-------------:| -----:|
| limit      | integer | limit number of anagrams to return |
| proper      | boolean | default:true => include proper nouns, false => remove proper nouns from list |

Example Request
```curl -i http://localhost:3000/anagrams/read.json```

Response 
```
HTTP/1.1 200 OK
...
{
  anagrams: [
    "dear",
    "dare"
  ]
}
```

### Get Corpus Stats
Returns min, max, median, avg, and count of words in corpus ```GET /words.json```

Example Request
```curl -i -X GET http://localhost:3000/words.json```

Response
```
HTTP/1.1 200 OK
...
{
  wordCount: 10,
  minLength: 1,
  maxLength: 22,
  medianLength: 13,
  averageLength: 9.2
}
```

## Testing

Included in this API is a folder for running basic tests on the API. To run said tests you must have ruby installed
```bash
ruby /test/anagram_test.rb
```

## API Design

This API was designed using Nodejs with Express and a Redis database.

Node and Express was chosen because I had experience designing simple APIs with it before so it allowed me to implement a working concept quickly.

Originally I was using MongoDB as a database for the same reasons above, but I switched to Redis even though not having any previous experience with the technology because of its very fast backend. Redis is a super fast in memory key:value store which made it an obvious choice for this project in which I needed to seed a DB with a large text file. Redis also supports sets, which was the perfect choice to store anagrams. Since I was using sets to store anagrams/words the time complexity to add/delete/get-anagrams was only O(1) for each single opperation.

### Edge Cases

There were a few edge cases I ran into when initially designing this API.

One major one was, because of the fact that I was using sets to store anagrams, when it came to building the endpoint that returns the corpus stats, I ran into the issue of having to pull every key and then iterating over each set to come up with the numbers to return. This was a messy and incomplete solution. So to bypass it, I created another redis DB to store the count, length of every word, and total word length of all words. This slowed down the initial seed time of the DB slightly but resulted in much faster performance when it came to getting corpus stats later down the road.

Another edge case pertaining to the second redis DB storing corpus stats was in the event when multiple words were added to the DB and then a single word was deleted. Originally I was assuming that, when a word was deleted I could just .pop() the array holding individual word lengths, but this was not the case in the event that I was deleting a word that was not the most recently added word. The messy solution was to grab the entire array holding word lengths and filter out 1 value equaling the deleted word length. This solution could be improved in the future as I think a better designed database holding corpus stats could be made so that would not have to be the case.
