import { MigrationInterface, QueryRunner } from "typeorm";

export class DbMigration1794432842355 implements MigrationInterface {
    name = 'DbMigration1794432842355'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "brand" ("id" SERIAL NOT NULL, "name" text NOT NULL, "slug" text NOT NULL, "excerpt" text, "description" text, "mainImage" text NOT NULL, "gallery" jsonb, "status" text NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_f4436285f5d5785c7fb0b28b309" UNIQUE ("slug"), CONSTRAINT "PK_a5d20765ddd942eb5de4eee2d7f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "brand"`);
    }

}
