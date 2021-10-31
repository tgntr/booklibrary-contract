async function shouldThrow(promise, expectedMessage) {
    try {
        await promise;
    }
    catch (err) {
        const actualMessage = err.message.split(':')[3].trim().slice(0, -1);
        assert.equal(actualMessage, expectedMessage)
        return;
    }
    assert(false, "The contract did not throw.");
}
    
module.exports = {
    shouldThrow,
};
    
    