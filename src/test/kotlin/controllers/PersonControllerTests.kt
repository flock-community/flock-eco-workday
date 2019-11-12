package community.flock.eco.workday.controllers

import community.flock.eco.workday.services.PersonService
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.boot.test.mock.mockito.MockBean
import org.springframework.http.MediaType
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultHandlers.print
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders

@RunWith(SpringRunner::class)
@WebMvcTest(PersonController::class)
@ContextConfiguration
class PersonControllerTests(
        /* if added here error is raised:
        *  java.lang.Exception: Test class should have exactly one public zero-argument constructor
        *  I do not understand since the official guide of spring kotlin does add variables here.
        */
//        private val mvc: MockMvc
) {
    private val baseUrl: String = "/api/person"

    // Added the Autowiring of the mvc inside the class and initialized before running tests in @Before
    // otherwise I get not initialized errors, understandably.
    @Autowired
    lateinit var mvc: MockMvc

    @MockBean
    lateinit var service: PersonService

    // I do understand why the initialization does need to take place, but I do not understand the code really tbh.
    // simply instantiate with something that doesn't throws errors. It works somehow I guess. SpringMagic™
    @Before
    fun setup() {
        this.mvc = MockMvcBuilders.standaloneSetup(PersonController(service)).build()
    }

    @Test
    /* Anyhow with this setup I get it running until it fails with another error.
    *  java.lang.IllegalStateException: Failed to load ApplicationContext
    *
    *  I do see that it is mentioned what I should do: Consider defining a bean named 'entityManagerFactory' in your configuration.
    *  and Parameter 0 of constructor in community.flock.eco.workday.Application required a bean named 'entityManagerFactory' that could not be found.
    *  I do not understand where this entityManagerFactory comes from and why I need to implement it
    *  further I cannot find the configurations anywhere.
    */
    fun `should return an empty list in json response object`() {
        mvc.perform(get(baseUrl).accept(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk)
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("\$.length").value(1)) // expectedValue should be 0 to pass the test
    }

    @Test
    fun `should return an error while trying to get a non-existing person via GET-request`() {}

    @Test
    fun `should return an error while trying to update a non-existing person via PUT-method`() {}

    @Test
    fun `should return a 404 http status while trying to delete a non-existing person via DELETE-method`() {}
}
