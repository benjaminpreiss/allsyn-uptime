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
    - View failed notification attemps to mobile app
4. Setup monthly recurring transactions from allsyn wallet to checker network wallet to cover the infrastructure costs

## Checks

Checker network nodes have multiple responsibilities:

1. Perform checks
3. Alert mobile app if check negative
2. Post check results and (alert confirmation receipt or alert failure) on-chain

## Notification app on phone

There can be a mobile app in the future that allows for alerts to be received.
The mobile app can be paired with the users wallet address (via an NFT) and then issue confirmation receipts on critical alerts.

## Alerting

Alert mobile app on:
- Missing payment
- Failed checks

## Privacy

### Private NFT ownership

Users might not want their wallet address to be associatable with a domain that is watched, as that can make them susceptible to more sophisticated attacks that target their wallet. That's why we need private NFT ownership.

## Hack resistance

A multi-sig (e.g. safe) wallet could be used to enable hack resistance against wallet hacks. This would give an attacker the power to cancel the uptime check service.

A potential setup: One signature is the wallet itself, while the other signature is a proof of identity done with a passport e.g. (using rariMe or privadoID). This could also be built in to the app itself at a later stage by using the safe sdk.

## Security model

The security model here assumes, that the phone of a user is safe. If the phone is compromised, the alerts might never reach the user via the notifications app.
