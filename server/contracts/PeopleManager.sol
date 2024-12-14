// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract PeopleManager {
    struct Person {
        uint256 id;
        string name;
        string imgHash;
        string desc;
    }

    mapping(uint256 => Person) public people;

    uint256 private currentId;

    event PersonAdded(uint256 id, string name, string imgHash, string desc);

    function addPerson(
        string memory name,
        string memory imgHash,
        string memory desc
    ) external {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(imgHash).length > 0, "Image hash cannot be empty");
        require(bytes(desc).length > 0, "Description cannot be empty");

        people[currentId] = Person(currentId, name, imgHash, desc);

        currentId++;

        emit PersonAdded(currentId, name, imgHash, desc);
    }

    function getCurrentId() external view returns (uint256) {
        return currentId;
    }
}
