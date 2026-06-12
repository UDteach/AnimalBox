# AnimalBox Market And Exchange Architecture

## Scope

Market and exchange are future online features. The current prototype should stay local-first until auth, moderation, inventory ledgers, and abuse rules are designed.

Paid gacha remains out of scope. Premium gifts mean higher-cost earned tickets, not real money.

## Cloudflare Shape

- Static app: Cloudflare Pages serves the Vite build.
- API: Pages Functions expose inventory, listing, and exchange endpoints.
- Database: D1 stores catalog rows, user inventory, gacha grants, market listings, trade offers, and immutable ledger events.
- Atomic exchange: Durable Objects own short-lived trade/listing sessions so accept/cancel/expire cannot double-spend the same item.
- Assets: R2 can store future generated item images if runtime assets become user-specific. For now, item ids point to versioned catalog assets in the build.

Official docs checked:

- Cloudflare Pages Functions: https://developers.cloudflare.com/pages/functions/
- Cloudflare D1: https://developers.cloudflare.com/d1/
- Cloudflare Durable Objects: https://developers.cloudflare.com/durable-objects/
- Cloudflare R2: https://developers.cloudflare.com/r2/

## Data Model Draft

`catalog_items`

- `item_id`
- `kind`: `decor`, `wearable`, `float`, `background`, `pose`, `animal`
- `slot`: nullable, for accessories
- `rarity`: `common`, `rare`, `special`, `event`
- `trade_state`: `bound`, `tradeable`, `event_locked`
- `asset_src`
- `created_at`, `retired_at`

`user_inventory`

- `inventory_id`
- `user_id`
- `item_id`
- `source`: `starter`, `tap_coin_unlock`, `level_ticket`, `gift`, `event`, `trade`
- `locked_until`
- `created_at`

`inventory_ledger`

- append-only event rows: grant, duplicate-shard conversion, list, unlist, trade-lock, trade-complete, trade-cancel
- used for support/audit and to rebuild suspicious inventory states

`market_listings`

- listing id, seller id, inventory id, ask type, ask amount, state, expiration
- D1 row is the durable record; a Durable Object coordinates one active listing's transitions.

`trade_offers`

- proposer, receiver, offered inventory ids, requested inventory ids, state, expiration
- acceptance locks both sides through Durable Object coordination before D1 commit.

## Rarity Rules

- `common`: normal ticket pool, low duplicate shards, tradeable after a cooldown.
- `rare`: normal/premium earned-ticket pool, higher duplicate shards, tradeable after longer cooldown.
- `special`: premium earned-ticket/event pool, tradeable only when catalog flag allows.
- `event`: time-limited, usually bound until event rerun policy is decided.

## MVP Sequence

1. Keep all unlocks local in `PrototypeSave` until auth exists.
2. Add catalog fields now in TypeScript so rarity/source/trade flags are explicit.
3. When online save starts, write every grant through a server endpoint and ledger event.
4. Add read-only Market browse first.
5. Add listing/offer only after Durable Object escrow and abuse limits are tested.

## Stop Conditions

Do not ship exchange until these exist:

- login identity
- server-owned inventory grants
- append-only ledger
- duplicate-spend tests
- reporting/blocking policy for social features
- rate limits and item cooldowns
