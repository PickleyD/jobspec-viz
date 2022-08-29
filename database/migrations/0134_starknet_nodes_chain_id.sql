-- +goose Up

ALTER TABLE starknet_nodes RENAME COLUMN chain_id TO starknet_chain_id;


-- +goose Down

ALTER TABLE starknet_nodes RENAME COLUMN starknet_chain_id TO chain_id;

