<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;
use Doctrine\Migrations\Exception\IrreversibleMigration;

final class Version20260913120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Migrates the existing VOGE blog category to Motorrad.';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("UPDATE blog_post SET category = 'Motorrad' WHERE UPPER(category) = 'VOGE'");
    }

    public function down(Schema $schema): void
    {
        throw new IrreversibleMigration('Cannot distinguish migrated posts from posts newly assigned to Motorrad.');
    }
}
