const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const { Op } = require("sequelize");

/* Handler function to wrap each route. */
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      // Forward error to the global error handler
      next(error);
    }
  }
}

(async () => {
  await sequelize.authenticate();
  console.log('Connection to the database was successful!');

  // If there's only one table, you can sync just that table
  await Book.sync();

  // If there a multiple tables, you can sync them all at once:
  //await db.sequelize.sync({ force: true }); // force table recreation in dev

  try {

  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      console.error('Validation errors: ', errors);
    } else {
      throw error;
    }
  }
})

/* GET - Show full books listing. */
router.get('/', asyncHandler(async (req, res) => {
  const search = req.body.search ? req.body.search : '';
  const books = await Book.findAll({ order: [['title', 'ASC']] });
  res.render('books/index', { books, title: 'My Books List', search });
}));

/* POST - Create a book with the form. */
router.post('/', asyncHandler(async (req, res) => {
  let book;
  const search = req.body.search ? req.body.search : '';

  // https://sequelize.org/master/manual/model-querying-basics.html#applying-where-clauses
  if (search) {
    const books = await Book.findAll({
      order: [['title', 'ASC']],
      where: {
        [Op.or]: {
          title: {
            [Op.like]: '%' + search + '%'
          },
          author: {
            [Op.like]: '%' + search + '%'
          },
          genre: {
            [Op.like]: '%' + search + '%'
          },
          year: {
            [Op.like]: '%' + search + '%'
          }
        },
      }
    });
    res.render('books/index', { books, title: 'Search Results', search });
  } else {
    try {
      book = await Book.create(req.body);
      res.redirect('/books');
    } catch (error) {
      if (error.name === 'SequelizeValidationError') { // checking the error
        book = await Book.build(req.body); // return a non-persistent (or unsaved) model instance
        res.render('books/new', { book, errors: error.errors, title: 'New book' })
      } else {
        throw error; // error caught in the asyncHandler’s catch block
      }
    }
  }
}));

/* GET - Create a new book form. */
router.get('/new', (req, res) => {
  res.render('books/new', { book: {}, title: 'New Book' });
});

/* GET - Edit book form. */
router.get('/:id/edit', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('books/edit', { book, title: 'Edit Book' });
  } else {
    res.sendStatus(404);
  }
}));

/* GET - Show individual book, using the edit template. */
router.get('/:id', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('books/edit', { book, title: book.title });
  } else {
    const err = new Error();
    err.message = (isNaN(req.params.id)) ?
      'Sorry, this page does not exist. :('
      :
      'Sorry, this book does not exist. :(';
    err.status = (isNaN(req.params.id)) ? 400 : 500;
    next(err);
  }
}));

/* POST - Update a book, using the edit template. */
router.post('/:id/edit', asyncHandler(async (req, res) => {
  let book;

  try {
    book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect('/books/');
    } else {
      const err = new Error();
      err.message = (!isNaN(req.params.id)) ?
        'Sorry, this book does not exist. :('
        :
        'Sorry, this page does not exist. :(';
      err.status = (!isNaN(req.params.id)) ? 500 : 400;
      next(err);
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure the correct book gets updated
      res.render('books/edit', { book, errors: error.errors, title: 'Edit Book' })
    } else {
      throw error;
    }
  }
}));

/* GET - Delete book form, using 'delete' template. */
router.get('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('books/delete', { book, title: 'Delete Book' });
  } else {
    const err = new Error();
    err.message = (!isNaN(req.params.id)) ?
      'Sorry, this book does not exist. :('
      :
      'Sorry, this page does not exist. :(';
    err.status = (!isNaN(req.params.id)) ? 500 : 400;
    next(err);
  }
}));

/* POST - Delete individual book. */
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.redirect('/books');
  } else {
    const err = new Error();
    err.message = (!isNaN(req.params.id)) ?
      'Sorry, this book does not exist. :('
      :
      'Sorry, this page does not exist. :(';
    err.status = (!isNaN(req.params.id)) ? 500 : 400;
    next(err);
  }
}));

module.exports = router;
