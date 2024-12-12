export interface UserLoginData {
  id: string;
  name: string;
  ubs: {
    id: string;
  };
  password_hash: string;
}

export interface UserJwt {
  id: string;
  name: string;
  ubs: string;
}

