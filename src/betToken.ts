import {
    Connection,
    Keypair,
    clusterApiUrl,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
  } from "@solana/web3.js";
import { getKeypairFromFile } from "@solana-developers/helpers";
import {
  ExtensionType,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  getMintLen,
} from "@solana/spl-token";

import {
  TokenMetadata,
  createInitializeInstruction,
  createUpdateFieldInstruction,
  pack,
} from "@solana/spl-token-metadata";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const payer = await getKeypairFromFile("~/.config/solana/id.json");
console.log("payer public address :", payer.publicKey.toBase58());

const mint = Keypair.generate();
console.log("mint public address :", mint.publicKey.toBase58());

const metadata: TokenMetadata = {
  mint: mint.publicKey,
  name: "CP_BetToken",
  symbol: "CPBT",
  uri: "https://github.com/Aheesh/PC/blob/main/assets/game.json",
  additionalMetadata: [],
};

const mintSpace = getMintLen([ExtensionType.MetadataPointer]);

const metadataSpace = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

const lamports = await connection.getMinimumBalanceForRentExemption(
  mintSpace + metadataSpace
);

const createAccountInstruction = SystemProgram.createAccount({
  fromPubkey: payer.publicKey,
  newAccountPubkey: mint.publicKey,
  space: mintSpace,
  lamports,
  programId: TOKEN_2022_PROGRAM_ID,
});

const initializeMetadataPointerIx = createInitializeMetadataPointerInstruction(
  mint.publicKey,
  payer.publicKey,
  mint.publicKey,
  TOKEN_2022_PROGRAM_ID
);

const initializeMintIx = createInitializeMintInstruction(
  mint.publicKey,
  9, // decimals
  payer.publicKey,
  null,
  TOKEN_2022_PROGRAM_ID
);

const initializeMetadataIx = createInitializeInstruction({
  mint: mint.publicKey,
  metadata: mint.publicKey,
  mintAuthority: payer.publicKey,
  name: metadata.name,
  symbol: metadata.symbol,
  uri: metadata.uri,
  programId: TOKEN_2022_PROGRAM_ID,
  updateAuthority: payer.publicKey,
});

const transaction = new Transaction().add(
  createAccountInstruction,
  initializeMetadataPointerIx,
  initializeMintIx,
  initializeMetadataIx
);

const sig = await sendAndConfirmTransaction(connection, transaction, [
  payer,
  mint,
]);

console.log("Transaction Signature: ", sig);
