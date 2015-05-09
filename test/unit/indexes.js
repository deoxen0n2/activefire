var expect = require('chai').expect;
var Q = require('q');

var Base = require('../../lib/base');
var Indexes = require('../../lib/indexes');

var config = {
  url: 'https://[app].firebaseio.com/'
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
    _createBookAndIndex(bookData1),
    _createBookAndIndex(bookData2),
    _createBookAndIndex(bookData3),
    _createBookAndIndex(bookData4)
  ]);

  function _createBookAndIndex(bookData) {
    return Book.create(bookData)
             .then(function(book) {
               var index = {};
               index[book.isbn] = book.id;
               ISBNs.create(index);
               return book;
             });
  }
};

var ISBNs = new Indexes('/isbns', { config: config });

var _throw = function(err) {
  throw err;
};

describe('Indexes', function() {
  this.timeout(10000);

  before(function(done) {
    Book.firebaseRef.authWithPassword({
      email: 'deoxen0n2@gmail.com',
      password: 'secretpassword'
    }, done);
  });

  beforeEach(function() {
    return Q.all([ Book.clear(), ISBNs.clear() ]);
  });

  describe('.create()', function() {
    it('should creates new index', function() {
      return Book.create(bookData1)
               .then(function(book) {
                 var index = {};
                 index[book.isbn] = book.id;

                 return ISBNs.create(index);
               });
    });
  });

  describe('.find()', function() {
    it('should finds the right index value', function() {
      return _createTestSet()
               .spread(function(book1, book2, book3, book4) {
                 return ISBNs.find(bookData2.isbn)
                          .then(function(indexValue) {
                            expect(indexValue).to.be.equal(book2.id);
                          });
               });
    });
  });
});
