package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.model.CvSnapshot

/**
 * How a copy of a base CV stands against that base, field by field. It compares three
 * versions of the content:
 *
 * - the copy as it is (C),
 * - the base as the copy last agreed with it ([agreed], R),
 * - the base as it is now (N).
 *
 * A field of the copy that equals R follows the base; one that differs is tailored.
 * When the base changes a field (N differs from R), a fact the copy follows (period,
 * client, role, technologies, skills, details, ...) is taken over at once, while a
 * text (the profile and assignment descriptions) or a tailored field is offered: the
 * copy may take the base's version (accept) or keep its own (skip). An assignment or
 * skill new in the base is added to the copy; one the base removed is offered.
 *
 * Fields are named by an address: `summary`, `place`, ..., `experience/{id}` (the
 * assignment as a whole), `experience/{id}/role`, `skill/{id}`, `skill/{id}/level`.
 */
object CvSync {
    enum class Kind {
        /** A text of the copy: the base's changes to it are offered, never taken over. */
        TEXT,

        /** A fact: taken over from the base while the copy follows it. */
        FACT,

        /** An assignment or skill new in the base. */
        ADDED,

        /** An assignment or skill the base no longer has. */
        REMOVED,

        /** An assignment or skill of the base this copy leaves out. */
        HIDDEN,

        /** An assignment or skill only this copy has. */
        COPY_ONLY,
    }

    /**
     * A field to look at: an offer (the base changed it) or a tailored field. [base] and
     * [copy] are its values in the base now and in the copy; [outdated] tells that the
     * copy tailored a field the base changed since.
     */
    data class Item(
        val address: String,
        val label: String,
        val kind: Kind,
        val base: String?,
        val copy: String?,
        val outdated: Boolean = false,
    )

    data class Status(
        val offers: List<Item>,
        val tailored: List<Item>,
    )

    /** The copy and what it agreed with the base, after a change. */
    data class Result(
        val copy: CvSnapshot,
        val agreed: CvSnapshot,
    )

    /** Takes over the facts the base changed and the copy follows, and the new items of the base. */
    fun reconcile(
        copy: CvSnapshot,
        agreed: CvSnapshot,
        base: CvSnapshot,
    ): Result {
        var c = copy
        var r = agreed
        TOP.forEach { field ->
            val (cv, rv, nv) = Triple(field.get(c), field.get(r), field.get(base))
            if (nv != rv) {
                if (cv == nv) {
                    r = field.set(r, nv)
                } else if (cv == rv && !field.text) {
                    c = field.set(c, nv)
                    r = field.set(r, nv)
                }
            }
        }
        COLLECTIONS.forEach { col -> col.reconcile(c, r, base).let { (nc, nr) -> c = nc; r = nr } }
        return Result(c, r)
    }

    /** What the copy should look at: the changes of the base it has not taken, and what it tailored. */
    fun status(
        copy: CvSnapshot,
        agreed: CvSnapshot,
        base: CvSnapshot,
    ): Status {
        val offers = mutableListOf<Item>()
        val tailored = mutableListOf<Item>()
        TOP.forEach { field ->
            val (cv, rv, nv) = Triple(field.get(copy), field.get(agreed), field.get(base))
            val kind = if (field.text) Kind.TEXT else Kind.FACT
            when {
                nv != rv && cv != nv -> offers += Item(field.name, field.label, kind, nv, cv, outdated = cv != rv)
                nv == rv && cv != rv -> tailored += Item(field.name, field.label, kind, nv, cv)
            }
        }
        COLLECTIONS.forEach { it.status(copy, agreed, base, offers, tailored) }
        return Status(offers, tailored)
    }

    /** The copy takes the base's version of the field at [address]. */
    fun accept(
        copy: CvSnapshot,
        agreed: CvSnapshot,
        base: CvSnapshot,
        address: String,
    ): Result =
        when (val target = parse(address)) {
            is Target.Top -> {
                val value = target.field.get(base)
                Result(target.field.set(copy, value), target.field.set(agreed, value))
            }
            is Target.Item<*> -> target.accept(copy, agreed, base)
        }

    /** The copy keeps its own version of the field at [address], and agrees with the base's change. */
    fun skip(
        copy: CvSnapshot,
        agreed: CvSnapshot,
        base: CvSnapshot,
        address: String,
    ): Result =
        when (val target = parse(address)) {
            is Target.Top -> Result(copy, target.field.set(agreed, target.field.get(base)))
            is Target.Item<*> -> Result(copy, target.skip(agreed, base))
        }

    /** The base takes the copy's version of the field at [address]; returns the new base. */
    fun promote(
        copy: CvSnapshot,
        base: CvSnapshot,
        address: String,
    ): CvSnapshot =
        when (val target = parse(address)) {
            is Target.Top -> target.field.set(base, target.field.get(copy))
            is Target.Item<*> -> target.promote(copy, base)
        }

