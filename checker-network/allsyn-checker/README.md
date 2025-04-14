# allsyn-checker
Allsyn Checker Module

## Description

The allsyn smart contract provides the mappings `active_checks`, `active_checks_reverse` and `active_checks_size`:

- `active_checks` provides a mapping with a simple arithmetic sequence of non-negative integers starting at 0 to the token_id of the check_nft.
- `active_checks_reverse` provides the exact opposite mapping
- `active_checks_size` describes the size of the active_checks mapping.

In a simplified scenario, each checker just picks a random integer between `0` (including) and `active_checks_size` (excluding) to know which `active_checks` index they need to check.

With that index they can retrieve the `nft_commit` (/allsyn check receipt token id)  from the `active_checks` mapping and from that load the check data from irys.

Due to the balances on each check not being updated secondly (or slower than the checker-network schedule), a checker might have to retrieve the balance on a specific check from the smart contract. Then the checker can calculate based on the current time-stamp, whether the balance is still sufficient for a check (or already 0). If the balance is not sufficient, the checker will continuously repeat the above cycle (starting with random integer generation) until a check with sufficient balance is reached. This is work for the future though.


## Development

Install [Zinnia CLI](https://github.com/filecoin-station/zinnia).

```bash
$ # Lint
$ npx lint
$ # Run module
$ zinnia run main.js
$ # Test module
$ zinnia run test.js
```

## Release

On a clean working tree, run the following command:

```bash
$ ./release.sh <semver>
$ # Example
$ ./release.sh 1.0.0
```

Use GitHub's changelog feature to fill out the release notes.

Publish the new release and let the CI/CD workflow upload the sources
to IPFS & IPNS.
