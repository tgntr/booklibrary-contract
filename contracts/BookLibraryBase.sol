// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./BookLibraryToken.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

abstract contract BookLibraryBase is Ownable{
    using SafeMath for uint256;
    
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
    event TokensPurchased(address sender, uint256 amount);
    event TokensSold(address sender, uint256 amount);

    uint[] internal _bookIds;
    mapping(uint => Book) internal _books;
    uint32 internal _currentlyAvailableBooks;
    BookLibraryToken internal _tokens;

    modifier existingBook(uint bookId) {
        require(bookExists(bookId), "Book does not exist!");
        _;
    }

    modifier nonEmptyBookDetails(string memory name, string memory author) {
        require(
            bytes(name).length != 0 && bytes(author).length != 0,
            "Book name and author should not be empty!");
        _;
    }

    modifier positiveCopies(uint copies) {
        require(copies > 0, "Book coopies must be greater than 0!");
        _;
    }

    modifier availableBookCopies(uint bookId) {
        require(bookHasAvailableCopies(bookId), "Book is currently out of stock!");
        _;
    }

    modifier currentlyBorrowedBook(uint bookId, bool isCurrentlyBorrowed) {
        require(
            (_books[bookId].borrowers[msg.sender] == BorrowStatus.Borrowed) == isCurrentlyBorrowed,
            "Either you are trying to borrow a book more than once or you are trying to return a non-borrowed book!");
        _;
    }

    modifier positiveAmount(uint256 amount) {
        require(amount > 0 wei, "Must be positive amount!");
        _;
    }

    function purchaseTokens() external payable positiveAmount(msg.value) {
        require(msg.sender.balance >= msg.value, "You don't have enough currency!");
        _tokens.mint(msg.sender, msg.value);
        emit TokensPurchased(msg.sender, msg.value);
    }

    function sellTokens(uint256 amount) external positiveAmount(amount) {
        _tokens.burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
        emit TokensSold(msg.sender, amount);
    }

    function getTokenBalance() external view returns(uint) {
        return _tokens.balanceOf(msg.sender);
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