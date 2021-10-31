const BookLibrary = artifacts.require("BookLibrary");

const validBookDetail = "valid";
const invalidBookDetail = "";
const singleCopy = 1;
const twoCopies = 2;
const invalidCopies = 0;

contract("BookLibrary", (accounts) => {
    let [owner, user] = accounts;
    let _bookLibrary;

    beforeEach(async () => {
        _bookLibrary = await BookLibrary.new();
    });

    context("add new book", async () => {
        it("should add book and emit event", async () => {
            let result = await _bookLibrary.addNewBook(validBookDetail, validBookDetail, singleCopy, { from: owner});
            console.log(result);
        })

        it("non-owner sender should throw", async () => {
        })

        it("empty name should throw", async () => {
        })

        it("empty author should throw", async () => {
        })

        it("non-positive copies should throw", async () => {
        })

        it("existing book should throw", async () => {
        })
    })

    context("add available copies", async () => {
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

    context("get available books", async () => {
        it("should return only available books", async () => {
        })

        it("should return empty array", async () => {
        })
    })

    context("borrow book", async () => {
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

    context("return book", async () => {
        it("should increase book available copies, update borrower status and emit event, should not update borrowers list", async () => {
        })

        it("returning an available book should not emit event", async () => {
        })

        it("non-existing book should throw", async () => {
        })

        it("non-borrowed book should throw", async () => {
        })
    })

    context("get book borrowers list", async () => {
        it("should return all borrowers", async () => {
        })

        it("non-existing book should throw", async () => {
        })
    })
})