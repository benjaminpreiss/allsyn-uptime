#!/bin/bash
set -e

# Load environment variables from .env file
if [ -f .env ]; then
    set -a
    source .env
    set +a
else
    echo "Error: .env file not found."
    exit 1
fi

# Array of required environment variables
required_vars=("ALEO_ADMIN_ADDRESS" "ALEO_ADMIN_PRIVATE_KEY" "ALEO_CHAIN_ENDPOINT" "ALEO_USER_ADDRESS")

# Check if each required environment variable is set
for var in "${required_vars[@]}"; do
    if [[ -z "${!var}" ]]; then
        echo "Error: ${var} environment variable is not set."
        exit 1
    fi
done

# Initialize environment variables
NETWORK=1
BROADCAST_URL="$ALEO_CHAIN_ENDPOINT/testnet/transaction/broadcast"
TOKEN_AMOUNT="10000000u128"
WAIT_DURATION=10

echo "Injecting env variables into aleo smart contract..."

# Path to the template file
TEMPLATE_FILE="./smart-contracts/main/src/main.leo.template"
# Path for the output file
OUTPUT_FILE="./smart-contracts/main/src/main.leo"

# Use envsubst to perform variable substitution and generate the output file
envsubst '$ALEO_ADMIN_ADDRESS $ALEO_ADMIN_PRIVATE_KEY $ALEO_CHAIN_ENDPOINT $ALEO_USER_ADDRESS' < "$TEMPLATE_FILE" > "$OUTPUT_FILE"

# Check the success status and print a message
if [[ $? -eq 0 ]]; then
    echo "Successfully generated $OUTPUT_FILE from $TEMPLATE_FILE."
else
    echo "Failed to generate $OUTPUT_FILE."
    exit 1
fi

echo "Starting Aleo smart contract deployment and initialization..."

# Step 1: Navigate to the smart contracts directory and build
cd smart-contracts/main
echo "Building smart contract..."
leo build

# Step 1a: Create directory for dependency deploys within smart-contracts/main and copy necessary files
echo "Creating directory for dependency deploys within smart-contracts/main and copying necessary files..."
mkdir -p dependency-deploys/imports
cp build/imports/token_registry.aleo dependency-deploys/main.aleo
cp build/imports/credits.aleo dependency-deploys/imports/

# Step 1b: Change into dependency-deploys and deploy token_registry
cd dependency-deploys
echo "Deploying token_registry.aleo..."
snarkos developer deploy \
    --query "$ALEO_CHAIN_ENDPOINT" \
    --network "$NETWORK" \
    --broadcast "$BROADCAST_URL" \
    --private-key "$ALEO_ADMIN_PRIVATE_KEY" \
    --priority-fee 10000 token_registry.aleo
echo "Waiting for $WAIT_DURATION seconds after deploying token_registry.aleo..."
sleep $WAIT_DURATION

# Step 2: Navigate back to the main build directory and deploy the smart contract
cd ../build
echo "Deploying main smart contract allsyn.aleo..."
DEPLOYMENT_OUTPUT=$(snarkos developer deploy \
    --query "$ALEO_CHAIN_ENDPOINT" \
    --network "$NETWORK" \
    --broadcast "$BROADCAST_URL" \
    --private-key "$ALEO_ADMIN_PRIVATE_KEY" \
    --priority-fee 10000 allsyn.aleo)
echo "$DEPLOYMENT_OUTPUT"
echo "Waiting for $WAIT_DURATION seconds after deploying allsyn.aleo..."
sleep $WAIT_DURATION

# Step 4: Initialize the smart contract
echo "Initializing smart contract..."
snarkos developer execute \
    --query "$ALEO_CHAIN_ENDPOINT" \
    --network "$NETWORK" \
    --broadcast "$BROADCAST_URL" \
    --private-key "$ALEO_ADMIN_PRIVATE_KEY" \
    --priority-fee 10000 allsyn.aleo init
echo "Waiting for $WAIT_DURATION seconds after initializing smart contract..."
sleep $WAIT_DURATION

# Step 5: Register the allsyn token through the smart contract
echo "Registering allsyn token through smart contract..."
snarkos developer execute \
    --query "$ALEO_CHAIN_ENDPOINT" \
    --network "$NETWORK" \
    --broadcast "$BROADCAST_URL" \
    --private-key "$ALEO_ADMIN_PRIVATE_KEY" \
    --priority-fee 10000 allsyn.aleo register_allsyn_token
echo "Waiting for $WAIT_DURATION seconds after registering the allsyn token..."
sleep $WAIT_DURATION

# Step 6: Mint some tokens and send them to the development wallet
echo "Minting tokens and sending to development wallet..."
snarkos developer execute \
    --query "$ALEO_CHAIN_ENDPOINT" \
    --network "$NETWORK" \
    --broadcast "$BROADCAST_URL" \
    --private-key "$ALEO_ADMIN_PRIVATE_KEY" \
    --priority-fee 10000 allsyn.aleo mint_tokens_private "$TOKEN_AMOUNT" "$ALEO_USER_ADDRESS"
echo "Waiting for $WAIT_DURATION seconds after minting tokens..."
sleep $WAIT_DURATION

echo "Initialization completed successfully!"
