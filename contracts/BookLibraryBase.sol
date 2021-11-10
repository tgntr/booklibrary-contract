// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract BookLibraryBase is Ownable{
    struct Book {
        string name;
        string author;
        uint8 availableCopies;
        address[] borrowerIds;
        mapping(address => BorrowStatus) borrowers;
    }
    enum BorrowStatus { NeverBorrowed, Borrowed, Returned }
    event NewBookAdded(uint bookId, string name, string author, uint8 availableCopies);
    event BookOutOfStock(uint bookId, string name, string author);
    event BookBackInStock(uint bookId, string name, string author);

    uint[] internal _bookIds;
    mapping(uint => Book) internal _books;
    uint32 internal _currentlyAvailableBooks;

    modifier existingBook(uint bookId) {
        require(
            bookExists(bookId),
            "Book does not exist!");
        _;
    }

    modifier nonEmptyBookDetails(string memory name, string memory author) {
        require(
            bytes(name).length != 0 && bytes(author).length != 0,
            "Book name and author should not be empty!");
        _;
    }

    modifier positiveCopies(uint copies) {
        require(
            copies > 0,
            "Book coopies must be greater than 0!");
        _;
    }

    modifier availableBookCopies(uint bookId) {
        require(
            bookHasAvailableCopies(bookId),
            "Book is currently out of stock!");
        _;
    }

    modifier currentlyBorrowedBook(uint bookId, bool isCurrentlyBorrowed) {
        require(
            (_books[bookId].borrowers[msg.sender] == BorrowStatus.Borrowed) == isCurrentlyBorrowed,
            "Either you are trying to borrow a book more than once or you are trying to return a non-borrowed book!");
        _;
    }

    function getBookUniqueIdentifier(string memory name, string memory author) internal pure returns(uint) {
        return uint(keccak256(abi.encodePacked(name, author))) % 10 ** 10;
    }

    function bookExists(uint bookId) internal view returns(bool) {
        return bytes(_books[bookId].name).length > 0;
    }

    function bookHasAvailableCopies(uint bookId) internal view returns(bool) {
        return _books[bookId].availableCopies > 0;
    }
}