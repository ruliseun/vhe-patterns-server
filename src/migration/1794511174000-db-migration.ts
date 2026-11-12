import { MigrationInterface, QueryRunner } from "typeorm";

export class DbMigration1794511174000 implements MigrationInterface {
    name = 'DbMigration1794511174000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "promo_bar" ("id" SERIAL NOT NULL, "status" text NOT NULL DEFAULT 'INACTIVE', "message" text, "statusUpdatedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_promo_bar" PRIMARY KEY ("id"))`);
        await queryRunner.query(`INSERT INTO "promo_bar" ("status", "message") VALUES ('INACTIVE', NULL)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "promo_bar"`);
    }

}
