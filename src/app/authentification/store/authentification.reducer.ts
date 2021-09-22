import { User } from '../user.model';
import * as AuthActions from './authentification.actions';

export interface State {
    user: User;
    authError: string;
    isLoading: boolean;
}

const initialState: State = {
    user: null,
    authError: null,
    isLoading: false
};


export function authReducer(state = initialState, action: AuthActions.AuthActions): State {
    switch (action.type) {
        case AuthActions.LOGIN:
            const user = new User(
                action.payload.email,
                action.payload.userId,
                action.payload.token,
                action.payload.expirationDate
            );
            return {
                ...state,
                user,
                authError: null,
                isLoading: false
            };

        case AuthActions.LOGOUT:
            return {
                ...state,
                user: null
            };
        case AuthActions.LOGIN_START:
        case AuthActions.SIGNUP_START:
            return {
                ...state,
                authError: null,
                isLoading: true
            };
        case AuthActions.LOGIN_FAIL:
            return {
                ...state,
                user: null,
                authError: action.payload,
                isLoading: false
            };
        default:
            return state;
    }
}
