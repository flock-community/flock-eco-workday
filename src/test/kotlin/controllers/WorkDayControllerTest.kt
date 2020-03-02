package community.flock.eco.workday.controllers

import community.flock.eco.feature.user.model.User
import community.flock.eco.workday.Application
import community.flock.eco.workday.authorities.WorkDayAuthority
import community.flock.eco.workday.forms.WorkDayForm
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.services.WorkDayService
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType.APPLICATION_JSON
import org.springframework.http.MediaType.APPLICATION_JSON_UTF8
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [Application::class])
@AutoConfigureMockMvc
@ActiveProfiles(profiles = ["test"])
@Import(CreateHelper::class)
class WorkDayControllerTest {

    private val baseUrl: String = "/api/workdays"

    @Autowired
    private lateinit var mvc: MockMvc

    @Autowired
    private lateinit var createHelper: CreateHelper

    @Autowired
    private lateinit var workDayService: WorkDayService

    val adminAuthorities = setOf(WorkDayAuthority.READ, WorkDayAuthority.WRITE, WorkDayAuthority.ADMIN)
    val workerAuthorities = setOf(WorkDayAuthority.READ, WorkDayAuthority.WRITE)

    @Test
    fun `admin should get all workdays from a single user`() {

        val user = createHelper.createUser(adminAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 3, 31)
        val client = createHelper.createClient()
        val person = createHelper.createPerson()
        val assignment = createHelper.createAssignment(client, person, from, to)

        val createForm = WorkDayForm(
            from = from,
            to = to,
            assignmentCode = assignment.code,
            hours = 50
        )

        val workDay = workDayService.create(createForm)

        mvc.perform(get("$baseUrl?personCode=${person.code}")
            .with(user(UserSecurity(user)))
            .accept(APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON_UTF8))
    }

    class UserSecurity(val user: User) : UserDetails {
        override fun getAuthorities() = user.authorities.map { SimpleGrantedAuthority(it) }
        override fun isEnabled() = user.enabled
        override fun getUsername() = user.code
        override fun getPassword() = null
        override fun isCredentialsNonExpired() = true
        override fun isAccountNonExpired() = true
        override fun isAccountNonLocked() = true
    }

}
