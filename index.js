const fs = require("fs");
const path = require("path");
const Arweave = require("arweave");
const { SmartWeaveNodeFactory } = require("redstone-smartweave");

const mine = () => arweave.api.get("mine");

const arweave = Arweave.init({
  host: "localhost",
  port: 1984,
  protocol: "http",
});

const smartweave = SmartWeaveNodeFactory.memCached(arweave);

const contractSrc = fs.readFileSync(
  path.join(__dirname, "./contract.js"),
  "utf8"
);

const initialState = fs.readFileSync(
  path.join(__dirname, "./initial-state.json"),
  "utf8"
);

const wallet = fs.readFileSync(path.join(__dirname, "./wallet.json"));

const deployContract = async () => {
  console.log("Deploying contract...");
  const contractTransacionId = await smartweave.createContract.deploy({
    wallet: JSON.parse(wallet.toString()),
    initState: initialState,
    src: contractSrc,
  });
  fs.writeFileSync("./transactionId.json", { contractTransacionId });
  await mine();
  console.log("Contract deployed!");
};

const getContract = async () => {
  const transactionId = getTransactionId();
  return smartweave.contract(transactionId).connect(wallet);
};

const getTransactionId = () => {
  const { contractTransacionId } = JSON.parse(
    fs.readFileSync("./transactionId.json").toString()
  );
  return contractTransacionId;
};

const readState = async () => {
  const contract = await getContract();
  const state = await contract.readState();
  console.log({ state });
};

readState();
