import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import * as fs from "fs";
import { x, config as imtblConfig } from "@imtbl/sdk";
import "dotenv/config"

// configuration variables from .env file
const environment = process.env.IMMUTABLE_ENVIRONMENT === "production"
  ? imtblConfig.Environment.PRODUCTION
  : imtblConfig.Environment.SANDBOX;

const rpcUrl = environment === imtblConfig.Environment.PRODUCTION
  ? process.env.ALCHEMY_RPC_URL_ETHEREUM!
  : process.env.ALCHEMY_RPC_URL_SEPOLIA!;

const privateKey = process.env.PRIVATE_KEY!;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function Transfer() {
  // Set up IMX config
  const config = new x.ProviderConfiguration({ baseConfig: { environment: environment }, });

  // Create the L1 Ethereum signer
  const provider = new JsonRpcProvider(rpcUrl);
  const ethSigner = new Wallet(privateKey).connect(provider);

  // Get the legacy Stark private key
  const starkPrivateKey = await x.generateLegacyStarkPrivateKey(ethSigner); // this gets your your L2 private key
  const starkSigner = x.createStarkSigner(starkPrivateKey); // this creates the signer which lets us sign transactions

  const client = new x.GenericIMXProvider(config, ethSigner, starkSigner);
  const immutableX = new x.ImmutableX(config);

  const csv = "./transfer.csv"; // this is the path to your csv file of addresses
  const fileContent = fs.readFileSync(csv, "utf-8");
  const recipients = fileContent.split("\n");

  for (const recipient of recipients) {
    const transferRequest: x.UnsignedTransferRequest = {
      receiver: recipient.toLowerCase().trim(),
      type: "ETH",
      amount: '100000000000000' // equates to 0.0001 ETH because 1 000 000 000 000 000 000 = 1 ETH
    };
    if (await CheckUserRegistration(immutableX, recipient.trim())) { // validate the user is registered on IMX 
      console.log(
        `Transferring ETH ${transferRequest.amount} wei to address: ${recipient.trim()}`
      );
      await client.transfer(transferRequest)
        .catch((err) => {
          console.log(err)
          console.log(`ERROR: Failed to transfer ETH to: ${recipient.trim()} - Error message: ${err}`)
          fs.appendFileSync('./errors.csv', `ERROR: Failed to transfer ETH to: ${recipient.trim()} - Error message: ${err}` + '\n');
        });
      await delay(500); // optional delay between requests
    } else {
      console.error(`ERROR: address not registered on imx: ${recipient}`);
    }
  }
}

async function CheckUserRegistration(immutableX: x.ImmutableX, address: string): Promise<boolean> {
  try {
    const user = await immutableX.getUser(address.toLowerCase());
    if (user.accounts.length == 0) {
      // IMX returns an empty array if there are no registered accounts for the wallet
      return false;
    } else {
      return true;
    }
  } catch (err) {
    fs.appendFileSync('./unregistered.csv', address + '\n'); // update unregistered with any addresses
    return false;
  }
}

Transfer()
  .then(() => {
    process.exitCode = 1;
  })
  .catch((err) => {
    console.error(err); // Writes to stderr
    process.exitCode = 1;
  })
  .finally(() => process.exit())