# Allsyn uptime

A web3 uptime monitoring tool based on checker network.
The term "allsyn" is the swedish word for "allsight".

## Roadmap

1. Setup smart contract (FIL or other chain) for users to mint NFTS that specify which endpoints should be checked
2. Implement checker network checks for endpoints retrieved from minted NFTS
3. Setup a frontend that allows users to
    - Create, Update, Delete, Show the domains
    - Setup a subscription with their credit card to pay for the checks
    - Connect their wallet and privately (wallet address is not publicly visible on chain) mint an NFT. The NFTs they own will specify the domains they want to watch.
    - View their domain uptime status after they have signed in
    - View the transactions made from the allsyn FIL wallet to the checker network wallet for their watched endpoints (endpoints can be set as data points on the transactions)
    - View the domain uptime status via a dedicated dashboard
    - View failed notification attemps to mobile app
4. Setup monthly recurring transactions from allsyn wallet to checker network wallet to cover the infrastructure costs

## Checks

Checker network nodes have multiple responsibilities:

1. Perform checks
2. Alert mobile app if check negative
3. Post check results and (alert confirmation receipt or alert failure) on-chain

## Notification app on phone

There can be a mobile app in the future that allows for alerts to be received.
The mobile app can be paired with the users wallet address (via an NFT) and then issue confirmation receipts on critical alerts.

## Alerting

Alert mobile app on:

-   Missing payment
-   Failed checks

## Privacy

### Private NFT ownership

Users might not want their wallet address to be associatable with a domain that is watched, as that can make them susceptible to more sophisticated attacks that target their wallet. That's why we need private NFT ownership.

Private ownership is possible through aleo.

## Hack resistance

A multi-sig (e.g. safe) wallet could be used to enable hack resistance against wallet hacks. This would give an attacker the power to cancel the uptime check service.

A potential setup: One signature is the wallet itself, while the other signature is a proof of identity done with a passport e.g. (using rariMe or privadoID). This could also be built in to the app itself at a later stage by using the safe sdk.

## Security model

The security model here assumes, that the phone of a user is safe. If the phone is compromised, the alerts might never reach the user via the notifications app.

## Measurements

We have various requirements for measurements:

-   Retrieve certificate details (Can be done in node.js via `net` and `tls` package). If the endpoint does not support TLS, there will be no certificate to store
-   Domain expiry date, if the endpoint contains a Domain (Can be done in node.js with `whois` package)
-   zkproof that the returned data from website contained a keyword and the data was signed by a certain certificate.

## Payment scheme

Leo wallet seems to be the only wallet currently supporting ALEO.
Users can pay with credit cards on the platform or onramp to their wallet.
Should they pay with credit card I can sponsor their fees from my wallet.

1. Connect wallet
2. Fund wallet
    - a) Setup a subscription via stripe (optional). In that case I will fund the money on aleo net to the recipient.
    - or b) Fund wallet yourself
3. Setup allowance / stream on aleo to allsyn wallet (i.e. subscription)
4. Mint NFT for every endpoint that is to be surveilled

## Wallet

It might be best to embed the aleo wallet in the product itself. That way we can get:

-   Passkey, biometrics and proof of identity (e.g. zpass, privadoID, rarimo) support for authentication
-   store seed phrase in randa.mu dcrypt using the above authentication mechanisms -> No recovery needed.
-   This wallet can also be used in combination with notfications as a mobile app to receive alerts.

## Road to MVP 1.0

**Goals**

-   Login to app by signing message on leo wallet - login session is not persisted for now.
-   Setup a simple smart contract on aleo that allows you to mint NFT endpoints.
    -   Expose READ, UPDATE, DELETE functionalities on the frontend for a logged in user
    -   Test the endpoint with a regex before submission
-   Read NFTs from aleo in checker network. Read from test-net in development mode. Perform checks against data from NFTs.

**Notes**

-   The data stored in the NFTs is only the endpoint data.
-   We only check http / https endpoints currently. They will only contain boolean data on whether the check was successful.

## Notes on checker network incentives

Payouts depend on a robust data foundation. How does one know, what the trackrecord of a peer is accurate?

Through random committee selection peers can be selected to execute a specific round of measurements. These peers are then expected to post their measurements in an (ideally decentralized) database.

This database can then be queried (by selecting the peer itself and a random other node) to get the number how many measurements a specific peer has completed and how he was aligned with the other peers on these measurements. The peer needs to prove for each time interval, that he was actually chosen for that time interval. From there payouts can be done, each payout linking to the data-set that was constructed.

## NFTs

-   How to know when an NFT was valid?
-   When can NFTs

1. Users can either mint an NFT themselves or Allsyn smart contract mints it for them and transfers it to their wallet
2. Users sign an allowance for the payouts smart contract that is allowed to either
    - take some aleo balance, mint and transfer an NFT to the

## Development

This is how you get started:

1. Make sure you have installed all dependencies, noteworthy: `node@22`, `pnpm@10`, `leo`, `snarkOS`, `amaraleo-chain`, `parallel` (gnu parallel)
2. Run `pnpm i` from the root of your project. This will also install `zinnia` for you automatically, depending on your environment. It will require your root password from you.
3. Start a docker environment (e.g. Rancher Desktop or Docker Desktop) on your computer with `docker compose` available (not `docker-compose`!).
4. Make sure you have a solana wallet setup with sufficient devnet credits (e.g. 1 SOL). The app needs this to mint tokens on irys.

Then, to start developing:

1. Setup `.env` file in the root of the project
2. Run node packages from root: `pnpm dev`. This will start the frontend.

Optional steps (if not done already):

1. Import private key from amaraleo-chain into leo: `leo account import APrivateKey1zkp8CZNn3yeCseEtxuVPbDCwSyhGW6yZKUYKfgXmcpoGPWH`
2. Setup local smart contract and setup wallet with some test allsync credits: `pnpm init-chain-dev`

### A couple of hints for the initialization of the development repo:

The setup is a little bit fragile currently. I think it is due to amareleo-chain and that `init-chain-dev.sh` is not very smart and doesnt wait for transactions to have gone through before it runs the next.

When running `pnpm init-chain-dev` or `pnpm add-irys` you have the following options:

- Should you run into an error similar to `Failed to fetch program allsyn.aleo: Response[status: 500, status_text: Internal Server Error, url: http://0.0.0.0:3030/testnet/program/allsyn.aleo]`, run the `pnpm init-chain-dev` command again, as this is probably due to the previous transaction not being finalized yet.
- Should you run into an error like `http://0.0.0.0:3030/testnet/block/height/latest: Connection Failed: Connect error: Can't assign requested address (os error 49)`, make sure that your VPN is switched of. Then re-run `pnpm dev` and `pnpm init-chain-dev` or `pnpm add-irys` (whatever you have run that caused the error). You can switch your VPN on again afterwards.
- If nothing helps, restart your computer.
