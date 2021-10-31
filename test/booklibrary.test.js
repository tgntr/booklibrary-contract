const BookLibrary = artifacts.require("BookLibrary");
const assertUtils = require("./_utils");

const NOT_OWNER_MESSAGE = "Function accessible only by the owner!";
const BOOK_ALREADY_EXISTS_MESSAGE = "Book already exists!";
const BOOK_DOESNT_EXIST_MESSAGE = "Book does not exist!";
const INVALID_BOOK_DETAILS_MESSAGE = "Book name and author should not be empty!";
const INVALID_BOOK_COPIES_MESSAGE = "Book coopies must be greater than 0!";
const BOOK_OUT_OF_STOCK_MESSAGE = "Book is currently out of stock!";
const INVALID_BORROW_MESSAGE = "Either you are trying to borrow a book more than once or you are trying to return a non-borrowed book!";

const NEW_BOOK_ADDED_EVENT = "NewBookAdded";
const BOOK_OUT_OF_STOCK__EVENT = "BookOutOfStock";
const BOOK_BACK_IN_STOCK_EVENT = "BookBackInStock";

const VALID_BOOK_DETAIL = "valid";
const EMPTY_BOOK_DETAIL = "";
const VALID_BOOK_ID = 5451230919;
const INVALID_BOOK_ID = 0;
const SINGLE_COPY = 1;
const TWO_COPIES = 2;
const INVALID_COPIES = 0;

contract("BookLibrary", (accounts) => {
    let [owner, user] = accounts;
    let _bookLibrary;

    beforeEach(async () => {
        _bookLibrary = await BookLibrary.new();
    });

    describe("add new book", async () => {
        it("should add book and emit event", async () => {
            const addNewBookResult = await _bookLibrary.addNewBook(VALID_BOOK_DETAIL, VALID_BOOK_DETAIL, SINGLE_COPY, {from: owner});
            const eventType = addNewBookResult.logs[0].event;
            const eventArguments = addNewBookResult.logs[0].args;
            assert.equal(eventType, NEW_BOOK_ADDED_EVENT);
            assert.equal(eventArguments.name, VALID_BOOK_DETAIL);
            assert.equal(eventArguments.author, VALID_BOOK_DETAIL);
            assert.equal(eventArguments.availableCopies, SINGLE_COPY);
            const availableBooksResult = await _bookLibrary.getAvailableBooks();
            assert(availableBooksResult.length === 1);
            assert(availableBooksResult[0].toNumber() === VALID_BOOK_ID);
        })

        it("non-owner sender should throw", async () => {
            assertUtils.shouldThrow(
                _bookLibrary.addNewBook(VALID_BOOK_DETAIL, VALID_BOOK_DETAIL, SINGLE_COPY, {from: user}),
                NOT_OWNER_MESSAGE
            );
        })

        it("empty name should throw", async () => {
            assertUtils.shouldThrow(
                _bookLibrary.addNewBook(EMPTY_BOOK_DETAIL, VALID_BOOK_DETAIL, SINGLE_COPY, {from: owner}),
                INVALID_BOOK_DETAILS_MESSAGE
            );
        })

        it("empty author should throw", async () => {
            assertUtils.shouldThrow(
                _bookLibrary.addNewBook(VALID_BOOK_DETAIL, EMPTY_BOOK_DETAIL, SINGLE_COPY, {from: owner}),
                INVALID_BOOK_DETAILS_MESSAGE
            );
        })

        it("non-positive copies should throw", async () => {
            assertUtils.shouldThrow(
                _bookLibrary.addNewBook(VALID_BOOK_DETAIL, VALID_BOOK_DETAIL, INVALID_COPIES, {from: owner}),
                INVALID_BOOK_COPIES_MESSAGE
            );
        })

        it("existing book should throw", async () => {
            await _bookLibrary.addNewBook(VALID_BOOK_DETAIL, VALID_BOOK_DETAIL, SINGLE_COPY, {from: owner});
            assertUtils.shouldThrow(
                _bookLibrary.addNewBook(VALID_BOOK_DETAIL, VALID_BOOK_DETAIL, SINGLE_COPY, {from: owner}),
                BOOK_ALREADY_EXISTS_MESSAGE
            );
        })
    })

    describe("add available copies", async () => {
        it("should increase copies and emit event", async () => {
            let availableBooksResult = await _bookLibrary.getAvailableBooks();
            assert(availableBooksResult.length === 0);
            await _bookLibrary.addNewBook(VALID_BOOK_DETAIL, VALID_BOOK_DETAIL, SINGLE_COPY, {from: owner});
            await _bookLibrary.borrowBook(VALID_BOOK_ID);
            const addAvailableCopiesResult = await _bookLibrary.addAvailableCopies(VALID_BOOK_ID, SINGLE_COPY, {from: owner});
            const eventType = addAvailableCopiesResult.logs[0].event;
            const eventArguments = addAvailableCopiesResult.logs[0].args;
            assert.equal(eventType, BOOK_BACK_IN_STOCK_EVENT);
            assert.equal(eventArguments.bookId.toNumber(), VALID_BOOK_ID);
            availableBooksResult = await _bookLibrary.getAvailableBooks();
            assert(availableBooksResult[0].toNumber() === VALID_BOOK_ID);
        })

        it("available book should not emit event", async () => {
            await _bookLibrary.addNewBook(VALID_BOOK_DETAIL, VALID_BOOK_DETAIL, SINGLE_COPY, {from: owner});
            const addAvailableCopiesResult = await _bookLibrary.addAvailableCopies(VALID_BOOK_ID, SINGLE_COPY, {from: owner});
            assert(addAvailableCopiesResult.logs.length === 0);
        })

        it("non-owner sender should throw", async () => {
            await _bookLibrary.addNewBook(VALID_BOOK_DETAIL, VALID_BOOK_DETAIL, SINGLE_COPY, {from: owner});
            assertUtils.shouldThrow(
                _bookLibrary.addAvailableCopies(VALID_BOOK_ID, SINGLE_COPY, {from: user}),
                NOT_OWNER_MESSAGE
            );
        })

        it("non-existing book should throw", async () => {
            assertUtils.shouldThrow(
                _bookLibrary.addAvailableCopies(INVALID_BOOK_ID, SINGLE_COPY, {from: owner}),
                BOOK_DOESNT_EXIST_MESSAGE
            );
        })

        it("non-positive copies should throw", async () => {
            assertUtils.shouldThrow(
                _bookLibrary.addAvailableCopies(VALID_BOOK_ID, INVALID_COPIES, {from: owner}),
                INVALID_BOOK_COPIES_MESSAGE
            );
        })
    })

    describe("get available books", async () => {
        it("should return only available books", async () => {
        })

        it("should return empty array", async () => {
        })
    })

    describe("borrow book", async () => {
        it("should decrease book available copies, update borrower status, add borrower to borrowers list and emit event", async () => {
        })

        it("non-first time borrower should not add borrower to borrowers list", async () => {
        })

        it("borrowing a non-last copy of a book should not emit event", async () => {
        })

        it("non-existing book should throw", async () => {
        })

        it("non-available book should throw", async () => {
        })

        it("already borrowed book should throw", async () => {
        })
    })

    describe("return book", async () => {
        it("should increase book available copies, update borrower status and emit event, should not update borrowers list", async () => {
        })

        it("returning an available book should not emit event", async () => {
        })

        it("non-existing book should throw", async () => {
        })

        it("non-borrowed book should throw", async () => {
        })
    })

    describe("get book borrowers list", async () => {
        it("should return all borrowers", async () => {
        })

        it("non-existing book should throw", async () => {
        })
    })
})