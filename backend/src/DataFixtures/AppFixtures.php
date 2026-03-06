<?php

namespace App\DataFixtures;

use App\Entity\AboutPage;
use App\Entity\Bike;
use App\Entity\BlogPost;
use App\Entity\YouTubeVideo;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class AppFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // === BIKES ===
        $vespa = new Bike();
        $vespa->setName('Vespa PX 200')
            ->setSlug('vespa-px-200')
            ->setYear(1983)
            ->setDescription('<p>Meine gute alte Vespa PX 200 – das ist nicht einfach ein Roller, das ist Lebenseinstellung. Gekauft vor Jahren auf einem Flohmarkt, komplett restauriert und seitdem mein treuer Stadtbegleiter. Der Zweitakter bollert, die Schaltung ist hakelig, und genau das liebe ich daran.</p><p>Mit ihr bin ich durch Städte gefahren, die kein Navigationsgerät kennt, habe Schlaglöcher verflucht und Sonnenuntergänge genossen. Kleine Maschine, große Seele.</p>')
            ->setFeaturedImage('https://picsum.photos/seed/vespa/800/600')
            ->setTechnicalData([
                'Motor' => '2-Takt Einzylinder',
                'Hubraum' => '197,97 ccm',
                'Leistung' => '8,4 kW (11,4 PS)',
                'Gewicht' => '118 kg',
                'Höchstgeschwindigkeit' => 'ca. 110 km/h',
                'Getriebe' => '4-Gang Handschaltung',
                'Tank' => '8,5 Liter',
            ])
            ->setGallery([
                'https://picsum.photos/seed/vespa1/400/300',
                'https://picsum.photos/seed/vespa2/400/300',
                'https://picsum.photos/seed/vespa3/400/300',
            ])
            ->setSortOrder(1);

        $voge = new Bike();
        $voge->setName('Voge 900 DSX')
            ->setSlug('voge-900-dsx')
            ->setYear(2023)
            ->setDescription('<p>Die Voge 900 DSX ist mein Abenteurer. Ein chinesisches Motorrad, das ich zunächst skeptisch beäugt habe – und das mich dann komplett überzeugt hat. Kraftvoll, komfortabel, und mit einem Preis-Leistungs-Verhältnis, das europäische Hersteller alt aussehen lässt.</p><p>Mit ihr bin ich durch die Alpen, über Pässe und durch enge Serpentinen. Der Parallel-Twin hat Charakter, der Windschutz hält mich bei Dauerregen trocken, und der Koffer-Träger schluckt alles was ich für eine Woche unterwegs brauche.</p>')
            ->setFeaturedImage('https://picsum.photos/seed/voge/800/600')
            ->setTechnicalData([
                'Motor' => '2-Zylinder Parallel-Twin DOHC',
                'Hubraum' => '895 ccm',
                'Leistung' => '70 kW (95 PS)',
                'Drehmoment' => '87 Nm bei 6500 U/min',
                'Gewicht' => '215 kg (fahrbereit)',
                'Höchstgeschwindigkeit' => 'ca. 200 km/h',
                'Getriebe' => '6-Gang',
                'Tank' => '19 Liter',
                'Fahrwerk' => 'USD-Gabel vorne, Zentralfederbein hinten',
            ])
            ->setGallery([
                'https://picsum.photos/seed/voge1/400/300',
                'https://picsum.photos/seed/voge2/400/300',
                'https://picsum.photos/seed/voge3/400/300',
            ])
            ->setSortOrder(2);

        $indian = new Bike();
        $indian->setName('Indian Scout Bobby')
            ->setSlug('indian-scout-bobby')
            ->setYear(2022)
            ->setDescription('<p>Die Indian Scout Bobber ist das Gegenteil von praktisch – und genau deshalb liebe ich sie. Kein Windschutz, keine Satteltaschen, keine Kompromisse. Reiner, unverstellter Fahrspaß auf amerikanischem V-Twin.</p><p>Sie ist das Motorrad für die Tage, wenn ich keine Route plane und einfach fahre, wohin die Straße führt. Das Klackern des V-Twins, der Klang des Auspuffs – das ist Therapie.</p>')
            ->setFeaturedImage('https://picsum.photos/seed/indian/800/600')
            ->setTechnicalData([
                'Motor' => 'V-Twin, flüssigkeitsgekühlt',
                'Hubraum' => '1133 ccm',
                'Leistung' => '76 kW (103 PS)',
                'Drehmoment' => '98 Nm bei 5900 U/min',
                'Gewicht' => '228 kg (fahrbereit)',
                'Höchstgeschwindigkeit' => 'ca. 195 km/h',
                'Getriebe' => '6-Gang',
                'Tank' => '12,5 Liter',
            ])
            ->setGallery([
                'https://picsum.photos/seed/indian1/400/300',
                'https://picsum.photos/seed/indian2/400/300',
                'https://picsum.photos/seed/indian3/400/300',
            ])
            ->setSortOrder(3);

        $manager->persist($vespa);
        $manager->persist($voge);
        $manager->persist($indian);

        // === BLOG POSTS ===
        $post1 = new BlogPost();
        $post1->setTitle('Über den Brenner – Mit der Voge durch Österreich und Südtirol')
            ->setSlug('brenner-voge-oesterreich-suedtirol')
            ->setExcerpt('Drei Tage, 1.200 Kilometer, unzählige Serpentinen: Meine Alpenüberquerung mit der Voge 900 DSX war ein Abenteuer der besonderen Art.')
            ->setContent('<h2>Tag 1: München nach Innsbruck</h2><p>Früh morgens, noch bevor der erste Kaffee richtig gewirkt hatte, rollte ich aus der Garage. Die Voge stand abfahrbereit, Koffer gepackt, Navi geladen. Ziel: Südtirol. Weg: über den Brenner, denn die Autobahn wollte ich so wenig wie möglich.</p><p>Die Strecke über den Inn war traumhaft. Das Inntal liegt morgens noch im Schatten, während die Berge schon in der Sonne leuchten. An einem kleinen Café in Rattenberg machte ich die erste Pause – frischer Apfelstrudel, starker Espresso, und ein Wirt, der meine Voge bewunderte.</p><h2>Tag 2: Brenner und weiter südwärts</h2><p>Der Brennerpass ist für Motorradfahrer ein Pflichtprogramm. Nicht wegen des Passes selbst – der ist eigentlich enttäuschend unspektakulär – sondern wegen der Strecken drum herum. Ich bog ab auf die alte Brennerstraße, schmale Kurven, keine Trucks, und das Gefühl, durch die Geschichte zu fahren.</p><p>In Bozen dann die erste Nacht. Die Stadt ist eine perfekte Mischung aus österreichisch und italienisch, und das spiegelt sich auch im Essen wider: Knödel mit Rotwein, ja bitte.</p><h2>Tag 3: Dolomiten und Heimweg</h2><p>Den letzten Tag wollte ich den Dolomiten widmen. Der Grödner Joch, der Sellajoch, das Pordoijoch – drei Pässe an einem Tag, das ist Motorradfahren in Reinkultur. Die Voge zog souverän, auch wenn mein Hintern nach 400 Kilometern langsam rebellierte.</p>')
            ->setFeaturedImage('https://picsum.photos/seed/brenner/1200/600')
            ->setYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            ->setPublishedAt(new \DateTime('2024-08-15'))
            ->setCategory('Alpentouren')
            ->setBike($voge)
            ->setImages([
                'https://picsum.photos/seed/brenner1/800/600',
                'https://picsum.photos/seed/brenner2/800/600',
                'https://picsum.photos/seed/brenner3/800/600',
            ])
            ->setIsPublished(true);

        $post2 = new BlogPost();
        $post2->setTitle('Vespa-Alltag: Warum ein Zweitakter die beste Therapie ist')
            ->setSlug('vespa-alltag-zweitakter-therapie')
            ->setExcerpt('Nach einem langen Arbeitstag eine Runde mit der alten PX durch die Stadt – das ist besser als jede Meditation.')
            ->setContent('<h2>Das Ritual</h2><p>Es gibt Abende, da reicht es mir. Büro, Bildschirm, Besprechungen. Dann gehe ich in die Garage, kickstarte die alte PX, und die Welt wird wieder heil.</p><p>Die Vespa PX 200 ist nicht komfortabel. Die Sitzposition ist aufrecht bis zur Schmerzgrenze, der Motor vibriert spürbar, und bei Regen ist man trotz Beinschutz schnell nass. Aber das ist der Punkt: Man ist dabei. Man fährt wirklich, statt nur transportiert zu werden.</p><h2>Technische Eigenheiten</h2><p>Meine PX ist Baujahr 1983 und hat ein Leben hinter sich. Die Lackierung ist Petrol, die Chrom-Teile leuchten nach meiner Aufarbeitung wieder, und der Motor läuft nach einem komplettem Rebuild wie neu.</p><p>Zweitakter haben einen Ruf – laut, verbrauchsintensiv, umweltschädlich. Das stimmt alles. Aber dieser Sound, dieses charakteristische Kreischen beim Hochdrehen, das macht kein moderner Viertakter nach.</p>')
            ->setFeaturedImage('https://picsum.photos/seed/vespa-alltag/1200/600')
            ->setPublishedAt(new \DateTime('2024-07-20'))
            ->setCategory('Vespa')
            ->setBike($vespa)
            ->setIsPublished(true);

        $post3 = new BlogPost();
        $post3->setTitle('Indian Scout Bobber: Erste Ausfahrt, erste Liebe')
            ->setSlug('indian-scout-bobber-erste-ausfahrt')
            ->setExcerpt('Ich war skeptisch. Ein Cruiser, kein Windschutz, amerikanisch. Dann fuhr ich sie – und war verloren.')
            ->setContent('<h2>Warum überhaupt ein Cruiser?</h2><p>Die Frage stellten alle. Ich hatte die Voge für Touren, die Vespa für die Stadt – warum noch ein drittes Motorrad? Die ehrliche Antwort: Weil ich konnte, und weil mich die Indian Scout Bobber einfach nicht losgelassen hat.</p><p>Gesehen hatte ich sie zuerst auf der Intermot. Dieser tiefe Sattel, das pulsierende V-Twin, das Minimalismus-Design ohne Schnörkel. Ich saß drauf, dachte "nein, das kaufe ich nicht" – und kaufte sie drei Monate später.</p><h2>Die erste Ausfahrt</h2><p>Bayern im Oktober, goldene Blätter auf nassen Straßen – keine idealen Bedingungen für ein erstes Kennenlernen. Aber die Indian war geduldig. Der V-Twin zog satt durch aus jeder Drehzahl, der tiefe Schwerpunkt gab Sicherheit, und das Fahrwerk machte mehr aus der Landstraße als ich erwartet hatte.</p><p>Nach hundert Kilometern wusste ich: Sie bleibt.</p>')
            ->setFeaturedImage('https://picsum.photos/seed/indian-first/1200/600')
            ->setYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            ->setPublishedAt(new \DateTime('2024-06-05'))
            ->setCategory('Indian')
            ->setBike($indian)
            ->setImages([
                'https://picsum.photos/seed/indian-first1/800/600',
                'https://picsum.photos/seed/indian-first2/800/600',
            ])
            ->setIsPublished(true);

        $post4 = new BlogPost();
        $post4->setTitle('Wochenendtrip: Schwarzwald mit der Voge')
            ->setSlug('schwarzwald-wochenend-voge')
            ->setExcerpt('Zwei Tage, Schwarzwald, herbstliche Kurvenjagd. Die Voge 900 DSX und ich im perfekten Einklang.')
            ->setContent('<h2>Freitagabend: Aufbruch in die Dunkelheit</h2><p>Eigentlich wollte ich am Samstag früh starten. Aber Freitagabend, nach der Arbeit, stand ich vor der Garage und dachte: Warum nicht jetzt? Koffer schnell gepackt, Straße leer, Schwarzwald wartet.</p><p>Nachts durch den Schwarzwald fahren ist eine andere Erfahrung. Die Scheinwerfer der Voge leuchten den Weg, die Temperatur sinkt in den Kurven ab, und der Wald riecht nach Harz und Herbst. Ich fuhr bis Freiburg, schlechte eine billige Pension und schlief mit dem Zufriedenheitsgefühl eines Menschen, der genau das Richtige getan hat.</p><h2>Samstag: Die Pässe</h2><p>Schauinsland, Belchen, Feldberg – der Schwarzwald hat keine Alpenpässe, aber er hat seine eigene Magie. Enge Straßen, Nebel der sich auflöst, Kühe die kein Anhaltezeichen kennen. Die Voge fühlte sich hier leichter an als in den Alpen, das leichtere Gelände erlaubte eine entspanntere Fahrweise.</p>')
            ->setFeaturedImage('https://picsum.photos/seed/schwarzwald/1200/600')
            ->setPublishedAt(new \DateTime('2024-10-12'))
            ->setCategory('Kurztrip')
            ->setBike($voge)
            ->setIsPublished(true);

        $post5 = new BlogPost();
        $post5->setTitle('Roller-Revival: Die Vespa PX Restaurierung von Null')
            ->setSlug('vespa-px-restaurierung')
            ->setExcerpt('Wie aus einem verrotteten Schrottroller meine schönste Vespa wurde – ein Projekt, das zwei Jahre und viel Geduld brauchte.')
            ->setContent('<h2>Der Fund</h2><p>Ein Flohmarkt in Landsberg am Lech, Sonntagmorgen, zu früh für vernünftige Menschen. Zwischen altem Werkzeug und Gartenmöbeln: Eine Vespa PX. Blau, zerbeult, mit einem gebrochenen Scheinwerfergehäuse und einem Motor, der nach Aussage des Verkäufers "vielleicht noch läuft". Preis: 400 Euro.</p><p>Ich kaufte sie natürlich.</p><h2>Der Rebuild</h2><p>Was folgte waren zwei Jahre Wochenendarbeit in der Garage. Motor komplett zerlegt und überholt, neue Kolben, neue Lager, neue Simmerringe. Karosserie sandgestrahlt, grundiert, in Petrol neu lackiert. Chromteile professionell aufgearbeitet.</p><p>Der schwierigste Teil war die Elektrik – PX-Elektrik ist für sich schon ein eigenes Universum. Aber nach Wochen hatte ich alles verstanden, alles erneuert, und sie lief.</p><h2>Das Ergebnis</h2><p>Heute ist sie meine liebste Vespa. Nicht weil sie die schnellste oder komfortabelste ist, sondern weil jeder Millimeter dieser Restaurierung mein Werk ist. Wenn ich kickstarte und der Motor anspringt, ist das mein Motor, den ich zum Leben erweckt habe.</p>')
            ->setFeaturedImage('https://picsum.photos/seed/vespa-restore/1200/600')
            ->setPublishedAt(new \DateTime('2024-05-01'))
            ->setCategory('Vespa')
            ->setBike($vespa)
            ->setImages([
                'https://picsum.photos/seed/restore1/800/600',
                'https://picsum.photos/seed/restore2/800/600',
                'https://picsum.photos/seed/restore3/800/600',
                'https://picsum.photos/seed/restore4/800/600',
            ])
            ->setIsPublished(true);

        $manager->persist($post1);
        $manager->persist($post2);
        $manager->persist($post3);
        $manager->persist($post4);
        $manager->persist($post5);

        // === YOUTUBE VIDEOS ===
        $video1 = new YouTubeVideo();
        $video1->setTitle('Brenner-Überquerung mit der Voge 900 DSX – komplettes Onboard-Video')
            ->setYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            ->setThumbnail('https://picsum.photos/seed/yt1/640/360')
            ->setPublishedAt(new \DateTime('2024-08-20'))
            ->setBike($voge);

        $video2 = new YouTubeVideo();
        $video2->setTitle('Indian Scout Bobber: Sound-Check und erste Eindrücke')
            ->setYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            ->setThumbnail('https://picsum.photos/seed/yt2/640/360')
            ->setPublishedAt(new \DateTime('2024-06-10'))
            ->setBike($indian);

        $video3 = new YouTubeVideo();
        $video3->setTitle('Vespa PX Restaurierung: Vorher-Nachher')
            ->setYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            ->setThumbnail('https://picsum.photos/seed/yt3/640/360')
            ->setPublishedAt(new \DateTime('2024-05-10'))
            ->setBike($vespa);

        $manager->persist($video1);
        $manager->persist($video2);
        $manager->persist($video3);

        // === ABOUT PAGE ===
        $about = new AboutPage();
        $about->setContent('<h2>Wer ist der Krawallbruder?</h2><p>Ich bin Jens, Mitte vierzig, aus München – und Motorräder sind meine Leidenschaft, seit ich alt genug war, um einen Führerschein zu machen.</p><p>Angefangen hat alles mit einer geerbten Vespa meines Onkels. Ein altes Ding, das kaum fuhr und ständig kaputt war. Aber statt sie zu verkaufen, habe ich sie repariert. Und dann nochmal. Und wieder. Und irgendwann konnte ich einen Zweitakter auseinandernehmen und wieder zusammenbauen, ohne Anleitung.</p><p>Der YouTube-Kanal "Krawallbruder" entstand aus der Idee, das zu zeigen, was die meisten Motorrad-Channels auslassen: Das Alltägliche, das Unperfekte, die kaputten Pläne und die improvisierten Lösungen. Keine gesponserten Motorräder, keine PR-Touren – nur ich, meine Maschinen, und die Straße.</p><h2>Meine Philosophie</h2><p>Motorradfahren ist kein Lifestyle. Es ist eine Haltung. Man sitzt auf einem Motorrad nicht um gut auszusehen, sondern um zu fahren. Der Wind, die Kurven, die Freiheit – das kann man nicht durch bessere Ausrüstung kaufen, das muss man erleben.</p><p>Ich fahre alte Vespas und moderne Enduros. Ich fahre alleine und im Konvoi. Ich fahre im Regen und manchmal auch dann, wenn ich es besser nicht sollte. Und ich schreibe darüber – ehrlich, direkt, ohne Schminke.</p><h2>Kontakt</h2><p>Feedback, Tourvorschläge oder einfach ein Hallo: <a href="mailto:hallo@krawallbruder.de">hallo@krawallbruder.de</a></p>')
            ->setProfileImage('https://picsum.photos/seed/portrait/400/400')
            ->setStats([
                'touren' => 47,
                'km' => 38500,
                'laender' => 9,
                'jahre' => 22,
            ]);

        $manager->persist($about);
        $manager->flush();
    }
}
