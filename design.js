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
