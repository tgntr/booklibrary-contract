const BookLibrary = artifacts.require("BookLibrary");

module.exports = function(deployer) {
    deployer.deploy(BookLibrary);
};