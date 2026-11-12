import { MigrationInterface, QueryRunner } from "typeorm";

export class DbMigration1794507740000 implements MigrationInterface {
    name = 'DbMigration1794507740000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "guest_session" ("id" uuid NOT NULL, "lastActiveAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_guest_session" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart_item" ("id" SERIAL NOT NULL, "cartId" integer NOT NULL, "designId" integer NOT NULL, "license" text NOT NULL, "colorChanges" integer NOT NULL DEFAULT '0', "unitPrice" integer NOT NULL, "colorChangeFee" integer NOT NULL DEFAULT '0', "selected" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cart_item_config" UNIQUE ("cartId", "designId", "license", "colorChanges"), CONSTRAINT "PK_cart_item" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cart" ("id" SERIAL NOT NULL, "guestSessionId" uuid NOT NULL, "status" text NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cart" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_cart_active_session" ON "cart" ("guestSessionId") WHERE "status" = 'ACTIVE'`);
        await queryRunner.query(`ALTER TABLE "cart_item" ADD CONSTRAINT "FK_cart_item_cart" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_item" ADD CONSTRAINT "FK_cart_item_design" FOREIGN KEY ("designId") REFERENCES "design"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart" ADD CONSTRAINT "FK_cart_guest_session" FOREIGN KEY ("guestSessionId") REFERENCES "guest_session"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart" DROP CONSTRAINT "FK_cart_guest_session"`);
        await queryRunner.query(`ALTER TABLE "cart_item" DROP CONSTRAINT "FK_cart_item_design"`);
        await queryRunner.query(`ALTER TABLE "cart_item" DROP CONSTRAINT "FK_cart_item_cart"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_cart_active_session"`);
        await queryRunner.query(`DROP TABLE "cart"`);
        await queryRunner.query(`DROP TABLE "cart_item"`);
        await queryRunner.query(`DROP TABLE "guest_session"`);
    }

}
