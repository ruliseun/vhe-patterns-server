import { MigrationInterface, QueryRunner } from "typeorm";

export class DbMigration1794481370347 implements MigrationInterface {
    name = 'DbMigration1794481370347'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "custom_print_request" ("id" SERIAL NOT NULL, "firstName" text NOT NULL, "lastName" text NOT NULL, "brand" text, "email" text NOT NULL, "phone" text NOT NULL, "altPhone" text, "service" text NOT NULL, "quantity" integer NOT NULL, "description" text NOT NULL, "references" text, "images" jsonb, "timeline" text NOT NULL, "fabric" text, "budget" text, "message" text, "status" text NOT NULL DEFAULT 'PENDING', "statusUpdatedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_96e2f13057ba7911603d4ffbfea" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "custom_print_request"`);
    }

}
