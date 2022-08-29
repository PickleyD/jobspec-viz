-- +goose Up

ALTER TABLE terra_nodes
    DROP COLUMN fcd_url;


-- +goose Down

ALTER TABLE terra_nodes
    ADD COLUMN fcd_url text CHECK (fcd_url != '');
