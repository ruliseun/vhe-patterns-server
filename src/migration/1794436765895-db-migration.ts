import { MigrationInterface, QueryRunner } from "typeorm";

export class DbMigration1794436765895 implements MigrationInterface {
    name = 'DbMigration1794436765895'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "contact_request" ("id" SERIAL NOT NULL, "firstName" text NOT NULL, "lastName" text NOT NULL, "email" text NOT NULL, "phone" text, "company" text, "brand" text, "message" text, "status" text NOT NULL DEFAULT 'PENDING', "reply" text, "repliedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d74ea9b4efcf950e4f98d14b173" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "contact_request"`);
    }

}
