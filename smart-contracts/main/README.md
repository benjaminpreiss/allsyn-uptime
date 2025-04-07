# RFC3986 URI Endpoint NFTs on Aleo

In the following we outline the requirements to register RFC3986 URI Endpoints to be watched by allsyn.

## Requirements

Users on allsyn need to be able to

-   Anonymously register RFC3986 URIs to be watched by allsyn
-   Continuously (and anonymously) pay for the allsyn service
-   Make updates to already registered URIs whenever you like

### Query capabilities

Queries, that only a user can do (private queries):

-   **Privately list a users active and inactive services:** A user can query his own wallet for the FTs and their balances
-   **Privately list a users balance:** A user can query his own wallet to find the balance for a FT

Public queries:

-   **Publicly list the activity status for each service:** We can publicly list the balance on the smart contract for each FT and determine the status by asking balance > 0

## Protocol design

We design the protocol to use fungible tokens (ERC20 / ARC20 in aleo) to register endpoints that are to be watched and describe which endpoint has been paid for.

### Payment & Activity

We exchange allsyn token to aleo microcreditas at a one-to-one rate.

The public balance on the allsyn smart contract of check cycles determines the current activity of the corresponding check:

-   balance of check cycles > 0: check is active
-   balance of check cycles = 0: check is inactive

This balance can be topped up by each project by a Receipt on the smart contract and paying with allsyn tokens for it.

The balance of the smart contract is defined as the combination of the private author property and it's metadata.

To keep the service running, keep the balance on the smart contract > 0.
Activity can be easily restored for a service by topping up the smart contracts balance in terms of check cycles.

In return to sending allsyn tokens to the smart contract, the sender receives a receipt in form of an NFT that details the amount sent and the FT it was sent for. The time can be deduced from the transaction timestamp.

#### Pricing

So let's say a user wants the following check executed:

-   Checks executed every minute by 1 checker node
-   Check-subject `allsyn.com`
-   check-key: `https`

```
daily checks = 100 (checker nodes) x 60 (hourly checks) x 24 = 144.000 checks
monthly checks (at 30 days) = 4.320.000 checks
```

One check cycle receipt pays for one specific check cycle `(check_subject, check_key)` pair, executed by one checker node.

So to reach a monthly pricing for the above check of 3 dollars at an aleo - dollar value `0.1271 ($ / allsyn token)` the allsyn token value of one check cycle should be:

`check cycle value = 3$ / ( 0.1271 * 10^-6 ) ($ / allsyn token) / 4.320.000 check cycles = 5.463764315 allsyn token / check cycle`.

#### Valuation

We store the current valuation of the token (in respect to aleo credits) in a variable in the smart contract, which can be updated by the allsyn smart contract administrator.

Allsyn wants to offer a stable pricing in a specific currency (e.g. the service should always cost a monthly fee of 3$).
But we normally mint the tokens in exchange for aleo credits.
That means we need to have a dynamic valuation in relation to the aleo credit value to always offer the same price for our tokens in USD e.g.

We define the following rules:

-   **Buy:** A user can buy allsyn tokens at a stable price point, dynamically valuated in relation to aleo tokens. The mint valuation is stored on the smart contract.
-   **Use:** This user can then use the token to pay for the allsyn service. The cost in terms of allsyn tokens is always the same (except allsyn changes pricing).
-   **Sell:** Selling the allsyn token in exchange for aleo credits is made possible through the smart contract but will happen at the current valuation of the token, not the mint valuation. This protects allsyn service from becoming a place for devaluation bets by traders.

### Subscripions

In the future a user can set up subscriptions via token streaming or allowances (the smart contract retrieves the needed amount from the wallet).

### Fungible token properties

The supply of the token shall be unlimited.
The **author** shall be a private property on the NFT (means encrypted on ALEO).
The **metadata** of each NFT shall be perpetually stored on irys and has to be public.
Each fungible token contains metadata that is the 3-tuple of `(alert adress(es), check subject, check keys)`:

-   alert address(es): How to reach you when checks fail? (phone_app alert address which is a second wallet address only for alerting)
-   check subject: RFC3986 URI to be monitored
-   check key(s): which checks to perform (e.g. https, certificate, http page regex).

### Privacy

The owner of a fungible token shall have the option to remain private.
This protects the wallet address from being associated to endpoint data.

### Smart contract capabilities

The smart contract shall contain public data on the historical and current token values. This will be updated by my service every once in a while.

#### Swap token on smart contract

Should a user want to change the properties of a check at any time, he should be able to swap the token balance he has contributed to the smart contract against another token.

To do so, a user has to proove, that the token was minted by him, without revealing his identity.

The smart contract should offer a function that allows him to mint a new token and pay with his share of the balance on the smart contract.

A user proves how much of the nft balance he owns by sending one or more receipt nfts he received for that payment to the smart contract. The smart contract will then send back the remaining balance and possibly a new, corrected NFT receipt with the amount that was spent from the original payment(s) to date.

The swap shall happen at the token evaluation at which the original receipt was minted. That means my service carries the cost of devaluation, if aleo coin looses in value.
