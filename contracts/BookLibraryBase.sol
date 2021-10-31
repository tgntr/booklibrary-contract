// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Ownable.sol";

abstract contract BookLibraryBase is Ownable{
    struct Book {
        string name;
        string author;
        uint8 availableCopies;
        address[] borrowerIds;
        mapping(address => BorrowStatus) borrowers;
    }
    
    enum BorrowStatus { NeverBorrowed, Borrowed, Returned }
    string internal constant BOOK_ALREADY_EXISTS = "Book already exists!";
    string internal constant BOOK_DOESNT_EXIST = "Book does not exist!";
    string internal constant INVALID_BOOK_DETAILS = "Book name and author should not be empty!";
    string internal constant INVALID_BOOK_COPIES = "Book coopies must be greater than 0!";
    string internal constant BOOK_OUT_OF_STOCK = "Book is currently out of stock!";
    string internal constant INVALID_BORROW = "Either you are trying to borrow a book more than once or you are trying to return a non-borrowed book!";

    event NewBookAdded(uint bookid, string name, string author);
    event BookOutOfStock(uint bookId, string name, string author);
    event BookBackInStock(uint bookId, string name, string author);

    uint[] internal _bookIds;
    mapping(uint => Book) internal _books;

    modifier existingBook(uint bookId) {
        require(bookExists(bookId), BOOK_DOESNT_EXIST);
        _;
    }

    modifier nonEmptyBookDetails(string memory name, string memory author) {
        require(bytes(name).length != 0 && bytes(author).length != 0, INVALID_BOOK_DETAILS);
        _;
    }

    modifier positiveCopies(uint copies) {
        require(copies > 0, INVALID_BOOK_COPIES);
        _;
    }

    modifier availableBookCopies(uint bookId) {
        require(bookHasAvailableCopies(bookId), BOOK_OUT_OF_STOCK);
        _;
    }

    modifier currentlyBorrowedBook(uint bookId, bool isCurrentlyBorrowed) {
        require((_books[bookId].borrowers[msg.sender] == BorrowStatus.Borrowed) == isCurrentlyBorrowed, INVALID_BORROW);
        _;
    }

    function getBookUniqueIdentifier(string memory name, string memory author) internal pure returns(uint) {
        return uint(keccak256(abi.encodePacked(name, author)));
    }

    function bookExists(uint bookId) internal view returns(bool) {
        return bytes(_books[bookId].name).length > 0;
    }

    function bookHasAvailableCopies(uint bookId) internal view returns(bool) {
        return _books[bookId].availableCopies > 0;
    }
}