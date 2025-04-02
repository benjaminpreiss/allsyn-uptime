# Allsyn uptime

A web3 uptime monitoring tool based on checker network.
The term "allsyn" is the swedish word for "allsight".

## Roadmap

1. Setup smart contract (FIL or other chain) for users to mint NFTS that specify which endpoints should be checked
2. Implement checker network checks for endpoints retrieved from minted NFTS
3. Setup a frontend that allows users to
    - Create, Update, Delete, Show the domains
    - Setup a subscription with their credit card to pay for the checks
    - Connect their wallet and privately (wallet address is not publicly visible on chain) mint an NFT. The NFTs they own will specify the domains they want to watch. Private ownership is possible through aleo.
    - View their domain uptime status after they have signed in
    - View the transactions made from the allsyn FIL wallet to the checker network wallet for their watched endpoints (endpoints can be set as data points on the transactions)
    - View the domain uptime status via a dedicated dashboard
4. Setup monthly recurring transactions from allsyn wallet to checker network wallet to cover the infrastructure costs

## Privacy

### Private NFT ownership

Users might not want their wallet address to be associatable with a domain that is watched, as that can make them susceptible to more sophisticated attacks that target their wallet. That's why we need private NFT ownership.
