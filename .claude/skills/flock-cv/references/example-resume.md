# Example resume

The reference for how a rewritten resume should read (see "Writing style" in `SKILL.md`): a profile
that opens with a one-line summary of the person, third person throughout, and every assignment
written as STAR paragraphs (Situation, Task, Action, Result) without bullet points. Only the
metadata lines under each assignment heading are a list; in Workday those are the experience's
fields (period, client, role, technologies), not part of the `description`.

## Profile

**A hands-on Senior Fullstack Engineer who turns complex systems into clear, dependable software, fast.**
Cees is a proactive and energetic engineer recognized for bringing clarity to complex challenges. He combines this with a pragmatic approach to deliver swift, effective solutions, making him a reliable and impactful team player who excels in collaborative environments.

As a Senior Fullstack Engineer with 9 years of experience, he possesses deep expertise in the e-commerce sector, custom integrations and plugins, and API integrations. He specializes in architecting and building robust distributed microservices architectures using Java and Kotlin with Spring Boot, while also creating dynamic user interfaces with React and Angular. A strong advocate for CI/CD, he leverages Docker and Kubernetes to ensure high availability and system reliability across the entire development lifecycle.

## Work Experience

| Period | Job Title | Months | Client / Company |
|---|---|---|---|
| 07-2025 – current | Senior Fullstack Engineer | 13 | FLOCK – Bol.com |
| 11-2024 – 07-2025 | Senior Fullstack Engineer | 8 | FLOCK – ING |
| 11-2023 – 11-2024 | Senior Fullstack Engineer | 12 | Osiris, Amsterdam |
| 11-2021 – 11-2023 | Senior Backend Engineer | 24 | Osiris, Amsterdam |
| 06-2019 – 11-2021 | Senior Backend Engineer | 29 | Dutch National Police (via Capgemini) |
| 12-2017 – 06-2019 | Medior Software Engineer | 17 | DVJ Insight, Utrecht |

---

### Bol.com

- **Period:** July 2025 – present
- **Client:** Bol.com
- **Role:** Fullstack Engineer
- **Technologies:** Kotlin, React, Spring Boot, Microservices

Bol.com's supplier portal required a new application to ensure compliance with the upcoming EUDR compliance law. Additionally, the team faced challenges with a backlog of code debt and older applications built with Angular, which hindered development efficiency and developer experience.

Cees's primary task was to lead the development of the new EUDR compliance application. Concurrently, he was responsible for migrating existing Angular applications to React and implementing Storybook to streamline the developer workflow and improve overall developer experience.

For the EUDR compliance application, Cees designed and implemented the full-stack solution using Kotlin for the backend and React for the frontend. This involved gathering requirements, architecting the system, and developing robust and scalable code. In parallel, he initiated and managed the migration effort from Angular to React for several legacy applications.

The new EUDR compliance application was successfully developed and deployed, ensuring Bol.com's adherence to the new legal requirements. The migration from Angular to React significantly reduced technical debt, improved application performance, and modernized the supplier portal's codebase.

---

### ING – Insight Business Portal

- **Period:** March 2025 – July 2025
- **Client:** ING, Amsterdam (via Flock)
- **Role:** Senior Software Engineer
- **Technologies:** Lit web components, TypeScript, Azure DevOps, Docker, Storybook, Playwright

ING Wholesale bank needed to migrate their Insight business portal away from outdated AngularJS to new web components aligned with their ING-WEB architecture. Cees's team tackled challenges of poor documentation and testability by establishing a robust API specification for safer data exchange.

The team also used Storybook to create a well-documented component library which was used both for testing purposes as well as being able to quickly iterate over the developed components.

The team leveraged the local Docker environment Cees had created in his previous assignment at ING, which made end-to-end testing accessible and dramatically shortened development loops. His role concluded with helping to ensure a seamless handover of the software to the existing ING squads.

---

### ING – Local Development Environment

- **Period:** December 2024 – March 2025
- **Client:** ING, Amsterdam (via Flock)
- **Role:** Senior Software Engineer
- **Technologies:** Docker, Azure ACR, Azure DevOps, Bash, Python, Java, Spring Boot

