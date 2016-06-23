# ActiveFire
Rails's ActiveRecord-inspired model for Firebase. Still in (very slow) development.

## Status

I've rewritten this project in TypeScript and it already worked with Firebase 3. Now I have 1 production server running with it but I need time to collect some more thoughts on this. So...

> Don't Use This Library.

In the meantime, if you want to collaborate on this idea please let me know. I'm always available at deoxen0n2@gmail.com. Thanks you.

## Usage
```bash
$ npm install activefire
```

And in your js file:
```js
var ActiveFire = require('activefire');

// Setup config once.
ActiveFire.configure({
  url: 'https://[app].firebaseio.com/'
});

// Authenticate.
ActiveFire.authWithPassword({
  email: 'deoxen0n2@gmail.com',
  password: 'secretpassword'
}, _doTheRest);

// Do the rest.
function _doTheRest(err, userData) {
  if (err) throw err;

  // Declare your models.
  // For simplicity, assume book has only one author.
  var Book = new ActiveFire.Base('/books');
  var Author = new ActiveFire.Base('/authors', {
    hasMany: { books: { model: Book, key: 'author_id' } }
  });

  // Create them.
  Author.create({
    fullName: 'Sean Covey'
  })
  .then(function(sean) {
    return sean.books.create({
      title: 'The 7 Habits of Highly Effective Teens',
      isbn: '978-1476764665'
    });
  }, function(err) {
    console.log('Ooch.. something went wrong:', err);
  })
  .then(function() {
    console.log('Your book is cool!');
  }, function(err) {
    console.log('Ooch.. your book is still cool, but something went wrong:', err);
  });
}
```

## Development

Right now I'm working on improving and finishing `v1` of this library. The rewrite version leverages the multi-path update feature so it can guarantee atomic operations for some tasks and it does not use external Promise library anymore (since Firebase already support this interface on v2.4+ SDK). It also benefits from strong type system from TypeScript. The goals of this project will be:

1. Thin wrapper around Firebase JavaScript SDK
2. Provide common and useful patterns

## Tests
```bash
$ npm test
```

# License
Copyright 2015 Saran Siriphantnon MIT License.
