# Allsyn uptime

A web3 uptime monitoring tool based on checker network, irys and aleo.
The term "allsyn" is the swedish word for "allsight".

## The bigger picture

Allsyn should be a web3 monitoring tool with the following properties:

- Decentralized infrastructure tests with checker network
- Private, on-chain registry for domain checks
- Private, on-chain payments for domain checks
- Hack safe alerting system

## Current state

- Basic checks with checker network (only https tests, no port checks as `net` module is not available in `zinnia`)
- Fully private allsyn token and uptime check receipt ownership on aleo, which can be then be used to buy uptime check credits.
- Nft metadata storage on Irys

## Development

This is how you get started:

1. Make sure you have installed all dependencies, noteworthy: `node@22`, `pnpm@10`, `leo`, `snarkOS`, `amaraleo-chain`, `parallel` (gnu parallel)
2. Run `pnpm i` from the root of your project. This will also install `zinnia` for you automatically, depending on your environment. It will require your root password from you.
3. Start a docker environment (e.g. Rancher Desktop or Docker Desktop) on your computer with `docker compose` available (not `docker-compose`!).
4. Make sure you have a solana wallet setup with sufficient devnet credits (e.g. 1 SOL). The app needs this to mint tokens on irys.

Then, to start developing:

1. Setup `.env` file in the root of the project
2. Run node packages from root: `pnpm dev`. This will start the frontend.
3. Initialize chain: `pnpm init-chain-dev`.

### A couple of hints for the initialization of the development repo:

!!! dont have a VPN running, as this will lead to problems with the amareleo-chain intialization

The setup is a little bit fragile currently. I think it is due to amareleo-chain and that `init-chain-dev.sh` is not very smart and doesnt wait for transactions to have gone through before it runs the next.

When running `pnpm init-chain-dev` or `pnpm add-irys` you have the following options:

- Should you run into an error similar to `Failed to fetch program allsyn.aleo: Response[status: 500, status_text: Internal Server Error, url: http://0.0.0.0:3030/testnet/program/allsyn.aleo]`, run the `pnpm init-chain-dev` command again, as this is probably due to the previous transaction not being finalized yet.
- Should you run into an error like `http://0.0.0.0:3030/testnet/block/height/latest: Connection Failed: Connect error: Can't assign requested address (os error 49)`, make sure that your VPN is switched of. Then re-run `pnpm dev` and `pnpm init-chain-dev` or `pnpm add-irys` (whatever you have run that caused the error). You can switch your VPN on again afterwards.
- If nothing helps, restart your computer.
