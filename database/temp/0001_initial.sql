-- +goose Up
CREATE TABLE address (id BIGSERIAL PRIMARY KEY, street TEXT, street_number INT);
CREATE TABLE user_addresses (address_id INT, user_id INT);
INSERT INTO address (street, street_number) VALUES ('rue Victor Hugo', 32);
INSERT INTO address (street, street_number) VALUES ('boulevard de la République', 23);
INSERT INTO address (street, street_number) VALUES ('rue Charles Martel', 5);
INSERT INTO address (street, street_number) VALUES ('chemin du bout du monde ', 323);
INSERT INTO address (street, street_number) VALUES ('boulevard de la liberté', 2);
INSERT INTO address (street, street_number) VALUES ('avenue des champs', 12);
INSERT INTO user_addresses (address_id, user_id) VALUES (2, 1);
INSERT INTO user_addresses (address_id, user_id) VALUES (4, 1);
INSERT INTO user_addresses (address_id, user_id) VALUES (2, 2);
INSERT INTO user_addresses (address_id, user_id) VALUES (2, 3);
INSERT INTO user_addresses (address_id, user_id) VALUES (4, 4);
INSERT INTO user_addresses (address_id, user_id) VALUES (4, 5);