import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function notEqualPasswordValidator(
  passwordField: string,
  confirmPasswordField: string
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const form = control as any;
    const pass1 = form.get(passwordField);
    const pass2 = form.get(confirmPasswordField);

    return pass1 && pass2 && pass1.value !== pass2.value
      ? { notEqualPassword: true }
      : null;
  };
}
