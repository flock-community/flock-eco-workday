endpoint GetCvAll GET /api/cvs ? {...SortedPaging, personId: String?} -> {
  200 -> Cv[] # { ...TotalCount }
}
endpoint GetCvByCode GET /api/cvs/{code: String} -> {
  200 -> Cv
  404 -> Error
}
endpoint PostCv POST CvForm /api/cvs -> {
  200 -> Cv
  400 -> Error
  409 -> Error
}
endpoint PutCv PUT CvForm /api/cvs/{code: String} -> {
  200 -> Cv
  400 -> Error
  404 -> Error
  409 -> Error
}
endpoint DeleteCv DELETE /api/cvs/{code: String} -> {
  204 -> Unit
  404 -> Error
}
endpoint GetCvRevisions GET /api/cvs/{code: String}/revisions -> {
  200 -> CvRevision[]
  404 -> Error
}
endpoint GetCvRevision GET /api/cvs/{code: String}/revisions/{id: String} -> {
  200 -> Cv
  404 -> Error
}
endpoint PostCvRevisionRestore POST /api/cvs/{code: String}/revisions/{id: String}/restore -> {
  200 -> Cv
  404 -> Error
  409 -> Error
}

type YearMonth = String(/^\d{4}-(0[1-9]|1[0-2])$/g)
type CvRequiredText = String(/^(?!\s*$).{1,255}$/g)
type CvName = String(/^(?!\s*$).{1,100}$/g)

enum CvLanguage {
  NL, EN
}

type CvExperienceForm {
  from: YearMonth,
  to: YearMonth?,
  role: CvRequiredText,
  client: CvRequiredText,
  employer: String?,
  technologies: String[]?,
  description: String?,
  logoId: UUID?
}
type CvSkillForm {
  category: String?,
  name: CvRequiredText,
  level: Integer32?
}
type CvForm {
  personId: UUID?,
  name: CvName,
  language: CvLanguage,
  place: String?,
  phone: String?,
  summary: String?,
  experiences: CvExperienceForm[]?,
  skills: CvSkillForm[]?,
  education: String?,
  subjects: String?,
  languages: String?
}
type CvExperience {
  from: String,
  to: String?,
  role: String,
  client: String,
  employer: String?,
  technologies: String[],
  description: String?,
  logoId: String?
}
type CvSkill {
  category: String?,
  name: String,
  level: Integer32?
}
type Cv {
  ...Identified,
  name: String?,
  language: CvLanguage?,
  place: String?,
  phone: String?,
  summary: String?,
  experiences: CvExperience[]?,
  skills: CvSkill[]?,
  education: String?,
  subjects: String?,
  languages: String?,
  updatedAt: String?,
  person: Person?
}
type CvRevision {
  id: String,
  savedAt: String
}
