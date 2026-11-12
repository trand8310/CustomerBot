import { ref, type Ref } from 'vue';
import { ElMessage, type FormInstance } from 'element-plus';
import { t } from '../api';
import type { CrudApi } from '../api/crud';
import { useValidation } from './validation';

export interface EditorData<TForm, TOption> {
    form: TForm;
    options?: TOption[];
}

export function useEditorDialog<TDto, TForm extends object, TOption = never>(
    api: CrudApi<TDto, TForm>,
    prepare: (id?: number) => Promise<EditorData<TForm, TOption>>,
    onSaved: () => void,
    emptyForm: () => TForm
) {
    const visible = ref(false);
    const busy = ref(false);
    const formRef = ref<FormInstance>();
    const form = ref(emptyForm()) as Ref<TForm>;
    const choices = ref([]) as Ref<TOption[]>;
    const tab = ref('details');
    const edit = ref(false);
    const { rules } = useValidation(form);
    let opening = false;

    async function open(id?: number) {
        if (opening || visible.value || busy.value) return;
        opening = true;
        try {
            const result = await prepare(id);
            form.value = result.form;
            choices.value = result.options ?? [];
            tab.value = 'details';
            edit.value = id !== undefined;
            visible.value = true;
        } finally {
            opening = false;
        }
    }

    async function save() {
        if (busy.value || !formRef.value) return;
        busy.value = true;
        try {
            if (!(await formRef.value.validate().catch(() => false))) return;
            await (edit.value ? api.update(form.value) : api.create(form.value));
            ElMessage.success(t('SavedSuccessfully'));
            visible.value = false;
            onSaved();
        } finally {
            busy.value = false;
        }
    }

    return { visible, busy, formRef, form, choices, tab, edit, rules, open, save };
}
