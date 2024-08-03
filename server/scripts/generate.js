const { utf8ToBytes } = require("@noble/curves/abstract/utils");
const { secp256k1 } = require("@noble/curves/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { sha256 } = require("@noble/hashes/sha256");

const privateKey =
  "b44d3e42813e29257f1e5945d7b1ae31d5ec6562bb0d64643fd9fd74e17d3b0b";
// const pub = secp256k1.getPublicKey(priv)
let sender =
  "0x036f45cbdfa57ba0440febf1072eb17a5b0bae890ffb9117a2e58bc188462c8ca8";
let amount = 15;
let recipient =
  "0x02d82781f531059192f7086c0f369a4bd3fa779dfde3bb8bb6b0705167fa7b78d8";
const message = `${sender}${amount}${recipient}`;
const messageHash = keccak256(utf8ToBytes(message));

//  create a plain text signature
let signature = secp256k1.sign(messageHash, privateKey);
const { r, s, recovery } = signature;
const signatureString = `r: ${r}, s: ${s}, recovery: ${recovery}`;

console.log(signatureString);
