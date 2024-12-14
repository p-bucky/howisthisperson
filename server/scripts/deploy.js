const { ethers } = require("hardhat");

async function main() {
  const PeopleManager = await ethers.getContractFactory("PeopleManager");
  const peopleManager = await PeopleManager.deploy();
  await peopleManager.waitForDeployment();

  console.log(`PeopleManager deployed to: ${peopleManager.target}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
