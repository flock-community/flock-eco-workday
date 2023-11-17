import {Namespace, Context} from "@ory/keto-namespace-types"

class User implements Namespace {

}

class Flock implements Namespace {
    related: {
        organisationalUnits: Flock[]
        viewers: (User | Flock)[]
        managers: User[]
        owners: User[]
    }

    // if you are a viewer of a Flock, you can view all its organisationalUnits,
    // if you can view a Person, you can view all owned Workdays of the Person
    permits = {
        view: (ctx: Context): boolean =>
            this.related.viewers.includes(ctx.subject) ||
            this.related.managers.includes(ctx.subject) ||
            this.related.organisationalUnits.traverse((f) => f.permits.view(ctx)),

        edit: (ctx: Context): boolean =>
            this.related.owners.includes(ctx.subject),
    }
}

class Person implements Namespace {
    related: {
        organisationalUnits: Flock[]
        owners: User[]
        managers: Person[]
    }

    // if you can view a Person, you can view all owned Workdays of the Person
    permits = {
        view: (ctx: Context): boolean =>
            this.related.owners.includes(ctx.subject) ||
            this.related.managers.traverse((f) => f.permits.view(ctx)) ||
            this.related.organisationalUnits.traverse((f) => f.permits.view(ctx)),
    }
}

class Workday implements Namespace {
    related: {
        owners: Person[]
    }

    // if you can view a Person, you can view all owned Workdays of the Person
    permits = {
        view: (ctx: Context): boolean =>
            this.related.owners.traverse((p) => p.permits.view(ctx)),
        edit: (ctx: Context): boolean => this.permits.view(ctx),
    }
}


class Holiday implements Namespace {
    related: {
        owners: Person[]
    }

    // if you can view a Person, you can view all owned Workdays of the Person
    permits = {
        view: (ctx: Context): boolean =>
            this.related.owners.traverse((p) => p.permits.view(ctx)),
    }
}
