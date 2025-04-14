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
required_vars=("ALEO_ADMIN_ADDRESS" "ALEO_USER_PRIVATE_KEY" "ALEO_CHAIN_ENDPOINT" "ALEO_USER_ADDRESS")

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

# Check the success status and print a message
if [[ $? -eq 0 ]]; then
    echo "Successfully generated $OUTPUT_FILE from $TEMPLATE_FILE."
else
    echo "Failed to generate $OUTPUT_FILE."
    exit 1
fi

echo "Minting receipt..."
snarkos developer execute \
    --query "$ALEO_CHAIN_ENDPOINT" \
    --network "$NETWORK" \
    --broadcast "$BROADCAST_URL" \
    --private-key "$ALEO_USER_PRIVATE_KEY" \
    --priority-fee 10000 allsyn.aleo mint_private_receipt \
        "{
          owner: aleo1s3ws5tra87fjycnjrwsjcrnw2qxr8jfqqdugnf0xzqqw29q9m5pqem2u4t.private,
          amount: 10000000u128.private,
          token_id: 12736872field.private,
          external_authorization_required: false.private,
          authorized_until: 0u32.private,
          _nonce: 8123085266098961832719584703119690211324871253953510195035594958868262961142group.public
        }" \
        "aleo1s3ws5tra87fjycnjrwsjcrnw2qxr8jfqqdugnf0xzqqw29q9m5pqem2u4t" \
        "100u64" \
        "230867001151037650101159673870871542737u128" \
        "310636350053971838204925215406708058609u128" \
        "1166361486445601628865019934670571889718946669077620974963023976486173097653scalar" \
        "{ significand: 5463764315u64, neg_exponent: 9u8 }"
