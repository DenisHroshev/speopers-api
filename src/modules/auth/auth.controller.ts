import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserCredentialsRequestDto } from './dtos/user-credentials-request.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: UserCredentialsRequestDto) {
    return this.authService.login(body);
  }

  @Post('registration')
  registration(@Body() body: UserCredentialsRequestDto) {
    return this.authService.registration(body);
  }
}
