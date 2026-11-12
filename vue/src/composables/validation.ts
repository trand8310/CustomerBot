import { computed, type Ref } from 'vue';
import type { FormItemRule } from 'element-plus';
import { z } from 'zod';
import { t } from '../api';
import { passwordPattern } from '../utils/password';

interface PasswordFields {
    password?: string;
    newPassword?: string;
}

export function useValidation(form: Ref<object>) {
    const requiredSchema = z.string().trim().min(1);
    const passwordSchema = z.string().regex(passwordPattern);
    function zodRule(schema: z.ZodType, message: () => string): FormItemRule {
        return {
            validator: (_rule, value, callback) =>
                schema.safeParse(value).success ? callback() : callback(new Error(message())),
            trigger: 'blur',
        };
    }
    const requiredRule = zodRule(requiredSchema, () => t('ThisFieldIsRequired'));
    const passwordRule = zodRule(passwordSchema, () =>
        t('PasswordsMustBeAtLeast8CharactersContainLowercaseUppercaseNumber')
    );
    const emailRule = zodRule(z.email(), () => t('InvalidEmailAddress'));
    const lengthRule = (min: number, max: number) =>
        zodRule(z.string().trim().min(min).max(max), () => t('LengthBetween', min, max));
    const rules = computed<Record<string, FormItemRule[]>>(() => ({
        name: [requiredRule],
        surname: [requiredRule],
        userName: [lengthRule(2, 256)],
        userNameOrEmailAddress: [requiredRule],
        displayName: [lengthRule(2, 32)],
        tenancyName: [lengthRule(2, 64)],
        emailAddress: [emailRule],
        adminEmailAddress: [emailRule],
        password: [passwordRule],
        currentPassword: [requiredRule],
        newPassword: [passwordRule],
        confirm: [
            zodRule(
                z
                    .string()
                    .min(1)
                    .refine((value: string) => {
                        const fields = form.value as PasswordFields;
                        return value === (fields.newPassword || fields.password);
                    }),
                () => t('PasswordsDoNotMatch')
            ),
        ],
    }));
    return { rules, requiredRule };
}
