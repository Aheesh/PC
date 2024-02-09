import { getKeypairFromFile } from "@solana-developers/helpers";
import {
  ExtensionType,
  LENGTH_SIZE,
  TOKEN_2022_PROGRAM_ID,
  TYPE_SIZE,
  createInitializeMetadataPointerInstruction,
  createInitializeMintInstruction,
  getMintLen,
  getTokenMetadata,
} from "@solana/spl-token";
import {
  TokenMetadata,
  createInitializeInstruction,
  createUpdateFieldInstruction,
  pack,
} from "@solana/spl-token-metadata";
import {
  Connection,
  Keypair,
  clusterApiUrl,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const payer = await getKeypairFromFile("~/.config/solana/id.json");
console.log("payer public address :", payer.publicKey.toBase58());

//Keypair for the mint
const mint = Keypair.generate();
console.log("mint public address :", mint.publicKey.toBase58());

//Token metadata
const metadata: TokenMetadata = {
  mint: mint.publicKey,
  name: "CP_Token",
  symbol: "CPT",
  uri: "https://github.com/Aheesh/PC/blob/main/assets/game.json",
  additionalMetadata: [
    ["Player1_FIDE_ID", "1503014"],
    ["Player1_FIDE_RANK", "2818"],
    ["Player1_Name", "Magnus Carlsen"],
    ["Player2_FIDE_ID", "24130737"],
    ["Player2_FIDE_RANK", "2716"],
    ["Player2_Name", "Vladimir Fedoseev"],
  ],
};

const mintSpace = getMintLen([ExtensionType.MetadataPointer]);

const metadataSpace = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

const lamports = await connection.getMinimumBalanceForRentExemption(
  mintSpace + metadataSpace
);

//Create Account Instruction
const createAccountIx = SystemProgram.createAccount({
  fromPubkey: payer.publicKey,
  newAccountPubkey: mint.publicKey,
  space: mintSpace,
  lamports,
  programId: TOKEN_2022_PROGRAM_ID,
});

//Initialize MetadataPointer Instruction
const initializeMetadataPointerIx = createInitializeMetadataPointerInstruction(
  mint.publicKey,
  payer.publicKey,
  mint.publicKey,
  TOKEN_2022_PROGRAM_ID
);

//Initialize Mint Instruction
const initializeMintIx = createInitializeMintInstruction(
  mint.publicKey,
  0, //Decimals
  payer.publicKey,
  null, //Freeze Authority
  TOKEN_2022_PROGRAM_ID
);

//Inititalize Metadata Instruction
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

//Initialize additional token metadata Instruction player1_FIDE_ID
const updateMetadataField0 = createUpdateFieldInstruction({
  metadata: mint.publicKey,
  programId: TOKEN_2022_PROGRAM_ID,
  updateAuthority: payer.publicKey,
  field: metadata.additionalMetadata[0][0],
  value: metadata.additionalMetadata[0][1],
});

//Initialize additional token metadata Instruction player1_FIDE_RANK
const updateMetadataField1 = createUpdateFieldInstruction({
  metadata: mint.publicKey,
  programId: TOKEN_2022_PROGRAM_ID,
  updateAuthority: payer.publicKey,
  field: metadata.additionalMetadata[1][0],
  value: metadata.additionalMetadata[1][1],
});

//Initialize additional token metadata Instruction player1_Name
const updateMetadataField2 = createUpdateFieldInstruction({
  metadata: mint.publicKey,
  programId: TOKEN_2022_PROGRAM_ID,
  updateAuthority: payer.publicKey,
  field: metadata.additionalMetadata[2][0],
  value: metadata.additionalMetadata[2][1],
});

//Initialize additional token metadata Instruction player2_FIDE_ID
const updateMetadataField3 = createUpdateFieldInstruction({
  metadata: mint.publicKey,
  programId: TOKEN_2022_PROGRAM_ID,
  updateAuthority: payer.publicKey,
  field: metadata.additionalMetadata[3][0],
  value: metadata.additionalMetadata[3][1],
});

//Initialize additional token metadata Instruction player2_FIDE_RANK
const updateMetadataField4 = createUpdateFieldInstruction({
  metadata: mint.publicKey,
  programId: TOKEN_2022_PROGRAM_ID,
  updateAuthority: payer.publicKey,
  field: metadata.additionalMetadata[4][0],
  value: metadata.additionalMetadata[4][1],
});

//Initialize additional token metadata Instruction player2_Name
const updateMetadataField5 = createUpdateFieldInstruction({
  metadata: mint.publicKey,
  programId: TOKEN_2022_PROGRAM_ID,
  updateAuthority: payer.publicKey,
  field: metadata.additionalMetadata[5][0],
  value: metadata.additionalMetadata[5][1],
});

//Transaction

const transaction = new Transaction().add(
  createAccountIx,
  //Order of instructions is important metadataPointer should be initialized first followed by mint and MintIX
  initializeMetadataPointerIx,
  initializeMintIx,
  initializeMetadataIx,
  updateMetadataField0,
  updateMetadataField1,
  updateMetadataField2,
  updateMetadataField3,
  updateMetadataField4,
  updateMetadataField5
);

const sig = await sendAndConfirmTransaction(connection, transaction, [
  payer,
  mint,
]);

console.log("Transaction Signature: ", sig);

const chainMetadata = await getTokenMetadata(connection, mint.publicKey);

console.log("Token extension additional Metadata: ", chainMetadata);
