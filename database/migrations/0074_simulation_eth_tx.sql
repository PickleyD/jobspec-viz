-- +goose Up

ALTER TABLE eth_txes ADD COLUMN IF NOT EXISTS simulate bool NOT NULL DEFAULT FALSE;


-- +goose Down

ALTER TABLE eth_txes DROP COLUMN simulate;

