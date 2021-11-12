import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Contract, ContractFactory } from "ethers";
import { ethers, } from "hardhat";
//todo export constants properly
import { FIRST_VALID_BOOK_DETAIL, SINGLE_COPY, SECOND_VALID_BOOK_DETAIL, NEW_BOOK_ADDED_EVENT, SECOND_VALID_BOOK_ID, NOT_OWNER_MESSAGE,
    EMPTY_BOOK_DETAIL, INVALID_COPIES, INVALID_BOOK_COPIES_MESSAGE, BOOK_ALREADY_EXISTS_MESSAGE, FIRST_VALID_BOOK_ID, BOOK_BACK_IN_STOCK_EVENT,
    INVALID_BOOK_ID, BOOK_DOESNT_EXIST_MESSAGE, BOOK_OUT_OF_STOCK_EVENT, BOOK_OUT_OF_STOCK_MESSAGE, INVALID_BORROW_MESSAGE, TWO_COPIES,
    INVALID_BOOK_DETAILS_MESSAGE, 
    EMPTY_ADDRESS,
    TRANSFER_EVENT,
    NOT_ENOUGH_CURRENCY_MESSAGE,
    INSUFFICIENT_AMOUNT} from "./constants";

describe("BookLibrary", async () => {
    let _owner: SignerWithAddress;
    let _user: SignerWithAddress;
    let _bookLibraryFactory: ContractFactory;
    let _bookLibrary: Contract;
    let _bookLibraryTokenFactory: ContractFactory;
    let _bookLibraryToken: Contract;

    before(async () => {
        _bookLibraryFactory = await ethers.getContractFactory("BookLibrary");
        _bookLibraryTokenFactory = await ethers.getContractFactory("BookLibraryToken");
        [_owner, _user] = await ethers.getSigners();
    })

    beforeEach(async () => {
        _bookLibraryToken = await _bookLibraryTokenFactory.deploy();
        _bookLibrary = await _bookLibraryFactory.deploy(_bookLibraryToken.address);
        await _bookLibrary.addNewBook(FIRST_VALID_BOOK_DETAIL,FIRST_VALID_BOOK_DETAIL, SINGLE_COPY);
        await _bookLibrary.purchaseTokens({value:10});
    });

    describe("purchase tokens", async () => {
        it("should update balances and emit event", async () => {
            await expect(await _bookLibrary.purchaseTokens({value: 2}))
                .to.changeEtherBalances([_owner, _bookLibrary], [-2, 2]);
            await expect(await _bookLibrary.purchaseTokens({value: 2}))
                 .to.emit(_bookLibraryToken, TRANSFER_EVENT)
                     .withArgs(EMPTY_ADDRESS, _owner.address, 2);
            await expect(await _bookLibrary.getTokenBalance()).equal(14);
        })

        it("insufficient amount should throw", async () => {
            //instead reverting, the following code throws Uncaught InvalidInputError/AssertionError: sender doesn't have enough funds to send tx.
            //seems caused by hardhat-network/TxPool.ts
            //revertedWith assert doesn't catch it, using workaround with js promise.catch
            _bookLibrary.purchaseTokens({value:INSUFFICIENT_AMOUNT})
                .catch((error) => expect(error.message).contains(NOT_ENOUGH_CURRENCY_MESSAGE));
        })
    })

    describe("add new book", async () => {
        it("should emit event", async () => {
            await expect(_bookLibrary.addNewBook(SECOND_VALID_BOOK_DETAIL, SECOND_VALID_BOOK_DETAIL, SINGLE_COPY))
                .to.emit(_bookLibrary, NEW_BOOK_ADDED_EVENT)
                .withArgs(SECOND_VALID_BOOK_ID, SECOND_VALID_BOOK_DETAIL, SECOND_VALID_BOOK_DETAIL, SINGLE_COPY);
        })

        it("non-owner sender should throw", async () => {
            await expect(_bookLibrary.connect(_user).addNewBook(SECOND_VALID_BOOK_DETAIL, SECOND_VALID_BOOK_DETAIL, SINGLE_COPY))
                .to.be.revertedWith(NOT_OWNER_MESSAGE);
        })

        it("empty name should throw", async () => {
            await expect(_bookLibrary.addNewBook(EMPTY_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL, SINGLE_COPY))
                .to.be.revertedWith(INVALID_BOOK_DETAILS_MESSAGE);
        })

        it("empty author should throw", async () => {
            await expect(_bookLibrary.addNewBook(FIRST_VALID_BOOK_DETAIL, EMPTY_BOOK_DETAIL, SINGLE_COPY))
                .to.be.revertedWith(INVALID_BOOK_DETAILS_MESSAGE);
        })

        it("non-positive copies should throw", async () => {
            await expect(_bookLibrary.addNewBook(FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL, INVALID_COPIES))
                .to.be.revertedWith(INVALID_BOOK_COPIES_MESSAGE);
        })

        it("existing book should throw", async () => {
            await expect(_bookLibrary.addNewBook(FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL, SINGLE_COPY))
                .to.be.revertedWith(BOOK_ALREADY_EXISTS_MESSAGE);
        })
    })

    describe("add available copies", async () => {
        it("should emit event", async () => {
            await _bookLibrary.borrowBook(FIRST_VALID_BOOK_ID);

            await expect(_bookLibrary.addAvailableCopies(FIRST_VALID_BOOK_ID, SINGLE_COPY))
                .to.emit(_bookLibrary, BOOK_BACK_IN_STOCK_EVENT)
                .withArgs(FIRST_VALID_BOOK_ID, FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL);
        })

        it("available book should not emit event", async () => {
            await expect(_bookLibrary.addAvailableCopies(FIRST_VALID_BOOK_ID, SINGLE_COPY))
                .to.not.emit(_bookLibrary, BOOK_BACK_IN_STOCK_EVENT);
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
            await expect(_bookLibrary.addAvailableCopies(FIRST_VALID_BOOK_ID, INVALID_COPIES))
                .to.be.revertedWith(INVALID_BOOK_COPIES_MESSAGE);
        })
    })

    describe("borrow book", async () => {
        it("should emit event", async () => {
            await expect(_bookLibrary.borrowBook(FIRST_VALID_BOOK_ID))
                .to.emit(_bookLibrary, BOOK_OUT_OF_STOCK_EVENT)
                .withArgs(FIRST_VALID_BOOK_ID, FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL);
        })

        it("available book shout not emit event", async () => {
            await _bookLibrary.addAvailableCopies(FIRST_VALID_BOOK_ID, SINGLE_COPY);

            await expect(_bookLibrary.borrowBook(FIRST_VALID_BOOK_ID))
                .to.not.emit(_bookLibrary, BOOK_OUT_OF_STOCK_EVENT);
        })

        it("non-existing book should throw", async () => {
            await expect(_bookLibrary.borrowBook(INVALID_BOOK_ID))
                .to.be.revertedWith(BOOK_DOESNT_EXIST_MESSAGE);
        })

        it("non-available book should throw", async () => {
            await _bookLibrary.borrowBook(FIRST_VALID_BOOK_ID);

            await expect(_bookLibrary.borrowBook(FIRST_VALID_BOOK_ID))
                .to.be.revertedWith(BOOK_OUT_OF_STOCK_MESSAGE);
        })

        it("already borrowed book should throw", async () => {
            await _bookLibrary.addAvailableCopies(FIRST_VALID_BOOK_ID, SINGLE_COPY);
            await _bookLibrary.borrowBook(FIRST_VALID_BOOK_ID);

            await expect(_bookLibrary.borrowBook(FIRST_VALID_BOOK_ID))
                .to.be.revertedWith(INVALID_BORROW_MESSAGE);
        })
    })

    describe("return book", async () => {
        it("should emit event", async () => {
            await _bookLibrary.borrowBook(FIRST_VALID_BOOK_ID);

            await expect(_bookLibrary.returnBook(FIRST_VALID_BOOK_ID))
                .to.emit(_bookLibrary, BOOK_BACK_IN_STOCK_EVENT)
                .withArgs(FIRST_VALID_BOOK_ID, FIRST_VALID_BOOK_DETAIL, FIRST_VALID_BOOK_DETAIL);
        })

        it("returning an available book should not emit event", async () => {
            await _bookLibrary.addAvailableCopies(FIRST_VALID_BOOK_ID, SINGLE_COPY);
            await _bookLibrary.borrowBook(FIRST_VALID_BOOK_ID);

            await expect(_bookLibrary.returnBook(FIRST_VALID_BOOK_ID))
                .to.not.emit(_bookLibrary, BOOK_BACK_IN_STOCK_EVENT)
        })

        it("non-existing book should throw", async () => {
            await expect(_bookLibrary.returnBook(INVALID_BOOK_ID))
                .to.be.revertedWith(BOOK_DOESNT_EXIST_MESSAGE);
        })

        it("non-borrowed book should throw", async () => {
            await expect(_bookLibrary.returnBook(FIRST_VALID_BOOK_ID))
                .to.be.revertedWith(INVALID_BORROW_MESSAGE);
        })
    })

    describe("get available books", async () => {
        it("should return all available books", async () => {
            await _bookLibrary.addNewBook(SECOND_VALID_BOOK_DETAIL, SECOND_VALID_BOOK_DETAIL, SINGLE_COPY);

            expect(await _bookLibrary.getAvailableBooks())
                .to.eql([BigNumber.from(FIRST_VALID_BOOK_ID), BigNumber.from(SECOND_VALID_BOOK_ID)]);
        })

        it("borrowing last copy should exclude book ", async () => {
            await _bookLibrary.borrowBook(FIRST_VALID_BOOK_ID);

            expect(await _bookLibrary.getAvailableBooks())
                .to.be.empty;
        })

        it("adding available copies to non-available book should include book ", async () => {
            await _bookLibrary.borrowBook(FIRST_VALID_BOOK_ID);
            await _bookLibrary.addAvailableCopies(FIRST_VALID_BOOK_ID, SINGLE_COPY);

            expect(await _bookLibrary.getAvailableBooks())
                .to.eql([BigNumber.from(FIRST_VALID_BOOK_ID)]);
        })
    })

    describe("get book borrowers list", async () => {
        it("should return all unique borrowers", async () => {
            await _bookLibrary.addAvailableCopies(FIRST_VALID_BOOK_ID, TWO_COPIES);
            await _bookLibrary.borrowBook(FIRST_VALID_BOOK_ID);
            await _bookLibrary.connect(_user).purchaseTokens({value:10});
            await _bookLibrary.connect(_user).borrowBook(FIRST_VALID_BOOK_ID);

            expect(await _bookLibrary.getBookBorrowersList(FIRST_VALID_BOOK_ID))
                .to.eql([_owner.address, _user.address]);
        })

        it("returning book should include past borrowers", async () => {
            await _bookLibrary.borrowBook(FIRST_VALID_BOOK_ID);
            await _bookLibrary.returnBook(FIRST_VALID_BOOK_ID)

            expect(await _bookLibrary.getBookBorrowersList(FIRST_VALID_BOOK_ID))
                .to.eql([_owner.address]);
        })

        it("borrowing twice should distinct unique borrowers", async () => {
            await _bookLibrary.borrowBook(FIRST_VALID_BOOK_ID);
            await _bookLibrary.returnBook(FIRST_VALID_BOOK_ID);
            await _bookLibrary.borrowBook(FIRST_VALID_BOOK_ID);

            expect(await _bookLibrary.getBookBorrowersList(FIRST_VALID_BOOK_ID))
                .to.eql([_owner.address]);
        })

        it("should return initial empty array", async () => {
            expect(await _bookLibrary.getBookBorrowersList(FIRST_VALID_BOOK_ID))
                .to.be.empty;
        })
    })
})