const { BigNumber } = require("@ethersproject/bignumber");
const { expect } = require("chai");

const NOT_OWNER_MESSAGE = "Ownable: caller is not the owner";
const BOOK_ALREADY_EXISTS_MESSAGE = "Book already exists!";
const BOOK_DOESNT_EXIST_MESSAGE = "Book does not exist!";
const INFIRST_VALID_BOOK_DETAILS_MESSAGE = "Book name and author should not be empty!";
const INVALID_BOOK_COPIES_MESSAGE = "Book coopies must be greater than 0!";
const BOOK_OUT_OF_STOCK_MESSAGE = "Book is currently out of stock!";
const INVALID_BORROW_MESSAGE = "Either you are trying to borrow a book more than once or you are trying to return a non-borrowed book!";

const NEW_BOOK_ADDED_EVENT = "NewBookAdded";
const BOOK_OUT_OF_STOCK_EVENT = "BookOutOfStock";
const BOOK_BACK_IN_STOCK_EVENT = "BookBackInStock";

const EMPTY_BOOK_DETAIL = "";
const FIRST_VALID_BOOK_DETAIL = "valid";
const FIRST_VALID_BOOK_ID = 5451230919;
const SECOND_VALID_BOOK_DETAIL = "secondvalid";
const SECOND_VALID_BOOK_ID = 8287397125;
const INVALID_BOOK_ID = 0;
const SINGLE_COPY = 1;
const TWO_COPIES = 2;
const INVALID_COPIES = 0;



describe("BookLibrary", async () => {
    let _bookLibrary, _owner, _user;


    beforeEach(async () => {
        const bookLibraryFactory = await ethers.getContractFactory("BookLibrary");
        _bookLibrary = await bookLibraryFactory.deploy();
        await _bookLibrary.deployed();
        [_owner, _user] = await ethers.getSigners();
    });

    describe("add new book", async () => {
        it("should emit event", async () => {
            await expect(_bookLibrary.addNewBook(FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL, SINGLE_COPY))
                .to.emit(_bookLibrary, NEW_BOOK_ADDED_EVENT)
                .withArgs(FIRST_VALID_BOOK_ID, FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL, SINGLE_COPY);
        })

        it("non-owner sender should throw", async () => {
            await expect(_bookLibrary.connect(_user).addNewBook(FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL, SINGLE_COPY))
                .to.be.revertedWith(NOT_OWNER_MESSAGE);
        })

        it("empty name should throw", async () => {
            await expect(_bookLibrary.addNewBook(EMPTY_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL, SINGLE_COPY))
                .to.be.revertedWith(INFIRST_VALID_BOOK_DETAILS_MESSAGE);
        })

        it("empty author should throw", async () => {
            await expect(_bookLibrary.addNewBook(FIRST_VALID_BOOK_DETAIL, EMPTY_BOOK_DETAIL, SINGLE_COPY))
                .to.be.revertedWith(INFIRST_VALID_BOOK_DETAILS_MESSAGE);
        })

        it("non-positive copies should throw", async () => {
            await expect(_bookLibrary.addNewBook(FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL, INVALID_COPIES))
                .to.be.revertedWith(INVALID_BOOK_COPIES_MESSAGE);
        })

        it("existing book should throw", async () => {
            await _bookLibrary.addNewBook(FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL, SINGLE_COPY);

            await expect(_bookLibrary.addNewBook(FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL, SINGLE_COPY))
                .to.be.revertedWith(BOOK_ALREADY_EXISTS_MESSAGE);
        })
    })

    describe("add available copies", async () => {
        it("should emit event", async () => {
            await _bookLibrary.addNewBook(FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL, SINGLE_COPY);
            await _bookLibrary.borrowBook(FIRST_VALID_BOOK_ID);

            await expect(_bookLibrary.addAvailableCopies(FIRST_VALID_BOOK_ID, SINGLE_COPY))
                .to.emit(_bookLibrary, BOOK_BACK_IN_STOCK_EVENT)
                .withArgs(FIRST_VALID_BOOK_ID, FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL);
        })

        it("available book should not emit event", async () => {
            await _bookLibrary.addNewBook(FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL, SINGLE_COPY);

            await expect(_bookLibrary.addAvailableCopies(FIRST_VALID_BOOK_ID, SINGLE_COPY))
                .to.not.emit(_bookLibrary, BOOK_BACK_IN_STOCK_EVENT)
        })

        it("non-owner sender should throw", async () => {
            await expect(_bookLibrary.connect(_user).addAvailableCopies(FIRST_VALID_BOOK_ID, SINGLE_COPY))
                .to.be.revertedWith(NOT_OWNER_MESSAGE);
        })

        it("non-existing book should throw", async () => {
            await expect(_bookLibrary.addAvailableCopies(INVALID_BOOK_ID, SINGLE_COPY))
                .to.be.revertedWith(BOOK_DOESNT_EXIST_MESSAGE);
        })

        it("non-positive copies should throw", async () => {
            await _bookLibrary.addNewBook(FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL, SINGLE_COPY)

            await expect(_bookLibrary.addAvailableCopies(FIRST_VALID_BOOK_ID, INVALID_COPIES))
                .to.be.revertedWith(INVALID_BOOK_COPIES_MESSAGE);
        })
    })

    describe("get available books", async () => {
        it("should return only available books", async () => {
            await _bookLibrary.addNewBook(FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL, SINGLE_COPY);
            await _bookLibrary.borrowBook(FIRST_VALID_BOOK_ID);
            await _bookLibrary.addNewBook(SECOND_VALID_BOOK_DETAIL, SECOND_VALID_BOOK_DETAIL, SINGLE_COPY);
            await _bookLibrary.borrowBook(SECOND_VALID_BOOK_ID);
            await _bookLibrary.addAvailableCopies(SECOND_VALID_BOOK_ID, SINGLE_COPY);

            expect(await _bookLibrary.getAvailableBooks())
                .to.eql([BigNumber.from(SECOND_VALID_BOOK_ID)]);
        })

        it("should return initial empty array", async () => {
            expect(await _bookLibrary.getAvailableBooks())
                .to.be.empty;
        })
    })

    describe("borrow book", async () => {
        it("should emit event", async () => {
            await _bookLibrary.addNewBook(FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL, SINGLE_COPY);

            await expect(_bookLibrary.borrowBook(FIRST_VALID_BOOK_ID))
                .to.emit(_bookLibrary, BOOK_OUT_OF_STOCK_EVENT)
                .withArgs(FIRST_VALID_BOOK_ID, FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL);
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