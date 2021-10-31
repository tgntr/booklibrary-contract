pragma solidity ^0.8.0;

import "./Ownable.sol";
import "./BookLibraryBase.sol";

contract BookLibrary is BookLibraryBase {
    function addNewBook(string calldata name, string calldata author, uint8 copies) external onlyOwner nonEmptyBookDetails(name, author) positiveCopies(copies) {
        uint bookId = getBookUniqueIdentifier(name, author);(name, author);
        require(!bookExists(bookId), BOOK_ALREADY_EXISTS);
        createBook(bookId, name, author, copies);
        _bookIds.push(bookId);
        emit NewBookAdded(bookId, name, author);
    }

    function borrowBook(uint bookId) external existingBook(bookId) availableBookCopies(bookId) currentlyBorrowedBook(bookId, false) {
        removeAvailableCopy(bookId);
        updateBorrowerStatus(bookId, BorrowStatus.Borrowed);
    }
    
    function returnBook(uint bookId) external existingBook(bookId) currentlyBorrowedBook(bookId, true) {
        addAvailableCopies(bookId, 1);
        updateBorrowerStatus(bookId, BorrowStatus.Returned);
    }

    function getAvailableBooks() external view returns(uint[] memory) {
        uint[] memory availableBooks = new uint[](_bookIds.length);
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

    function getBookBorrowersList(uint bookId) external view existingBook(bookId) returns(address[] memory) {
        return _books[bookId].borrowerIds;
    }
    
    function addAvailableCopies(uint bookId, uint8 copies) public existingBook(bookId) positiveCopies(copies) {
        Book storage book = _books[bookId];
        if (!bookHasAvailableCopies(bookId)) {
            emit BookBackInStock(bookId, book.name, book.author);
        }
        book.availableCopies += copies;
    }

    function createBook(uint bookId, string memory name, string memory author, uint8 copies) private {
        Book storage book = _books[bookId];
        book.name = name;
        book.author = author;
        book.availableCopies = copies;
    }

    function removeAvailableCopy(uint bookId) private {
        Book storage book = _books[bookId];
        book.availableCopies--;
        if (!bookHasAvailableCopies(bookId)) {
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