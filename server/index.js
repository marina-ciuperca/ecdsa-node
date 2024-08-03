const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { secp256k1 } = require("@noble/curves/secp256k1");
const { utf8ToBytes } = require("@noble/curves/abstract/utils");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { sha256 } = require("@noble/hashes/sha256");

app.use(cors());
app.use(express.json());

const balances = {
  "0x036f45cbdfa57ba0440febf1072eb17a5b0bae890ffb9117a2e58bc188462c8ca8": 100,
  "0x038ef3dc09a375d21f5a4c0cb5479ff56bb9d65ed4568b5018012adaef0b7c8aad": 50,
  "0x02d82781f531059192f7086c0f369a4bd3fa779dfde3bb8bb6b0705167fa7b78d8": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    return res.status(400).send({ message: "Not enough funds!" });
  }

  // Example signature string format expected from the user
  const expectedFormat =
    "r: <r_value>, s: <s_value>, recovery: <recovery_value>";
  let regex = /r:\s*(\d+),\s*s:\s*(\d+),\s*recovery:\s*(\d+)/;
  let match = signature.match(regex);

  if (!match) {
    return res.status(400).send({ message: "Invalid signature format" });
  }

  // Extract and convert the values
  const [_, rStr, sStr, recoveryStr] = match;

  const signatureObject = {
    r: BigInt(rStr),
    s: BigInt(sStr),
    recovery: parseInt(recoveryStr),
  };

  const message = `${sender}${amount}${recipient}`;
  const messageHash = keccak256(utf8ToBytes(message));
  const publicKey = sender.slice(2); // Assuming `sender` is the public key with '0x' prefix

  const isValid = secp256k1.verify(signatureObject, messageHash, publicKey);

  if (!isValid) {
    return res.status(400).send({ message: "Not authorized" });
  }

  balances[sender] -= amount;
  balances[recipient] += amount;
  res.send({ balance: balances[sender] });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
