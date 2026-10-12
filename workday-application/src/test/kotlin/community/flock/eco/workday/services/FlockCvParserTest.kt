package community.flock.eco.workday.services

import community.flock.eco.workday.application.forms.CvExperienceForm
import community.flock.eco.workday.application.forms.CvSkillForm
import community.flock.eco.workday.application.model.CvLanguage
import community.flock.eco.workday.application.services.FlockCvParser
import org.junit.jupiter.api.Test
import java.time.YearMonth
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

class FlockCvParserTest {
    // Shaped like the text PDFBox extracts from a CV in the Flock template: zero-width
    // spaces after the labels, a header and footer on every page, ragged whitespace.
    private val zws = "​"

    private val text =
        """
        Curriculum Vitae - Tommy Dog

        Name Tommy Dog
        Place Hilversum
        Phone 0612345678
        Mail tommy@sesam.straat
        Date of birth 08-05-1980

        Tommy Dog is een innovatieve software engineer met een uitgebreide kennis van de
        nieuwste standaarden in de markt.

        Naast zijn technische werk kan Tommy ook andere taken op zich nemen.

        Working experience

        Period Function Months employer/ client
        08-2024 - now Software Engineer 8 ING (via Flock.)
        06-2020 - 11-2022 Software Engineer 19 DHL (via Flock.)
        03-2020 - 06-2020 Tech lead 9 Cartotool (via Flock.)
        03-2016 - 12-2017 Lead engineer 7 ING Mobile (via Capgemini.)
        01-2007 - 12-2012 Java engineer 60 Information makers employer

        Tommy Dog$zws page 1$zws

        Curriculum Vitae - Tommy Dog
        Period$zws 08-2024 - nu
        Client$zws ING (via Flock.)
        Role$zws Software Engineer
        Technologie$zws Webcomponents, Typescript, MSW

        ING is met Flock in zee gegaan om een groot frontend
        migratieproject uit te voeren.

        Meer over deze opdracht:
        https://www.flock.community/cases/ing-front-end-team

        Period$zws 06-2020 - 11-2022
        Client$zws DHL (via Flock.)
        Role$zws Software Engineer
        Technologies$zws Typescript, React, Kafka

        Tommy werkte aan het medewerkersportaal. Het team leverde:
        1) De web component library.
        2) Een build-pipeline.

        Tommy Dog$zws page 2$zws

        Curriculum Vitae - Tommy Dog
        Period$zws 07-2018 - 09-2019
        Client$zws Cartotool (via Flock.)
        Role$zws Tech lead
        Technologies$zws React, PostGIS

        Een dataplatform voor demografische informatie.

        Period $zws 03-2016 - 12-2017
        Employer$zws ING Mobile
        Role$zws Lead engineer
        Technologies$zws Ionic, Angular

        Cordova in de app van ING geïntegreerd.

        Tommy Dog$zws page 3$zws

        Curriculum Vitae - Tommy Dog
        Skills
        Programming  Tools
        Java  Git
        Kotlin  Fitnesse
        Databases/Event stores Kibana
        Education
        Master, Business Information Management, Rotterdam (2012) HBO Bachelor, Information and
        Communication, Rotterdam (2010)
        Subjects
        IT Security ; Identification ; API ;
        Language
        Dutch – Native
        English –  Excellent

        Tommy Dog$zws page 4$zws
        """.trimIndent()

    private val parsed = FlockCvParser.parse(text)

    @Test
    fun `reads the personal details`() {
        assertEquals("Tommy Dog", parsed.name)
        assertEquals("Hilversum", parsed.place)
        assertEquals("0612345678", parsed.phone)
        assertEquals("tommy@sesam.straat", parsed.email)
        assertTrue(parsed.summary!!.startsWith("Tommy Dog is"), "the date of birth is no part of the profile")
    }

    @Test
    fun `reads the profile text as paragraphs`() {
        assertEquals(
            "Tommy Dog is een innovatieve software engineer met een uitgebreide kennis van de nieuwste standaarden in de markt.\n\n" +
                "Naast zijn technische werk kan Tommy ook andere taken op zich nemen.",
            parsed.summary,
        )
    }

    @Test
    fun `recognises the language the CV is written in`() {
        assertEquals(CvLanguage.NL, parsed.language)
        assertEquals(
            CvLanguage.EN,
            FlockCvParser.parse("Name Tommy Dog\n\nTommy is an engineer with a passion for the craft and the people.").language,
        )
    }

