SELECT 'CREATE DATABASE funkos' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'funkosPostgres');
DROP TABLE IF EXISTS "user_roles";
DROP TABLE IF EXISTS "users";

DROP TABLE IF EXISTS "user_roles";
DROP SEQUENCE IF EXISTS user_roles_id_seq;
CREATE SEQUENCE user_roles_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 6 CACHE 1;

CREATE TABLE "public"."user_roles"
(
    "user_id" bigint,
    "role"    character varying(50) DEFAULT 'USER'                       NOT NULL,
    "id"      integer               DEFAULT nextval('user_roles_id_seq') NOT NULL,
    CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "user_roles" ("user_id", "role", "id")
VALUES (1, 'USER', 1),
       (1, 'ADMIN', 2),
       (2, 'USER', 3),
       (3, 'USER', 4),
       (4, 'USER', 5);

DROP TABLE IF EXISTS "users";
DROP SEQUENCE IF EXISTS users_id_seq;
CREATE SEQUENCE users_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 9223372036854775807 START 5 CACHE 1;

CREATE TABLE "public"."users"
(
    "is_deleted" boolean   DEFAULT false                   NOT NULL,
    "created_at" timestamp DEFAULT now()                   NOT NULL,
    "id"         bigint    DEFAULT nextval('users_id_seq') NOT NULL,
    "updated_at" timestamp DEFAULT now()                   NOT NULL,
    "last_name"  character varying(255)                    NOT NULL,
    "email"      character varying(255)                    NOT NULL,
    "name"       character varying(255)                    NOT NULL,
    "password"   character varying(255)                    NOT NULL,
    "username"   character varying(255)                    NOT NULL,
    CONSTRAINT "users_email_key" UNIQUE ("email"),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_username_key" UNIQUE ("username")
) WITH (oids = false);

INSERT INTO "users" ("is_deleted", "created_at", "id", "updated_at", "last_name", "email", "name", "password",
                        "username")
VALUES ('f', '2023-11-02 11:43:24.724871', 1, '2023-11-02 11:43:24.724871', 'Admin Admin', 'admin@prueba.net', 'Admin',
        '$2a$12$e6WyV6XjrtcnNPzY52a3qOagrP4L1f8niUYbeMqAlIxYI.vLOWKm2', 'admin'),
       ('f', '2023-11-02 11:43:24.730431', 2, '2023-11-02 11:43:24.730431', 'User User', 'user@prueba.net', 'User',
        '$2a$12$SelmHkKosAARbNNwp1ua8Ojj.79xeQz7hO19AnARmyKi8YMoXwsaG', 'user'),
       ('f', '2023-11-02 11:43:24.733552', 3, '2023-11-02 11:43:24.733552', 'User2 User2', 'test@prueba.net', 'User2',
        '$2a$12$Q5d.Sr/JghZhcOaUtK057eTTWmNS6g59MKy5InEOQXDJljxKEXdEe', 'user2'),
       ('f', '2023-11-02 11:43:24.736674', 4, '2023-11-02 11:43:24.736674', 'User3 User3', 'otro@prueba.net', 'User3',
        '$2a$12$3Sm1Pl5LZH7YpvCFa9ORlerDk/DY1KKnaRERc11nK7clDUnTMNore', 'user3');

ALTER TABLE ONLY "public"."user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY (user_id) REFERENCES users(id) NOT DEFERRABLE;

