# Immutable X Transfers

This script is designed to be a code example for processing multiple transfers of ETH on the Immutable X network. 

## Disclaimer

This script is not PRODUCTION ready code. Do not run this script without first verifying what it does. You will need to configure the script for your usage scenario before running.

## Prerequisites

1. Make sure you have [node]('https://nodejs.org/en/) installed. Use version 18.x
2. Install typescript with the command `npm install -g typescript`
3. Install the @imtbl/sdk with `npm install`

## Running

1. Copy the `.env.example` file into a `.env` file and add / replace with the following configuration
2. Add your [Alchemy](https://alchemy.com) API Keys to the RPC URLs for Sepolia and Ethereum
3. Update the Environment variable ('sandbox' / 'production') that you want to run the script against('sandbox' - Sepolia, 'production' - Ethereum).
4. Add the PRIVATE_KEY of the wallet that you want to transfer from - WARNING do not share this variable with anyone
5. Validate the amount of ETH you want to send denominated in wei (line 43) - remember 1000000000000000000 = 1 ETH 
6. Validate the addresses you want ETH to be sent to (transfer.csv)
7. Begin the transfer by running the command `npm run transfer`
8. Any transfer receipients that are not registered with Immutable X will be listed in unregistered.csv. No ETH will have been transferred to these addresses.

## Recommendations

1. Test the script in the 'sandbox' environment first and transfer to a few test wallets that are registered with Immutable X. 
2. You can register test wallets with Immutable X by going to https://market.sandbox.immutable.com and connecting with your test wallet.