    @Test
    fun `reads every assignment block, newest first, with the employer from the client`() {
        val (ing, dhl, cartotool, ingMobile, informationMakers) = parsed.experiences
        assertEquals(5, parsed.experiences.size)

        assertEquals(
            CvExperienceForm(
                from = YearMonth.of(2024, 8),
                to = null,
                role = "Software Engineer",
                client = "ING",
                employer = "Flock",
                technologies = listOf("Webcomponents", "Typescript", "MSW"),
                description =
                    "ING is met Flock in zee gegaan om een groot frontend migratieproject uit te voeren.\n\n" +
                        "Meer over deze opdracht:\nhttps://www.flock.community/cases/ing-front-end-team",
            ),
            ing,
        )
        assertEquals(YearMonth.of(2022, 11), dhl.to)
        assertEquals(listOf("Typescript", "React", "Kafka"), dhl.technologies)
        assertEquals(
            "Tommy werkte aan het medewerkersportaal. Het team leverde:\n1) De web component library.\n2) Een build-pipeline.",
            dhl.description,
        )

        // The block wins over a table row that disagrees about the period
        assertEquals(YearMonth.of(2018, 7), cartotool.from)
        assertEquals(YearMonth.of(2019, 9), cartotool.to)
        assertEquals("Tech lead", cartotool.role)

        // An "Employer" block takes the employer from its row in the overview table
        assertEquals("ING Mobile", ingMobile.client)
        assertEquals("Capgemini", ingMobile.employer)
        assertEquals(listOf("Ionic", "Angular"), ingMobile.technologies)

        // A row without a block of its own still becomes an experience
        assertEquals(
            CvExperienceForm(
                from = YearMonth.of(2007, 1),
                to = YearMonth.of(2012, 12),
                role = "Java engineer",
                client = "Information makers",
            ),
            informationMakers,
        )
    }

    @Test
    fun `reads education, subjects and languages, and keeps the skills matrix out of the text`() {
        assertEquals(
            "Master, Business Information Management, Rotterdam (2012) HBO Bachelor, Information and Communication, Rotterdam (2010)",
            parsed.education,
        )
        assertEquals("IT Security ; Identification ; API ;", parsed.subjects)
        assertEquals("Dutch – Native\nEnglish – Excellent", parsed.languages)
        assertEquals("Cordova in de app van ING geïntegreerd.", parsed.experiences[3].description)
    }

    @Test
    fun `leaves headers and footers out of the text`() {
        val everything = listOfNotNull(parsed.summary) + parsed.experiences.mapNotNull { it.description }
        assertTrue(everything.none { it.contains("Curriculum Vitae") || it.contains("page") })
    }

    @Test
    fun `reads a Dutch CV with Dutch labels`() {
        val dutch =
            FlockCvParser.parse(
                """
                Curriculum Vitae - Ieniemienie Mouse
                Naam Ieniemienie Mouse
                Woonplaats Amsterdam
                Telefoon 0687654321
                E-mail ieniemienie@sesam.straat

                Ieniemienie is een engineer die van de details houdt.

                Werkervaring

                Periode Functie Maanden Opdrachtgever
                01-2023 - nu Software engineer 12 NS (via Flock)

                Periode 01-2023 - nu
                Klant NS (via Flock)
                Rol Software engineer
                Technologieën Kotlin, Spring Boot

                Bouwde de reisplanner.
                """.trimIndent(),
            )

        assertEquals("Ieniemienie Mouse", dutch.name)
        assertEquals("Amsterdam", dutch.place)
        assertEquals("0687654321", dutch.phone)
        assertEquals("ieniemienie@sesam.straat", dutch.email)
        assertEquals(CvLanguage.NL, dutch.language)
        assertEquals(
            listOf(
                CvExperienceForm(
                    from = YearMonth.of(2023, 1),
                    role = "Software engineer",
                    client = "NS",
                    employer = "Flock",
                    technologies = listOf("Kotlin", "Spring Boot"),
                    description = "Bouwde de reisplanner.",
                ),
            ),
            dutch.experiences,
        )
    }

    @Test
    fun `ignores the header and footer the browser prints on every page`() {
        val printed =
            FlockCvParser.parse(
                """
                09/10/2026, 10:30 CV Tommy Dog NL
                Curriculum Vitae - Tommy Dog
                Name Tommy Dog
                Place Hilversum

                Tommy is an engineer.
                https://workday.flock.community/cvs/123 1/2
                09/10/2026, 10:30 CV Tommy Dog NL
                Period 01-2023 - now
                Client NS (via Flock)
                Role Software engineer

                Built the journey planner.
                https://workday.flock.community/cvs/123 2/2
                """.trimIndent(),
            )

        assertEquals("Hilversum", printed.place)
        assertEquals("Tommy is an engineer.", printed.summary)
        assertEquals("Built the journey planner.", printed.experiences.single().description)
    }

