import React from 'react';

type UserAuthorityUtilProps = {
  has: string;
  children?: React.ReactNode;
};

type UserAuthorityUtilState = object;

class UserAuthorityUtil extends React.Component<
  UserAuthorityUtilProps,
  UserAuthorityUtilState
> {
  static authorities: string[] | null = null;

  static setAuthorities(authorities: string[]) {
    UserAuthorityUtil.authorities = authorities;
  }

  static hasAuthority(authority: string): boolean | undefined {
    if (!UserAuthorityUtil.authorities) {
      return undefined;
    }

    return UserAuthorityUtil.authorities.includes(authority);
    // return authority
    //   .split(',')
    //   .map((it) => UserAuthorityUtil.authorities.includes(it))
    //   .reduce((acc: boolean, cur: boolean) => (acc ? acc : cur), false);
  }

  render() {
    const hasAuthority =
      this.props.has && UserAuthorityUtil.hasAuthority(this.props.has);
    return hasAuthority ? this.props.children : null;
  }
}

export default UserAuthorityUtil;
