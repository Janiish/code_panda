import { createContext, useContext, useReducer, useCallback } from 'react';

const AuthContext = createContext(null);

const initialState = {
  user: JSON.parse(localStorage.getItem('agri_user') || 'null'),
  token: localStorage.getItem('agri_token') || null,
  isAuth: !!localStorage.getItem('agri_token'),
  toast: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('agri_token', action.payload.token);
      localStorage.setItem('agri_user', JSON.stringify(action.payload.user));
      return { ...state, user: action.payload.user, token: action.payload.token, isAuth: true };
    case 'LOGOUT':
      localStorage.removeItem('agri_token');
      localStorage.removeItem('agri_user');
      return { ...state, user: null, token: null, isAuth: false };
    case 'TOAST':
      return { ...state, toast: action.payload };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const login = useCallback((token, user) => dispatch({ type: 'LOGIN', payload: { token, user } }), []);
  const logout = useCallback(() => dispatch({ type: 'LOGOUT' }), []);
  const showToast = useCallback((msg, type = 'success') => {
    dispatch({ type: 'TOAST', payload: { msg, type } });
    setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 3000);
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, showToast, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
