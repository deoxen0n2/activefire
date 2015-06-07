var expect = require('chai').expect;
var _ = require('underscore');
var Q = require('q');

var Base = require('../../lib/base');

var config = {
  url: 'https://[app].firebaseio.com/'
};

var Author = new Base('/authors', { config: config });

var authorData1 = {
  fullName: 'Dennis M. Ritchie'
};

var Book = new Base('/books', { config: config });

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

var _createTestSet = function() {
  return Q.all([
    Book.create(bookData1),
    Book.create(bookData2),
    Book.create(bookData3),
    Book.create(bookData4),
  ]);
};

var _throw = function(err) {
  throw err;
};

describe('Base', function() {
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

  describe('.all()', function() {
    it('should gives collection snapshot', function(done) {
      _createTestSet()
        .then(function() {
          return Book.all();
        })
        .then(function(books) {
          expect(books).to.be.an('Array');
          expect(books[0].title).to.equal(bookData1.title);
          expect(books[0]._internals).to.exist;
          expect(books).to.have.length(4);
        }, _throw)
        .done(done);
    });
  });

  describe('.find()', function() {
    it('should finds the right persisted instance', function(done) {
      _createTestSet()
        .then(function(books) {
          Book.find(books[1].id)
            .then(function(book2) {
              expect(book2.title).to.be.equal(bookData2.title);
              expect(book2._internals.self).to.exist;
            }, _throw)
            .done(done);
        });
    });
  });

  describe('.findBy()', function() {
    it('should finds the right persisted instance', function(done) {
      _createTestSet()
        .then(function(books) {
          Book.findBy('isbn', books[1].isbn)
            .then(function(book2) {
              console.log('in findBy():', book2);
              expect(book2.title).to.be.equal(bookData2.title);
              expect(book2._internals.self).to.exist;
            }, _throw)
            .done(done);
        });
    });
  });

  describe('.new()', function() {
  });

  describe('.create()', function() {
    it('should creates a new persisted instance', function(done) {
      Book.create(bookData1)
        .then(function(book) {
          return Book.all()
                   .then(function(books) {
                     expect(books[0].title).to.be.equal(book.title);
                     expect(book.id).to.exist;
                   }, _throw)
                   .done(done);
        }, _throw);
    });
  });

  describe('#update()', function() {
    it('should add new attributes to the persisted instance', function(done) {
      Book.create(bookData1)
        .then(function(book) {
          return book.update({ rating: 5.0 });
        })
        .then(function(book) {
          expect(book.rating).to.be.equal(5.0);
          expect(book.updated_at).to.not.be.equal(book.created_at);
        }, _throw)
        .done(done);
    });
  });

  describe('#destroy()', function() {
  });

  describe('#addRef()', function() {
    it('should add reference id of another persisted instance to the instance', function(done) {
      Author.create(authorData1)
        .then(function(author) {
          Book.create(bookData1)
            .then(function(book) {
              author.addRef('books', book)
                .then(function() {
                  expect(author.books_ids[book.id]).to.be.true;
                })
                .done(done);
            });
        });
    });

    it('should add reference id to the instance', function(done) {
      var id = 2161;

      Author.create(authorData1)
        .then(function(author) {
          author.addRef('books', id)
            .then(function() {
              expect(author.books_ids[id]).to.be.true;
            })
            .done(done);
        });
    });
  });
});

