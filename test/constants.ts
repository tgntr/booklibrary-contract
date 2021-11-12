import { ethers } from "hardhat";

export const NOT_OWNER_MESSAGE = "Ownable: caller is not the owner";
export const BOOK_ALREADY_EXISTS_MESSAGE = "Book already exists!";
export const BOOK_DOESNT_EXIST_MESSAGE = "Book does not exist!";
export const INVALID_BOOK_DETAILS_MESSAGE = "Book name and author should not be empty!";
export const INVALID_BOOK_COPIES_MESSAGE = "Book coopies must be greater than 0!";
export const BOOK_OUT_OF_STOCK_MESSAGE = "Book is currently out of stock!";
export const INVALID_BORROW_MESSAGE = "Either you are trying to borrow a book more than once or you are trying to return a non-borrowed book!";
export const NOT_ENOUGH_CURRENCY_MESSAGE = "sender doesn\'t have enough funds to send tx";
export const NEW_BOOK_ADDED_EVENT = "NewBookAdded";
export const BOOK_OUT_OF_STOCK_EVENT = "BookOutOfStock";
export const BOOK_BACK_IN_STOCK_EVENT = "BookBackInStock";
export const TRANSFER_EVENT = "Transfer";
export const EMPTY_ADDRESS = "0x0000000000000000000000000000000000000000";
export const EMPTY_BOOK_DETAIL = "";
export const FIRST_VALID_BOOK_DETAIL = "valid";
export const SECOND_VALID_BOOK_DETAIL = "secondvalid";
export const FIRST_VALID_BOOK_ID = 5451230919;
export const SECOND_VALID_BOOK_ID = 8287397125;
export const INVALID_BOOK_ID = 0;
export const SINGLE_COPY = 1;
export const TWO_COPIES = 2;
export const INVALID_COPIES = 0;
export const INSUFFICIENT_AMOUNT = ethers.utils.parseUnits("9999992210573639493560", 8)