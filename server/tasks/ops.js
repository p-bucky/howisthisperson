const { task } = require("hardhat/config");

task("add-person", "Add Person").setAction(async function (
  taskArguments,
  { ethers }
) {
  const peopleManagerFactory = await ethers.getContractFactory("PeopleManager");
  const peopleManager = await peopleManagerFactory.attach(
    "0x3e093d83B7cc3B14Caa12817D89D34713d327E23"
  );
  const tx = await peopleManager.addPerson("Prashant", "#1", "good guy");
  console.log(tx);
});

task("get-person", "Get Person").setAction(async function (
  taskArguments,
  { ethers }
) {
  const peopleManagerFactory = await ethers.getContractFactory("PeopleManager");
  const peopleManager = await peopleManagerFactory.attach(
    "0x3e093d83B7cc3B14Caa12817D89D34713d327E23"
  );
  const tx = await peopleManager.people(0);
  console.log(tx);
});