    private class Field(
        val name: String,
        val label: String,
        val text: Boolean,
        val get: (CvSnapshot) -> String?,
        val set: (CvSnapshot, String?) -> CvSnapshot,
    )

    private val TOP =
        listOf(
            Field("place", "Place", false, { it.place }, { s, v -> s.copy(place = v) }),
            Field("phone", "Phone", false, { it.phone }, { s, v -> s.copy(phone = v) }),
            Field("summary", "Profile", true, { it.summary }, { s, v -> s.copy(summary = v) }),
            Field("education", "Education", false, { it.education }, { s, v -> s.copy(education = v) }),
            Field("subjects", "Subjects", false, { it.subjects }, { s, v -> s.copy(subjects = v) }),
            Field("languages", "Languages", false, { it.languages }, { s, v -> s.copy(languages = v) }),
        )

    /** A field of an assignment or skill. */
    private class Leaf<T>(
        val name: String,
        val label: String,
        val text: Boolean,
        val get: (T) -> String?,
        val set: (T, T) -> T,
        val show: (String?) -> String? = { it },
    )

    /** The assignments or the skills of a CV, items by id. */
    private class Collection<T>(
        val name: String,
        val list: (CvSnapshot) -> List<T>,
        val withList: (CvSnapshot, List<T>) -> CvSnapshot,
        val id: (T) -> String?,
        val label: (T) -> String,
        val leaves: List<Leaf<T>>,
    ) {
        fun get(
            s: CvSnapshot,
            id: String,
        ): T? = list(s).find { this.id(it) == id }

        /** Replaces the item with the same id, or adds it at the end. */
        fun put(
            s: CvSnapshot,
            item: T,
        ): CvSnapshot {
            val items = list(s)
            return if (items.any { id(it) == id(item) }) {
                withList(s, items.map { if (id(it) == id(item)) item else it })
            } else {
                withList(s, items + item)
            }
        }

        fun remove(
            s: CvSnapshot,
            id: String,
        ): CvSnapshot = withList(s, list(s).filter { this.id(it) != id })

        fun ids(vararg snapshots: CvSnapshot): List<String> = snapshots.flatMap { s -> list(s).mapNotNull(id) }.distinct()

        fun leaf(name: String): Leaf<T> = leaves.find { it.name == name } ?: throw IllegalArgumentException("Unknown field $name")

        fun reconcile(
            copy: CvSnapshot,
            agreed: CvSnapshot,
            base: CvSnapshot,
        ): Pair<CvSnapshot, CvSnapshot> {
            var c = copy
            var r = agreed
            ids(copy, agreed, base).forEach { id ->
                val ci = get(c, id)
                val ri = get(r, id)
                val ni = get(base, id)
                when {
                    // New in the base: added to the copy too
                    ri == null && ni != null && ci == null -> {
                        c = put(c, ni)
                        r = put(r, ni)
                    }
                    // In both already (put back in the base, say): the copy agrees as it is
                    ri == null && ni != null -> r = put(r, ni)
                    // Gone from both
                    ri != null && ni == null && ci == null -> r = remove(r, id)
                    ci != null && ri != null && ni != null -> {
                        var cItem: T = ci
                        var rItem: T = ri
                        leaves.forEach { leaf ->
                            val (cv, rv, nv) = Triple(leaf.get(cItem), leaf.get(rItem), leaf.get(ni))
                            if (nv != rv) {
                                if (cv == nv) {
                                    rItem = leaf.set(rItem, ni)
                                } else if (cv == rv && !leaf.text) {
                                    cItem = leaf.set(cItem, ni)
                                    rItem = leaf.set(rItem, ni)
                                }
                            }
                        }
                        c = put(c, cItem)
                        r = put(r, rItem)
                    }
                }
            }
            return c to r
        }

        fun status(
            copy: CvSnapshot,
            agreed: CvSnapshot,
            base: CvSnapshot,
            offers: MutableList<Item>,
            tailored: MutableList<Item>,
        ) {
            ids(base, copy, agreed).forEach { id ->
                val ci = get(copy, id)
                val ri = get(agreed, id) ?: get(base, id)
                val ni = get(base, id)
                val address = "$name/$id"
                when {
                    ci == null && ni != null && get(agreed, id) == null ->
                        offers += Item(address, label(ni), Kind.ADDED, label(ni), null)
                    ci != null && ni == null && get(agreed, id) != null ->
                        offers += Item(address, label(ci), Kind.REMOVED, null, label(ci))
                    ci == null && ni != null -> tailored += Item(address, label(ni), Kind.HIDDEN, label(ni), null)
                    ci != null && ni == null -> tailored += Item(address, label(ci), Kind.COPY_ONLY, null, label(ci))
                    ci != null && ri != null && ni != null ->
                        leaves.forEach { leaf ->
                            val (cv, rv, nv) = Triple(leaf.get(ci), leaf.get(ri), leaf.get(ni))
                            val kind = if (leaf.text) Kind.TEXT else Kind.FACT
                            val item = { outdated: Boolean ->
                                Item("$address/${leaf.name}", "${label(ni)}: ${leaf.label}", kind, leaf.show(nv), leaf.show(cv), outdated)
                            }
                            when {
                                nv != rv && cv != nv -> offers += item(cv != rv)
                                nv == rv && cv != rv -> tailored += item(false)
                            }
                        }
                }
            }
        }
    }

