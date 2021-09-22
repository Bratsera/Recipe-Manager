import { Action } from '@ngrx/store';

export const LOGIN_START = '[auth] Login Start';
export const SIGNUP_START = '[auth] Signup Start';
export const LOGIN_FAIL = '[auth] Login Fail';
export const LOGIN = '[auth] Login';
export const AUTO_LOGIN = '[auth] Auto Login';
export const LOGOUT = '[auth] Logout';
export const AUTO_LOGOUT = '[auth] Auto Logout';

export class Login implements Action {
    readonly type = LOGIN;

    constructor(public payload: {
        email: string;
        userId: string;
        token: string;
        expirationDate: Date;
        redirect: boolean;
    }) { }
}
export class AutoLogin implements Action {
    readonly type = AUTO_LOGIN;
}
export class LoginStart implements Action {
    readonly type = LOGIN_START;

    constructor(public payload: {
        email: string,
        password: string
    }) { }
}
export class SignupStart implements Action {
    readonly type = SIGNUP_START;

    constructor(public payload: {
        email: string,
        password: string
    }) { }
}

export class Logout implements Action {
    readonly type = LOGOUT;
}

export class AutoLogout implements Action {
    readonly type = AUTO_LOGOUT;
}

export class LoginFail implements Action {
    readonly type = LOGIN_FAIL;
    constructor(public payload: string) { }
}


export type AuthActions = Login | Logout | LoginStart | LoginFail | SignupStart | AutoLogout | AutoLogin;
