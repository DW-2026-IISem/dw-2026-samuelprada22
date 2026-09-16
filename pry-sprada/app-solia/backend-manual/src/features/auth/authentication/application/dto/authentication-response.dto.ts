export class AuthenticationResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: {
    id: number;
    email: string;
    username: string;
    roles: string[];
  };
}
