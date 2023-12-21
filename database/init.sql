SELECT 'CREATE DATABASE funkos_tienda_api' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'funkos');

DROP TABLE IF EXISTS 'funkos';
DROP TABLE IF EXISTS 'categories';

CREATE SEQUENCE funkos_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 5 CACHE 1;
CREATE TABLE "public"."funkos"
(
    id          bigint    DEFAULT NEXTVAL('funkos_id_seq') NOT NULL,
    name        character varying(255)                     NOT NULL,
    price       DECIMAL   DEFAULT '0.0',
    quantity    integer   DEFAULT '0',
    image       TEXT      DEFAULT 'image.png',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP        NOT NULL,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP        NOT NULL,
    is_deleted  BOOLEAN   DEFAULT FALSE                    NOT NULL,
    category_id UUID                                       NOT NULL,
    CONSTRAINT funkos_pkey PRIMARY KEY ("id")
) WITH (
      OIDS = FALSE
      );
INSERT INTO "funkos" (id, name, price, quantity, image, created_at, updated_at, is_deleted, category_id)
VALUES (1, 'Funko 1', 10.0, 10, 'imagen.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false,
        'd69cf3db-b77d-4181-b3cd-5ca8107fb6a9'),
       (2, 'Funko 2', 10.0, 10, 'imagen.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false,
        'd69cf3db-b77d-4181-b3cd-5ca8107fb6a8'),
       (3, 'Funko 3', 10.0, 10, 'imagen.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false,
        'd69cf3db-b77d-4181-b3cd-5ca8107fb6a7'),
       (4, 'Funko 4', 10.0, 10, 'imagen.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false,
        'd69cf3db-b77d-4181-b3cd-5ca8107fb6a6');



CREATE TABLE "public"."categories"
(
    id           UUID                                NOT NULL,
    name         CHARACTER VARYING(255)              NOT NULL,
    "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_active    BOOLEAN   DEFAULT TRUE              NOT NULL,
    CONSTRAINT categories_pkey PRIMARY KEY ("id"),
    CONSTRAINT "categories_name_key" UNIQUE ("name")
) with (
      OIDS = FALSE
      );
INSERT INTO "categories" ("id", "name", "created_at", "updated_at", "is_active")
VALUES ('d69cf3db-b77d-4181-b3cd-5ca8107fb6a9', 'DISNEY', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),
       ('d69cf3db-b77d-4181-b3cd-5ca8107fb6a8', 'MARVEL', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),
       ('d69cf3db-b77d-4181-b3cd-5ca8107fb6a7', 'DC', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true),
       ('d69cf3db-b77d-4181-b3cd-5ca8107fb6a6', 'OTROS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, true);

alter table funkos
    add constraint fk_category_id foreign key (category_id) references categories (id);
