import { computed, type Ref } from 'vue';
import { z } from 'zod';
import { t } from '../api';
export function useValidation(form: Ref<any>) {
    const requiredSchema = z.string().trim().min(1);
    const passwordSchema = z.string().regex(/^(?=.{8,32}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z!@#$%^&*()]+$/);
    function zodRule(schema: z.ZodType, message: () => string) {
        return {
            validator: (_: unknown, value: unknown, cb: (error?: Error) => void) =>
                schema.safeParse(value).success ? cb() : cb(new Error(message())),
            trigger: 'blur',
        };
    }
    const requiredRule = zodRule(requiredSchema, () => t('ThisFieldIsRequired', '此项不能为空'));
    const passwordRule = zodRule(passwordSchema, () =>
        t('PasswordsMustBeAtLeast8CharactersContainLowercaseUppercaseNumber', '密码需为 8–32 位，包含大小写字母和数字')
    );
    const emailRule = zodRule(z.email(), () => t('EmailAddress', '请输入有效邮箱'));
    const rules = computed(() => ({
        name: [requiredRule],
        surname: [requiredRule],
        userName: [zodRule(z.string().min(2).max(256), () => t('ThisFieldIsRequired', '请输入用户名'))],
        userNameOrEmailAddress: [requiredRule],
        displayName: [zodRule(z.string().min(2).max(32), () => t('ThisFieldIsRequired', '请输入显示名称'))],
        tenancyName: [zodRule(z.string().min(2).max(64), () => t('ThisFieldIsRequired', '请输入租户名称'))],
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
                    .refine((value) => value === (form.value.newPassword || form.value.password)),
                () => t('PasswordsDoNotMatch', '两次密码不一致')
            ),
        ],
    }));
    return { rules, requiredRule };
}
