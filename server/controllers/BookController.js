import { Book, BorrowedBook, BookCategory, Notification } from '../models';
import { getQuery, getOptions, paginate } from '../helpers/pagination';


const BookController = {
  /**
   * Add new book category to library.
   *
   * @public
   *
   * @method
   *
   * @param  {Object}   req  - express http request object
   * @param  {Object}   res  - express http response object
   * @param  {Function} next - calls th enect middleware in the stack
   *
   * @return {Object}        - express http response object
   */
  addCategory(req, res, next) {
    return BookCategory
      .findOrCreate({
        where: req.body,
        returning: true,
        plain: true,
      })
      .spread((category, created) => {
        const { id } = category;
        return created ?
          res.status(201).send({
            category: { id, category: category.category },
            message:
              `Successfully added new category, ${category.category}, to Library`,
          }) :
          res.status(409).send({
            message:
              `Category, ${category.category}, already exists`,
          });
      })
      .catch(error => next(error));
  },

  /**
   * Fetch Book Categories.
   *
   * @public
   *
   * @method
   *
   * @param  {Object}    req - express http request object
   * @param  {Object}    res - express http response object
   * @param  {Function} next - calls th enect middleware in the stack
   *
   * @return {Object}        - express http response object
   */
  getBookCategories(req, res, next) {
    BookCategory.findAll({ attributes: ['id', 'category'] })
      .then(categories => (
        res.status(200).send({
          categories,
        })
      ))
      .catch(error => next(error));
  },

  /**
   * Add new book to library.
   *
   * @public
   *
   * @method
   *
   * @param  {Object}    req - express http request object
   * @param  {Object}    res - express http response object
   * @param  {Function} next - calls th enect middleware in the stack
   *
   * @return {Object}        - express http response object
   */
  createBook(req, res, next) {
    const bookData = req.body;
    return Book
      .find({ where: { title: bookData.title } })
      .then(existing => (
        existing ?
          res.status(409).send({
            message: `Book with title, ${bookData.title}, already exists`
          }) :
          Book.create(bookData)
            .then(book => res.status(201).send({
              message: `Successfully added ${book.title} to Library`,
              book,
            }))
            .catch(error => next(error))
      ))
      .catch(error => next(error));
  },

  /**
   * Fetch a specific book
   *
   * @public
   *
   * @method
   *
   * @param  {Object}    req - express http request object
   * @param  {Object}    res - express http response object
   * @param  {Function} next - calls th enect middleware in the stack
   *
   * @return {Object}        - express http response object
   */
  getBook(req, res, next) {
    const id = Number(req.params.id);
    Book.findById(id)
      .then((book) => {
        if (!book) {
          return res.status(404).send({
            message: 'Book not found',
          });
        }
        res.status(200).send({
          book,
        });
      })
      .catch(error => next(error));
  },

  /**
   * Fetch all books present in database
   *
   * @public
   *
   * @method
   *
   * @param  {Object}    req - express http request object
   * @param  {Object}    res - express http response object
   * @param  {Function} next - calls th enect middleware in the stack
   *
   * @return {Object}        - express http response object
   */
  getBooks(req, res, next) {
    const query = getQuery(req);
    const options = getOptions(req);
    Book.findAndCountAll({ where: query, ...options })
      .then((result) => {
        if (!result.count) {
          if (req.query.search || req.query.categoryId) {
            return res.status(200).send({
              books: [],
              message: 'No book matched your request'
            });
          }
          return res.status(200).send({
            books: [],
            message: 'Library is currently empty. Check back later'
          });
        }
        res.status(200).send({
          books: result.rows,
          metadata: paginate(result.count,
            Number(options.limit), options.offset)
        });
      })
      .catch(error => next(error));
  },

  /**
   * Edit a book's metadata.
   *
   * @public
   *
   * @method
   *
   * @param  {Object}    req - express http request object
   * @param  {Object}    res - express http response object
   * @param  {Function} next - calls th enect middleware in the stack
   *
   * @return {Object}        - express http response object
   */
  editBookInfo(req, res, next) {
    const id = req.params.id;
    delete req.body.id;
    Book.findById(id)
      .then((book) => {
        if (!book) {
          return res.status(404).send({
            message: 'Book not found',
          });
        }
        Book.update(
          req.body,
          {
            where: { id },
            returning: true,
            plain: true,
          })
          .then(updatedBook => res.status(200).send({
            book: updatedBook[1],
            message: `${updatedBook[1].title} was successfully updated`
          }))
          .catch(error => next(error));
      })
      .catch(error => next(error));
  },

  /**
   * Delete a book from database.
   *
   * @public
   *
   * @method
   *
   * @param  {Object} req    - express http request object
   * @param  {Object} res    - express http response object
   * @param  {Function} next - calls th enect middleware in the stack
   *
   * @return {Object}        - express http response object
   */
  deleteBook(req, res, next) {
    const id = req.params.id;
    Book.destroy({ where: { id } })
      .then(() => res.status(200).send({
        message: 'Successfully deleted book from database',
      }))
      .catch(error => next(error));
  },

  /**
   * Allow user borrow book.
   *
   * @public
   *
   * @method
   *
   * @param  {Object}    req - express http request object
   * @param  {Object}    res - express http response object
   * @param  {Function} next - calls th enect middleware in the stack
   *
   * @return {Object}        - express http response object
   */
  borrowBook(req, res, next) {
    const userId = req.params.id;
    const bookId = req.body.id;
    Book.findById(bookId)
      .then((book) => {
        if (!book) {
          return res.status(404).send({
            message: 'Book not found',
          });
        }
        if (book.total < 1) {
          return res.status(404).send({
            message: 'There are no available copies of this book at this time',
          });
        }
        BorrowedBook.findOne({ where: { userId, bookId } })
          .then((borrowed) => {
            if (borrowed && borrowed.returned === false) {
              return res.status(403).send({
                message: 'You currently have this book. Return it before trying to borrow it again',
              });
            } else if (borrowed && borrowed.returned === true) {
              borrowed.returned = false;
              borrowed.save();
              book.total -= 1;
              book.save();
              const notification = new Notification({
                type: 'borrow',
                bookTitle: book.title,
                username: req.user.username,
              });
              notification.save();
              return res.status(200).send({
                message: [`You have successfully borrowed ${book.title} `,
                  'again. Check your dashboard to read it'].join(''),
              });
            }
            BorrowedBook.create({
              userId, bookId,
            })
              .then(() => {
                book.total -= 1;
                book.save(); // wait till book is saved before sending response
                const notification = new Notification({
                  type: 'borrow',
                  bookTitle: book.title,
                  username: req.user.username,
                });
                notification.save();
              })
              .then(() => res.status(200).send({
                message: [`You have successfully borrowed ${book.title} `,
                  'again. Check your dashboard to read it'].join(''),
              }))
              .catch(error => next(error));
          })
          .catch(error => next(error));
      })
      .catch(error => next(error));
  },

  /**
   * Allow user return borrowed book.
   *
   * @public
   *
   * @method
   *
   * @param  {Object} req    - express http request object
   * @param  {Object} res    - express http response object
   * @param  {Function} next - calls th enect middleware in the stack
   *
   * @return {Object}        - express http response object
   */
  returnBook(req, res, next) {
    const bookId = req.body.id;
    const userId = req.params.id;
    BorrowedBook.findOne({ where: { userId, bookId, returned: false } })
      .then((borrowedBook) => {
        if (borrowedBook) {
          return BorrowedBook.update({
            returned: true,
          }, {
            where: { userId, bookId, returned: false }
          }).then(() => {
            Book.findById(bookId)
              .then((book) => {
                book.total += 1;
                book.save();
                return book;
              })
              .then((book) => {
                const notification = new Notification({
                  type: 'return',
                  bookTitle: book.title,
                  username: req.user.username,
                });
                notification.save();
                res.status(200).send({
                  message: `You have successfully returned ${book.title}`,
                });
              })
              .catch(error => next(error));
          });
        }
        return res.status(403).send({
          message: 'This book is currently not on your list. You have either returned it or never borrowed it'
        });
      })
      .catch(error => next(error));
  },

  /**
   * random book suggestions.
   *
   * @public
   *
   * @method
   *
   * @param  {Object} req    - express http request object
   * @param  {Object} res    - express http response object
   * @param  {Function} next - calls th enect middleware in the stack
   *
   * @return {Object}        - express http response object
   */
  suggestedBooks(req, res, next) {
    Book.count()
      .then((count) => {
        const book1 = Math.ceil(Math.random() * count);
        const book2 = Math.ceil(Math.random() * count);
        Book.findAll({
          where: {
            id: { $in: [book1, book2] }
          },
          attributes: ['id', 'title', 'cover']
        }).then(suggestions => (res.status(200).send({ suggestions })))
          .catch(error => next(error));
      })
      .catch(error => next(error));
  }
};


export default BookController;
