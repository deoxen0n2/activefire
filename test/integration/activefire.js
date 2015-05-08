var expect = require('chai').expect;
var _ = require('underscore');
var Q = require('q');

var ActiveFire = require('../../activefire');

ActiveFire.configure({
  url: 'https://[app].firebaseio.com/'
});

var Book = new ActiveFire.Base('/books');

var bookData1 = {
  title: 'The C Programming Language',
  isbn: '978-0131103627'
};

var bookData2 = {
  title: 'The Art of Computer Programming, Vol. 1',
  isbn: '978-0201896831'
};

var bookData3 = {
  title: 'The Pragmatic Programmer: From Journeyman to Master',
  isbn: '078-5342616224'
};

var bookData4 = {
  title: 'Patterns of Enterprise Application Architecture',
  isbn: '007-6092019909 '
};

var Author = new ActiveFire.Base('/authors', {
  hasMany: { books: { model: Book, key: 'author_id' } }
});

var authorData1 = {
  fullName: 'Dennis M. Ritchie'
};

var _throw = function(err) {
  throw err;
};

describe('ActiveFire', function() {
  this.timeout(10000);

  before(function(done) {
    Book.firebaseRef.authWithPassword({
      email: 'deoxen0n2@gmail.com',
      password: 'secretpassword'
    }, done);
  });

  beforeEach(function(done) {
    Q.all([ Author.clear(), Book.clear() ])
      .then(function() {
        done();
      }, _throw);
  });

  describe('Creating an instance of associations', function() {
    it('should save the instance with the references to the associated instances', function(done) {
      Author.create(authorData1)
        .then(function(author) {
          author.books.create(bookData1)
            .then(function(book) {
              expect(author.books_ids[book.id]).to.be.true;
              expect(book.author_id).to.be.equal(author.id);
            })
            .done(done);
        }, _throw);
    });
  });
});
