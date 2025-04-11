#!/bin/bash
set -e

# Initialize environment variables
PRIVATE_KEY="APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH"
ENDPOINT="http://0.0.0.0:3030"
WALLET_ADDRESS="aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px"
TOKEN_AMOUNT="10000000u128"

echo "Starting Aleo smart contract deployment and initialization..."

# Step 1: Navigate to the smart contracts directory and build
cd smart-contracts/main
echo "Building smart contract..."
leo build

# Step 2: Deploy the smart contract
echo "Deploying smart contract..."
DEPLOYMENT_OUTPUT=$(leo deploy --endpoint "$ENDPOINT" --private-key "$PRIVATE_KEY")
echo "$DEPLOYMENT_OUTPUT"

# Step 4: Initialize the smart contract
echo "Initializing smart contract..."
leo execute --endpoint "$ENDPOINT" --program "allsyn.aleo" init

# Step 5: Register the allsyn token through the smart contract
echo "Registering allsyn token through smart contract..."
leo execute --endpoint "$ENDPOINT" --program "allsyn.aleo" register_allsyn_token

# Step 6: Mint some tokens and send them to the development wallet
echo "Minting tokens and sending to development wallet..."
leo execute --endpoint "$ENDPOINT" --program "allsyn.aleo" mint_tokens_private "$TOKEN_AMOUNT" "$WALLET_ADDRESS"

echo "Initialization completed successfully!"
