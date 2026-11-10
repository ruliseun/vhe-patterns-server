import { MigrationInterface, QueryRunner } from "typeorm";

export class DbMigration1794347876225 implements MigrationInterface {
    name = 'DbMigration1794347876225'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" text NOT NULL, "slug" text NOT NULL, "description" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70" UNIQUE ("slug"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "design" ("id" SERIAL NOT NULL, "title" text NOT NULL, "slug" text NOT NULL, "description" text, "mainImage" text NOT NULL, "colorVariations" jsonb, "exclusivePrice" integer NOT NULL, "nonExclusivePrice" integer NOT NULL, "status" text NOT NULL DEFAULT 'ACTIVE', "flag" text DEFAULT 'recent', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "categoryId" integer, CONSTRAINT "UQ_9e748c1f4c88284c793e392648d" UNIQUE ("slug"), CONSTRAINT "PK_e7a44f12414f03b7f38ff26dc8c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "design" ADD CONSTRAINT "FK_648513c440e1550f589babd4acc" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "design" DROP CONSTRAINT "FK_648513c440e1550f589babd4acc"`);
        await queryRunner.query(`DROP TABLE "design"`);
        await queryRunner.query(`DROP TABLE "category"`);
    }

}
