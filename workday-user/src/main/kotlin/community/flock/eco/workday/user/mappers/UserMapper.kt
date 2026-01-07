package community.flock.eco.workday.user.mappers

import community.flock.eco.workday.domain.user.User
import community.flock.eco.workday.domain.user.UserAccount
import community.flock.eco.workday.domain.user.UserAccountKey
import community.flock.eco.workday.domain.user.UserAccountOauth
import community.flock.eco.workday.domain.user.UserAccountOauthProvider
import community.flock.eco.workday.domain.user.UserAccountPassword
import community.flock.eco.workday.user.model.User as UserEntity
import community.flock.eco.workday.user.model.UserAccount as UserAccountEntity
import community.flock.eco.workday.user.model.UserAccountKey as UserAccountKeyEntity
import community.flock.eco.workday.user.model.UserAccountOauth as UserAccountOauthEntity
import community.flock.eco.workday.user.model.UserAccountOauthProvider as UserAccountOauthProviderEntity
import community.flock.eco.workday.user.model.UserAccountPassword as UserAccountPasswordEntity

// fun User.toEntity() =
//    UserEntity(
//        id = internalId,
//        code = code,
//        name = name,
//        email = email,
//        enabled = enabled,
//        authorities = authorities.toMutableSet(),
//        accounts = accounts.map { it.toEntity(code) }.toMutableSet(),
//        created = created,
//    )

fun UserEntity.toDomain() =
    User(
        internalId = id,
        code = code,
        name = name,
        email = email,
        enabled = enabled,
        authorities = authorities,
        accounts = accounts.map { it.toDomain() }.toSet(),
        created = created,
    )

// fun UserAccount.toEntity(code: String): UserAccountEntity =
//    when (this) {
//        is UserAccountKey ->
//            UserAccountKeyEntity(
//                id = internalId,
//                user = code ,
//                key = key,
//                label = label,
//            )
//
//        is UserAccountOauth ->
//            UserAccountOauthEntity(
//                id = internalId,
//                user = user.toEntity(),
//                reference = reference,
//                provider = provider.toEntity(),
//            )
//
//        is UserAccountPassword ->
//            UserAccountPasswordEntity(
//                id = internalId,
//                user = user.toEntity(),
//                secret = secret,
//                resetCode = resetCode,
//            )
//    }

fun UserAccountEntity.toDomain(): UserAccount =
    when (this) {
        is UserAccountPasswordEntity -> {
            UserAccountPassword(
                internalId = id,
                userCode = user.code,
                created = created,
                secret = secret,
                resetCode = resetCode,
            )
        }

        is UserAccountOauthEntity -> {
            UserAccountOauth(
                internalId = id,
                userCode = user.code,
                created = created,
                reference = reference,
                provider = provider.toDomain(),
            )
        }

        is UserAccountKeyEntity -> {
            UserAccountKey(
                internalId = id,
                userCode = user.code,
                created = created,
                key = key,
                label = label,
            )
        }

        else -> {
            error("Cannot map UserAccount entity into a domain object ${this.id}")
        }
    }

fun UserAccountOauthProviderEntity.toDomain(): UserAccountOauthProvider =
    when (this) {
        UserAccountOauthProviderEntity.GOOGLE -> UserAccountOauthProvider.GOOGLE
        UserAccountOauthProviderEntity.FACEBOOK -> UserAccountOauthProvider.FACEBOOK
        UserAccountOauthProviderEntity.GITHUB -> UserAccountOauthProvider.GITHUB
        UserAccountOauthProviderEntity.KRATOS -> UserAccountOauthProvider.KRATOS
    }
