<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260308091357 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE about_page (id UUID NOT NULL, content TEXT NOT NULL, profile_image VARCHAR(512) DEFAULT NULL, stats JSON DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE TABLE bike (id UUID NOT NULL, name VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, year INT NOT NULL, description TEXT NOT NULL, featured_image VARCHAR(512) DEFAULT NULL, technical_data JSON DEFAULT NULL, gallery JSON DEFAULT NULL, sort_order INT DEFAULT 0 NOT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_4CBC3780989D9B62 ON bike (slug)');
        $this->addSql('CREATE TABLE blog_post (id UUID NOT NULL, title VARCHAR(255) NOT NULL, slug VARCHAR(255) NOT NULL, excerpt TEXT DEFAULT NULL, content TEXT NOT NULL, featured_image VARCHAR(512) DEFAULT NULL, youtube_url VARCHAR(512) DEFAULT NULL, published_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, category VARCHAR(100) DEFAULT NULL, images JSON DEFAULT NULL, is_published BOOLEAN DEFAULT true NOT NULL, bike_id UUID DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_BA5AE01D989D9B62 ON blog_post (slug)');
        $this->addSql('CREATE INDEX IDX_BA5AE01DD5A4816F ON blog_post (bike_id)');
        $this->addSql('CREATE TABLE you_tube_video (id UUID NOT NULL, title VARCHAR(255) NOT NULL, youtube_url VARCHAR(512) NOT NULL, thumbnail VARCHAR(512) DEFAULT NULL, published_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, bike_id UUID DEFAULT NULL, PRIMARY KEY (id))');
        $this->addSql('CREATE INDEX IDX_A2451540D5A4816F ON you_tube_video (bike_id)');
        $this->addSql('ALTER TABLE blog_post ADD CONSTRAINT FK_BA5AE01DD5A4816F FOREIGN KEY (bike_id) REFERENCES bike (id)');
        $this->addSql('ALTER TABLE you_tube_video ADD CONSTRAINT FK_A2451540D5A4816F FOREIGN KEY (bike_id) REFERENCES bike (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE blog_post DROP CONSTRAINT FK_BA5AE01DD5A4816F');
        $this->addSql('ALTER TABLE you_tube_video DROP CONSTRAINT FK_A2451540D5A4816F');
        $this->addSql('DROP TABLE about_page');
        $this->addSql('DROP TABLE bike');
        $this->addSql('DROP TABLE blog_post');
        $this->addSql('DROP TABLE you_tube_video');
    }
}
