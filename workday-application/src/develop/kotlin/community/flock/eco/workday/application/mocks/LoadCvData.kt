package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.model.Cv
import community.flock.eco.workday.application.model.CvExperience
import community.flock.eco.workday.application.model.CvLanguage
import community.flock.eco.workday.application.model.CvSkill
import community.flock.eco.workday.application.repository.CvRepository
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.YearMonth

/** Seed CVs in the shape of the Flock CV template, so the CV pages have something to show. */
@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadCvData(
    private val cvRepository: CvRepository,
    private val loadPersonData: LoadPersonData,
    private val loadLogoData: LoadLogoData,
    loadData: LoadData,
) {
    val data: MutableSet<Cv> = mutableSetOf()

    init {
        loadData.load {
            Cv(
                person = loadPersonData.findPersonByUserEmail("tommy@sesam.straat"),
                name = "Algemeen 2025",
                language = CvLanguage.NL,
                place = "Hilversum",
                phone = "0612345678",
                summary =
                    """
                    Tommy Dog is een innovatieve software engineer met een uitgebreide kennis van de nieuwste standaarden en toonaangevende technologieën in de markt. Met meer dan tien jaar ervaring in voornamelijk fullstack engineering heeft hij een goede technische achtergrond.

                    Naast zijn technische werk kan Tommy ook andere taken op zich nemen: communicatie met stakeholders, het bouwen van de continuous delivery pipeline of het leiden van de teams. Dit maakt hem een allround engineer, ideaal voor een agile omgeving.
                    """.trimIndent(),
                experiences =
                    listOf(
                        CvExperience(
                            from = YearMonth.of(2024, 8),
                            role = "Software Engineer",
                            client = "ING",
                            employer = "Flock",
                            logoId = logo("ING"),
                            technologies = listOf("Webcomponents", "Typescript", "MSW", "Wirespec", "Docker", "Playwright", "Storybook"),
                            description =
                                """
                                ING Wholesale Bank is met Flock in zee gegaan om een groot frontend migratieproject uit te voeren voor hun business portal. Flock leverde een team van 5 engineers om deze kritische applicatie te moderniseren. Tommy leidde het project en leverde hands-on engineering.

                                Het project werd op tijd en binnen budget geleverd.

                                https://www.flock.community/cases/ing-front-end-team
                                """.trimIndent(),
                        ),
                        CvExperience(
                            from = YearMonth.of(2020, 6),
                            to = YearMonth.of(2022, 11),
                            role = "Software Engineer",
                            client = "DHL",
                            employer = "Flock",
                            logoId = logo("DHL"),
                            technologies = listOf("Typescript", "React", "MUI", "Java", "Spring Boot", "Postgres", "Kafka", "Azure"),
                            description =
                                """
                                Tommy maakte deel uit van het team dat het medewerkersportaal van DHL bouwde. Tijdens COVID moest DHL meer chauffeurs aannemen, dus werd de applicatie uitgebreid met het volledige onboardingsproces voor nieuwe chauffeurs. Tommy werkte voornamelijk aan de frontend en was betrokken bij het opzetten van de CI/CD-pijplijn.
                                """.trimIndent(),
                        ),
                        CvExperience(
                            from = YearMonth.of(2018, 7),
                            to = YearMonth.of(2020, 3),
                            role = "Tech lead",
                            client = "ING Touchpoint",
                            employer = "Flock",
                            logoId = logo("ING"),
                            technologies = listOf("Webcomponents", "Lit-Html", "Azure"),
                            description =
                                """
                                ING bouwt een wereldwijd bankplatform, ook wel bekend als Touchpoint. Tommy was verantwoordelijk voor drie componenten.
                                1) De web component library.
                                2) Een build-pipeline die teams in staat stelt om apps te bouwen en testen.
                                3) De marktplaats om componenten te delen.
                                """.trimIndent(),
                        ),
                        CvExperience(
                            from = YearMonth.of(2007, 1),
                            to = YearMonth.of(2012, 12),
                            role = "Java engineer",
                            client = "Information Makers",
                        ),
                    ),
                skills =
                    listOf(
                        CvSkill("Programming", "Kotlin", 5),
                        CvSkill("Programming", "Typescript", 5),
                        CvSkill("Programming", "Java", 4),
                        CvSkill("Tools", "Git", 5),
                        CvSkill("Tools", "Docker", 4),
                        CvSkill("Tools", "Playwright", 4),
                        CvSkill("Databases/Event stores", "PostgreSQL", 4),
                        CvSkill("Databases/Event stores", "Kafka", 3),
                        CvSkill("Frameworks", "Spring", 5),
                        CvSkill("Frameworks", "React", 4),
                    ),
                education = "Master, Business Information Management, Rotterdam (2012)\nHBO Bachelor, Information and Communication, Rotterdam (2010)",
                subjects = "IT Security; Identification; Authentication; API",
                languages = "Nederlands – moedertaal\nEngels – uitstekend",
            ).save()

            Cv(
                person = loadPersonData.findPersonByUserEmail("bert@sesam.straat"),
                name = "General",
                language = CvLanguage.EN,
                place = "Hilversum",
                summary = "Bert Muppets is a pragmatic backend engineer who likes his systems the way he likes his paperclips: well organised.",
                experiences =
                    listOf(
                        CvExperience(
                            from = YearMonth.of(2021, 3),
                            role = "Backend engineer",
                            client = "bol.com",
                            employer = "Flock",
                            logoId = logo("bol.com"),
                            technologies = listOf("Kotlin", "Spring Boot", "Kafka"),
                            description = "Bert builds the services behind the order pipeline of the webshop.",
                        ),
                    ),
            ).save()
        }
    }

    private fun logo(name: String) = loadLogoData.findByName(name)?.id

    private fun Cv.save(): Cv =
        cvRepository
            .save(this)
            .also { data.add(it) }
}