    private val EXPERIENCES =
        Collection<CvSnapshot.Experience>(
            name = "experience",
            list = { it.experiences },
            withList = { s, items -> s.copy(experiences = items) },
            id = { it.id },
            label = { "${it.client} · ${it.role}" },
            leaves =
                listOf(
                    Leaf("from", "start", false, { it.from }, { t, f -> t.copy(from = f.from) }),
                    Leaf("to", "end", false, { it.to }, { t, f -> t.copy(to = f.to) }),
                    Leaf("role", "role", false, { it.role }, { t, f -> t.copy(role = f.role) }),
                    Leaf("client", "client", false, { it.client }, { t, f -> t.copy(client = f.client) }),
                    Leaf("employer", "employer", false, { it.employer }, { t, f -> t.copy(employer = f.employer) }),
                    Leaf(
                        "technologies",
                        "technologies",
                        false,
                        { it.technologies.joinToString("\n") },
                        { t, f -> t.copy(technologies = f.technologies) },
                        show = { it?.replace("\n", ", ") },
                    ),
                    Leaf("logoId", "logo", false, { it.logoId }, { t, f -> t.copy(logoId = f.logoId) }, show = { it?.let { "a logo" } }),
                    Leaf("description", "description", true, { it.description }, { t, f -> t.copy(description = f.description) }),
                ),
        )

    private val SKILLS =
        Collection<CvSnapshot.Skill>(
            name = "skill",
            list = { it.skills },
            withList = { s, items -> s.copy(skills = items) },
            id = { it.id },
            label = { "Skill ${it.name}" },
            leaves =
                listOf(
                    Leaf("category", "category", false, { it.category }, { t, f -> t.copy(category = f.category) }),
                    Leaf("name", "name", false, { it.name }, { t, f -> t.copy(name = f.name) }),
                    Leaf("level", "level", false, { it.level?.toString() }, { t, f -> t.copy(level = f.level) }),
                ),
        )

    private val COLLECTIONS = listOf(EXPERIENCES, SKILLS)

    private sealed interface Target {
        class Top(
            val field: Field,
        ) : Target

        /** An item ([leaf] null) or one field of it. */
        class Item<T>(
            val col: Collection<T>,
            val id: String,
            val leaf: Leaf<T>?,
        ) : Target {
            fun accept(
                copy: CvSnapshot,
                agreed: CvSnapshot,
                base: CvSnapshot,
            ): Result {
                val ni = col.get(base, id)
                if (leaf == null) {
                    return if (ni != null) {
                        Result(col.put(copy, ni), col.put(agreed, ni))
                    } else {
                        Result(col.remove(copy, id), col.remove(agreed, id))
                    }
                }
                val ci = col.get(copy, id) ?: throw IllegalArgumentException("This copy has no $id")
                ni ?: throw IllegalArgumentException("The base has no $id")
                val ri = col.get(agreed, id) ?: ni
                return Result(col.put(copy, leaf.set(ci, ni)), col.put(agreed, leaf.set(ri, ni)))
            }

            fun skip(
                agreed: CvSnapshot,
                base: CvSnapshot,
            ): CvSnapshot {
                val ni = col.get(base, id)
                if (leaf == null) return if (ni != null) col.put(agreed, ni) else col.remove(agreed, id)
                ni ?: throw IllegalArgumentException("The base has no $id")
                return col.put(agreed, leaf.set(col.get(agreed, id) ?: ni, ni))
            }

            fun promote(
                copy: CvSnapshot,
                base: CvSnapshot,
            ): CvSnapshot {
                // Leaving an item out of a copy never takes it out of the base
                val ci = col.get(copy, id) ?: throw IllegalArgumentException("This copy has no $id")
                if (leaf == null) return col.put(base, ci)
                val ni = col.get(base, id) ?: throw IllegalArgumentException("The base has no $id")
                return col.put(base, leaf.set(ni, ci))
            }
        }
    }

    private fun parse(address: String): Target {
        val parts = address.split("/")
        TOP.find { it.name == address }?.let { return Target.Top(it) }
        val col = COLLECTIONS.find { it.name == parts.first() } ?: throw IllegalArgumentException("Unknown field $address")
        return when (parts.size) {
            2 -> Target.Item(col, parts[1], null)
            3 -> target(col, parts[1], parts[2])
            else -> throw IllegalArgumentException("Unknown field $address")
        }
    }

    private fun <T> target(
        col: Collection<T>,
        id: String,
        leaf: String,
    ): Target = Target.Item(col, id, col.leaf(leaf))
}
