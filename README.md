# ActiveFire
Rails's ActiveRecord-inspired model for Firebase.

## Usage
```bash
$ npm install activefire
```

And in your js file:
```js
var ActiveFire = require('./activefire');

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

  // Declare your model.
  var Book = new ActiveFire.Base('/books');

  // Initiate it.
  var sevenHabitsOfTeens = Book.new({
    title: '7 habits of highly effective teens',
    author: 'Sean Covey'
  });

  // Save.
  sevenHabitsOfTeens.save()
    .then(function() {
      console.log('Your book is cool!');
    }, function(err) {
      console.log('Ooch.. your book is still cool, but something went wrong:', err);
    });
}
```

## Tests
```bash
$ npm test
```

# License
Copyright 2015 Saran Siriphantnon MIT License.
