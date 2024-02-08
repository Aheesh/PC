import { getKeypairFromFile } from "@solana-developers/helpers";
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const payer = await getKeypairFromFile("~/.config/solana/id.json");
console.log("payer public address :", payer.publicKey.toBase58());

//Keypair for the mint
const mint = Keypair.generate();
console.log("mint public address :", mint.publicKey.toBase58());
