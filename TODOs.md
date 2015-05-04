# TODOs
## Base
* [x] id
* [x] all, Book.all.each
* [x] new
* [x] save
* [x] create
* [ ] hasOne
* [ ] hasMany, hasMay(collection, { through: })
* [ ] update *test*
* [ ] destroy *test*
* [ ] transaction
* [x] find
* [ ] findBy(key, value) *next*
* [ ] findByIndex
* [ ] where(key, value) *next*
* [ ] limit
* [ ] stream
* [ ] clear *test*

## Associations
* [ ] build
* [ ] create
* [ ] find
* [ ] findBy(key, value) *next*
* [ ] findByIndex
* [ ] where(key, value) *next*
* [ ] limit
* [ ] stream
* [ ] clear

```js
user.books.create();
```

So `books` is the associations object. (`this.books = new Associations(this, 'books', Book)`.)

So we can use something like:
```js
user.books[0].destroy();
```

## Schema
```js
{
  "someId": {
    "title": "abcdef",
    "authors": {
      "authorId1": true,
      "authorId2": true
    }
  }
}
```
