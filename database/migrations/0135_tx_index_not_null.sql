-- +goose Up

UPDATE log_broadcasts SET tx_index=-1 WHERE tx_index IS NULL;
ALTER TABLE log_broadcasts ALTER COLUMN tx_index SET NOT NULL;


-- +goose Down

ALTER TABLE log_broadcasts ALTER COLUMN tx_index DROP NOT NULL;

