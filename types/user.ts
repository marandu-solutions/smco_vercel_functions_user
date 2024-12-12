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

export interface UserDetails {
  id: string;
  name: string;
  cpf: string;
  status: boolean | null | undefined;
  birthdate: Date | null;
  email: string | null | undefined;
  gender: string;
  phone: string | null | undefined;
  social_name: string | null | undefined;
  profile_pic_url: string | null | undefined;
  sus_id: string;
}
