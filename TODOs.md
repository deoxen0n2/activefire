# TODOs
## Base
* [x] id
* [x] all, Book.all.each
* [x] new
* [ ] new with hasMany, belongsTo options *test*
* [ ] default attributes
* [x] save
* [ ] save with associations *test*
* [x] create
* [x] update
* [ ] reload *test*
* [ ] on('value'), on('child_added'), ...
* [ ] destroy *test*
* [ ] transaction
* [x] find
* [x] findBy(key, value)
* [ ] findByIndex
* [ ] where(key, value) *next*
* [ ] limit
* [ ] stream
* [ ] clear *test*

## Associations
* [ ] build *test*
* [ ] create *test*
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
