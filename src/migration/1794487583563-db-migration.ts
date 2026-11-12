import { MigrationInterface, QueryRunner } from "typeorm";

export class DbMigration1794487583563 implements MigrationInterface {
    name = 'DbMigration1794487583563'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "blog_post" ("id" SERIAL NOT NULL, "title" text NOT NULL, "slug" text NOT NULL, "excerpt" text, "content" text NOT NULL, "mainImage" text NOT NULL, "status" text NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7a1f994eda1ad6e18788ca90b9e" UNIQUE ("slug"), CONSTRAINT "PK_694e842ad1c2b33f5939de6fede" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "blog_post"`);
    }

}
