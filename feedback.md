# Testing

- Looks good
- Unit tests cannot have a constructors you have to use @Autowire
- When using spring you have to add some extra annotations
````
@RunWith(SpringRunner::class)
@ContextConfiguration(classes = [UserConfiguration::class])
@DataJpaTest
@AutoConfigureTestDatabase
````
- A UnitTest always has suffix 'Test' not 'Tests'  this makes that surfire plugin can find them
- Nice you use MockMvc
- There are some Annotations missing for the controller test like `@AutoConfigureMockMvc`
- Rest full endpoints are always plural `/api/persons`
