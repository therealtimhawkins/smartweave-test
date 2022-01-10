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

const createWallet = async () => {
  const wallet = await arweave.wallets.generate();
  walletAddress = await arweave.wallets.jwkToAddress(wallet);
  await arweave.api.get(`/mint/${walletAddress}/1000000000000000`);

  return wallet;
}

const deployContract = async () => {
  console.log("Deploying contract...");

console.log(initialState);

  const wallet = await createWallet();
  const contractTransacionId = await smartweave.createContract.deploy({
    wallet: wallet,
    initState: initialState,
    src: contractSrc,
  });
  await mine();
  console.log("Contract deployed!");
  return contractTransacionId;
};

const readState = async () => {
  const contractTxId =  await deployContract();
  const state = await smartweave.contract(contractTxId).readState();
  console.log({ state });
};

readState().finally();
