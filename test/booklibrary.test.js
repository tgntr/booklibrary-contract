const BookLibrary = artifacts.require("BookLibrary");
const assertUtils = require("./_utils");

const NOT_OWNER = "Function accessible only by the owner!";
const BOOK_ALREADY_EXISTS = "Book already exists!";
const BOOK_DOESNT_EXIST = "Book does not exist!";
const INVALID_BOOK_DETAILS = "Book name and author should not be empty!";
const INVALID_BOOK_COPIES = "Book coopies must be greater than 0!";
const BOOK_OUT_OF_STOCK = "Book is currently out of stock!";
const INVALID_BORROW = "Either you are trying to borrow a book more than once or you are trying to return a non-borrowed book!";

const VALID_BOOK_DETAIL = "valid";
const EMPTY_BOOK_DETAIL = "";
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
            const newBookEvent = addNewBookResult.logs[0].args;
            assert.equal(newBookEvent.name, VALID_BOOK_DETAIL);
            assert.equal(newBookEvent.author, VALID_BOOK_DETAIL);
            assert.equal(newBookEvent.availableCopies, SINGLE_COPY);
            const availableBooksResult = await _bookLibrary.getAvailableBooks();
            assert(availableBooksResult.length === 1);
        })

        it("non-owner sender should throw", async () => {
            assertUtils.shouldThrow(
                _bookLibrary.addNewBook(VALID_BOOK_DETAIL, VALID_BOOK_DETAIL, SINGLE_COPY, {from: user}),
                NOT_OWNER
            );
        })

        it("empty name should throw", async () => {
            assertUtils.shouldThrow(
                _bookLibrary.addNewBook(EMPTY_BOOK_DETAIL, VALID_BOOK_DETAIL, SINGLE_COPY, {from: owner}),
                INVALID_BOOK_DETAILS
            );
        })

        it("empty author should throw", async () => {
            assertUtils.shouldThrow(
                _bookLibrary.addNewBook(VALID_BOOK_DETAIL, EMPTY_BOOK_DETAIL, SINGLE_COPY, {from: owner}),
                INVALID_BOOK_DETAILS
            );
        })

        it("non-positive copies should throw", async () => {
            assertUtils.shouldThrow(
                _bookLibrary.addNewBook(VALID_BOOK_DETAIL, VALID_BOOK_DETAIL, INVALID_COPIES, {from: owner}),
                INVALID_BOOK_COPIES
            );
        })

        it("existing book should throw", async () => {
            await _bookLibrary.addNewBook(VALID_BOOK_DETAIL, VALID_BOOK_DETAIL, SINGLE_COPY, {from: owner});
            assertUtils.shouldThrow(
                _bookLibrary.addNewBook(VALID_BOOK_DETAIL, VALID_BOOK_DETAIL, SINGLE_COPY, {from: owner}),
                BOOK_ALREADY_EXISTS
            );
        })
    })

    describe("add available copies", async () => {
        it("should increase copies and emit event", async () => {
        })

        it("available book should not emit event", async () => {
        })

        it("non-owner sender should throw", async () => {
        })

        it("non-existing book should throw", async () => {
        })

        it("non-positive copies should throw", async () => {
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