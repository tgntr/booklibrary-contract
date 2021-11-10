// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./BookLibraryBase.sol";

contract BookLibrary is BookLibraryBase {
    function addNewBook(string calldata name, string calldata author, uint8 copies) external onlyOwner nonEmptyBookDetails(name, author) positiveCopies(copies) {
        uint bookId = getBookUniqueIdentifier(name, author);
        require(
            !bookExists(bookId),
            "Book already exists!");
        createBook(bookId, name, author, copies);
        _bookIds.push(bookId);
        Book storage book = _books[bookId];
        _currentlyAvailableBooks++;
        emit NewBookAdded(bookId, book.name, book.author, book.availableCopies);
    }

    function addAvailableCopies(uint bookId, uint8 copies) external onlyOwner existingBook(bookId) positiveCopies(copies) {
        increaseAvailableCopies(bookId, copies);
    }

    function getAvailableBooks() external view returns(uint[] memory) {
        uint[] memory availableBooks = new uint[](_currentlyAvailableBooks);
        uint counter = 0;
        for (uint i = 0; i < _bookIds.length; i++) {
            uint currentBookId = _bookIds[i];
            if (bookHasAvailableCopies(currentBookId)) {
                availableBooks[counter] = currentBookId;
                counter++;
            }
        }
        return availableBooks;
    }

    function borrowBook(uint bookId) external existingBook(bookId) availableBookCopies(bookId) currentlyBorrowedBook(bookId, false) {
        decreaseAvailableCopies(bookId);
        updateBorrowerStatus(bookId, BorrowStatus.Borrowed);
    }
    
    function returnBook(uint bookId) external existingBook(bookId) currentlyBorrowedBook(bookId, true) {
        increaseAvailableCopies(bookId, 1);
        updateBorrowerStatus(bookId, BorrowStatus.Returned);
    }

    function getBookBorrowersList(uint bookId) external view existingBook(bookId) returns(address[] memory) {
        return _books[bookId].borrowerIds;
    }

    function currentlyAvailableBooksCount() external view returns(uint32) {
        return _currentlyAvailableBooks;
    }

    function createBook(uint bookId, string calldata name, string calldata author, uint8 copies) private {
        Book storage book = _books[bookId];
        book.name = name;
        book.author = author;
        book.availableCopies = copies;
    }

    function increaseAvailableCopies(uint bookId, uint8 copies) private {
        Book storage book = _books[bookId];
        if (!bookHasAvailableCopies(bookId)) {
            _currentlyAvailableBooks++;
            emit BookBackInStock(bookId, book.name, book.author);
        }
        book.availableCopies += copies;
    }

    function decreaseAvailableCopies(uint bookId) private {
        Book storage book = _books[bookId];
        book.availableCopies--;
        if (!bookHasAvailableCopies(bookId)) {
            _currentlyAvailableBooks--;
            emit BookOutOfStock(bookId, book.name, book.author);
        }
    }

    function updateBorrowerStatus(uint bookId, BorrowStatus status) private {
        address userId = msg.sender;
        Book storage book = _books[bookId];
        if (status == BorrowStatus.Borrowed && book.borrowers[userId] == BorrowStatus.NeverBorrowed) {
            book.borrowerIds.push(userId);
        }
        book.borrowers[userId] = status;
    }
}