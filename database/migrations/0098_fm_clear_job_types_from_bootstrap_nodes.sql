-- +goose Up

UPDATE feeds_managers
SET job_types = '{}'
WHERE is_ocr_bootstrap_peer AND array_length(job_types, 1) > 0;


-- +goose Down



