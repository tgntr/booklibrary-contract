// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract BookLibraryToken is ERC20PresetMinterPauser {
	constructor() ERC20PresetMinterPauser("BookLibraryToken", "BLT") {
	}
}