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
Get all anagrams of word posted ```POST /words.json/anagrams```

Input
| Name        | Type           | Description  |
| ------------- |:-------------:| -----:|
| word      | word string | word to get anagrams of |

Parameters
| Name        | Type           | Description  |
| ------------- |:-------------:| -----:|
| limit      | integer | limit number of anagrams to return |
| proper      | boolean | default:true => include proper nouns\ false => remove proper nouns from list |

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

Originally I was using MongoDB as a database for the same reasons above, but I switched to Redis even though not having any previous experience with the technology because of its very fast backend and especially for its support of sets which I utilized for anagram checking