ING Wholesale Bank was experiencing issues with the availability and stability of its test and acceptance environments. The hypothesis was that the local development environment was inadequate, forcing engineers to test software earlier on the shared environments. This resulted in unstable test and acceptance environments.

Flock was brought in by ING to improve the local setup by making all components available through a `docker compose` setup. This required that all components were made available via Docker and supported on all platforms (x86/ARM), so that engineers could test the complete environment on their own laptops. The ultimate goal is to also be able to run full integration tests within the build pipeline.

Cees worked together with a colleague from Flock on this short-term assignment. They built the Platform Integration Kit and worked closely with the ING team responsible for this. Within four weeks, they delivered the first results and had an Azure Pipeline that made all applications (Java, Spring Boot) available on all architectures (x86/ARM) in the Azure Container Registry (ACR). After three months they succeeded in creating a flexible Docker workflow, giving developers at ING the opportunity to easily configure their required setup with variable application and database versions.

---

### Flock – Aigentic

- **Period:** November 2024 – present
- **Client:** Flock – Aigentic
- **Role:** Senior Software Engineer
- **Technologies:** Kotlin, Ktor, Arrow, React, Ant Design

At Flock an opportunity was seen regarding integrating existing software applications with LLM-driven agents. This product, called Aigentic, already had created an open source client library in Kotlin which utilized Kotlin's DSL pattern with which other developers can easily interact and configure their LLM agent. Furthermore a closed source backend + frontend platform had already been created in which clients could see the results of the agent runs.

Due to the nature of how LLM-driven agents work, Flock required Aigentic to have a better way to instruct the agents which previous responses were deemed preferable. This is what Cees worked on; in accordance with the architect he built a flexible and intuitive way to mark certain agent runs as desired.

For this to work Cees had to adjust both the client library (Kotlin) and the backend platform (Kotlin / React). He adjusted the existing DSL and ensured that the end user could easily execute runs in which the prompt for the agent was prompted with the desired result structure. In order for users to tag an agent run, changes had to be made to the platform by updating its React components, and also integrating these changes in the platform in which the runs were persisted. After completing this feature successfully Cees also updated some of the React components in the frontend to increase the user experience.

---

### Osiris – CI/CD Scalability

- **Period:** November 2023 – November 2024
- **Client:** Osiris, Amsterdam
- **Role:** Senior Fullstack Engineer
- **Technologies:** Java, CI/CD, Terraform, Ansible, Kubernetes

Due to market growth and rapidly evolving CI/CD requirements Osiris was facing trouble with building and deploying their applications on time. This resulted in builds and deployments not finishing in time of the maintenance windows. Osiris had created many custom client applications for clients such as the University of Utrecht, the Technical University of Eindhoven and the HAN university of applied sciences which all had to be built in unique ways.

The task Cees and his team had was to ensure that the builds and deployments were all done on time and in a cost effective manner, ensuring a minimal disruption in the workflow of the development teams.

To help facilitate this problem Cees and his team came up with a solution of moving away from their current non-scalable solution in GitLab towards a more scalable solution in Azure. The solution they came up with gave them the flexibility to spawn an adequate number of CI/CD jobs by creating Azure Virtual Machine Scale Sets. This solution involved a significant refactoring of their privately hosted GitLab server with Ansible, as well as utilizing Terraform to set up and create the necessary Azure services.

Once the solution was in place Osiris no longer faced capacity constraints regarding their CI/CD requirements and was able to successfully and timely deliver its applications to their customers.

---

### Osiris – Security Migration

- **Period:** November 2021 – November 2023
- **Client:** Osiris, Amsterdam
- **Role:** Senior Backend Engineer
- **Technologies:** Java, Spring Boot, Apache Camel, PL/SQL, Angular, Ionic

Osiris faced the challenge of having a deprecated security solution in place. Not only was the technology deprecated, but over the years a lot of custom security code was implemented as well to facilitate specific customer and system requirements.