    @Test
    fun `reads the variant of the template with month names, page numbers and rated skills`() {
        val variant =
            FlockCvParser.parse(
                """
                Curriculum Vitae - Pino Woodpecker
                Name:$zws Pino Woodpecker
                Place: Utrecht
                Telephone: 06 12345678
                Date of Birth: 01-01-1990

                Pino is a proactive engineer who is recognized for bringing clarity to the code.

                Work experience
                Period Job Title Months Client/Company
                07-2025 - current Senior Fullstack Engineer 13 FLOCK - Bol.com
                11-2024 - 07-2025 Senior Fullstack Engineer 8 FLOCK - ING
                12-2017 - 06-2019 Medior Software Engineer 17 DVJ Insight, Utrecht
                1
                Curriculum Vitae - Pino Woodpecker
                Period: July 2025 - present
                Client: Bol.com
                Role: Fullstack Engineer
                Technologies: Kotlin, React

                Built the supplier portal.

                Period: March 2025 - July 2025
                Client: ING, Amsterdam (via Flock.)
                Role: Fullstack Engineer
                Technologies: Lit web components, Typescript, Azure DevOps,
                Docker, Storybook

                Migrated the business portal.
                2
                Period: December 2024 - maart 2025
                Client: ING, Amsterdam (via Flock.)
                Role: Senior Software Engineer
                Technologies: Docker, Bash

                Made the platform run locally.

                Education
                ● Msc. Applied Cognitive Psychology, Leiden
                September 2016 — February 2017
                ● Bsc. Psychology, Utrecht University
                Training
                ● Scrum certified
                Technologies
                ● React ***** 
                ● Angular ****
                Languages
                ● Dutch *****
                3
                """.trimIndent(),
            )

        assertEquals("Utrecht", variant.place)
        assertEquals("06 12345678", variant.phone)
        assertEquals("Pino is a proactive engineer who is recognized for bringing clarity to the code.", variant.summary)
        assertEquals(CvLanguage.EN, variant.language)

        // The table rows of Bol.com and ING are the blocks; the one of DVJ has none
        assertEquals(
            listOf(
                CvExperienceForm(
                    from = YearMonth.of(2025, 7),
                    role = "Fullstack Engineer",
                    client = "Bol.com",
                    technologies = listOf("Kotlin", "React"),
                    description = "Built the supplier portal.",
                ),
                CvExperienceForm(
                    from = YearMonth.of(2025, 3),
                    to = YearMonth.of(2025, 7),
                    role = "Fullstack Engineer",
                    client = "ING, Amsterdam",
                    employer = "Flock",
                    technologies = listOf("Lit web components", "Typescript", "Azure DevOps", "Docker", "Storybook"),
                    description = "Migrated the business portal.",
                ),
                CvExperienceForm(
                    from = YearMonth.of(2024, 12),
                    to = YearMonth.of(2025, 3),
                    role = "Senior Software Engineer",
                    client = "ING, Amsterdam",
                    employer = "Flock",
                    technologies = listOf("Docker", "Bash"),
                    description = "Made the platform run locally.",
                ),
                CvExperienceForm(
                    from = YearMonth.of(2017, 12),
                    to = YearMonth.of(2019, 6),
                    role = "Medior Software Engineer",
                    client = "DVJ Insight, Utrecht",
                ),
            ),
            variant.experiences,
        )
        assertEquals(
            listOf(CvSkillForm(name = "React", level = 5), CvSkillForm(name = "Angular", level = 4)),
            variant.skills,
        )
        assertEquals(
            "Msc. Applied Cognitive Psychology, Leiden September 2016 — February 2017\nBsc. Psychology, Utrecht University\n\nTraining\nScrum certified",
            variant.education,
        )
        assertEquals("Dutch *****", variant.languages)
    }

    @Test
    fun `finds nothing in text that is not a CV`() {
        val parsed = FlockCvParser.parse("Invoice 2024-001\nTotal 12,50")
        assertTrue(parsed.isEmpty())
        assertNull(parsed.name)
        assertTrue(parsed.experiences.isEmpty())
    }
}
