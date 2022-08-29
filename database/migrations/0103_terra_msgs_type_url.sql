-- +goose Up

ALTER TABLE terra_msgs ADD COLUMN type text NOT NULL DEFAULT '/terra.wasm.v1beta1.MsgExecuteContract';


-- +goose Down

ALTER TABLE terra_msgs DROP COLUMN type;