The old Spring security implementation had to be replaced across the entire Osiris landscape. This involved completely refactoring the security side of both the frontend and the backend applications, and also setting up the new identity and access management application (Keycloak). During this migration the first task was to create a complete map of all the authentication flows. This helped in creating a solid and secure migration approach.

After having identified all the flows Cees was essential in migrating all of the backend Java applications. He created robust and secure code by leveraging the tools provided by Apache Camel to create dynamic authentication flows. He also had to ensure the latest security standards were applied in the frontend applications. For this he refactored the old and outdated security implementations that were present in the Angular/Ionic applications and ensured that the applications used the latest security standards and implemented this in a generic way.

The migration to Keycloak improved security and streamlined user authentication across both frontend and backend applications, resulting in a more robust and secure system overall, especially for long-time clients such as the University of Utrecht which had a lot of custom authentication flows.

---

### Dutch National Police – Camera in Beeld

- **Period:** June 2019 – November 2021
- **Client:** Dutch National Police (via Capgemini)
- **Role:** Senior Java Engineer
- **Technologies:** Java, Spring Boot, FreeMarker, Vue.js, Docker, CI/CD, Kubernetes

The national police had introduced a way for civilians to be able to register the cameras (*Camera in Beeld*) around their home with the police. This was initiated to help the police look up footage that might be relevant in case a crime had occurred.

The problem Cees was hired to solve was that this "system" was all manually entered in an Excel sheet, and this had to be automated. Not only would the persistence have to move from an Excel sheet to a PostgreSQL database, but the flow in which civilians registered the cameras would have to be refactored as well.

In order to achieve this Cees helped develop the core components in their existing CMS system, which included the frontend (FreeMarker and Vue.js) as well as creating the core backend (Spring Boot) services and microservices. A big challenge was that the public-facing CMS system had to be able to communicate with the police's internal systems in order to register the new cameras.

After carefully designing and implementing the new flow, taking into consideration the security implications, Cees and his team were able to successfully deliver this new and improved system which facilitates the police in doing their investigations.

---

### DVJ Insights

- **Period:** December 2017 – June 2019
- **Client:** DVJ Insights, Utrecht
- **Role:** Medior Software Engineer
- **Technologies:** JavaScript, Node.js, React

DVJ had a lot of insightful data as a market research company. They faced an issue with presenting this data in a streamlined process to their clients. Cees was asked to create a web application in the form of a client portal, which retrieved the data from their 3rd party questionnaire application and stored and visualized this data for customers to gain insights. Cees set up both the frontend (React) and the backend (Node.js) and contained the ThreeJS library for visualization. At DVJ he was promoted to medior developer and continued his work on the same projects. He was also responsible for training some of the more junior colleagues and refactoring and maintaining the existing codebase.

## Education

- **MSc Applied Cognitive Psychology**, Leiden — September 2016 – February 2017
- **BSc Psychology**, Utrecht University, Utrecht — September 2012 – November 2015

## Training

- Research / development internship at DVJ, Utrecht — June 2016 – December 2017
- Scrum certified — June 2020
- Oracle Certified Professional (OCP) Java

## Technologies

| Technology | Level |
|---|---|
| Java | ★★★★★ |
| Kotlin | ★★★★★ |
| Spring Boot | ★★★★★ |
| JavaScript | ★★★★★ |
| TypeScript | ★★★★★ |
| CI/CD | ★★★★★ |
| React | ★★★★★ |
| Angular | ★★★★★ |
| Docker | ★★★★★ |
| Node.js | ★★★★☆ |
| PHP | ★★★★☆ |
| Kubernetes | ★★★★☆ |
| Ansible | ★★★★☆ |
| Terraform | ★★★☆☆ |

## Skills

- API integrations
- E-commerce / CMS
- DevOps
- REST
- Tech support
- Monitoring and alerting
- Test strategies
- Planning
- Agile / Scrum, Kanban
- Presenting
- Team management

## Languages

| Language | Level |
|---|---|
| Dutch | ★★★★★ |
| English | ★★★★★ |
