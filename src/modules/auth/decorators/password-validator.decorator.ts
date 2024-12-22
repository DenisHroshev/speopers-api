import { applyDecorators } from '@nestjs/common';
import { IsStrongPassword, MaxLength, MinLength } from 'class-validator';
import { PasswordRequirements } from '../constants/password-requirements';

export const PasswordValidatorDecorator = () =>
  applyDecorators(
    MinLength(PasswordRequirements.MIN_LENGTH),
    MaxLength(PasswordRequirements.MAX_LENGTH),
    IsStrongPassword(
      {
        minUppercase: PasswordRequirements.MIN_UPPERCASE,
        minLowercase: PasswordRequirements.MIN_LOWERCASE,
        minNumbers: PasswordRequirements.MIN_NUMBERS,
        minSymbols: PasswordRequirements.MIN_SYMBOLS,
      },
      {
        message: (validationArgs) =>
          validationArgs.property +
          ` must contain at least ${PasswordRequirements.MIN_NUMBERS} number, ${PasswordRequirements.MIN_SYMBOLS} symbol and have a mixture of uppercase and lowercase letters`,
      },
    ),
  );
