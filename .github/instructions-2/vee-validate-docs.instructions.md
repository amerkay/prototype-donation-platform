---
applyTo: 'app/features/form-builder/**'
---

# VeeValidate v4

## TL;DR
Vue 3 form validation; components (<Form>/<Field>/<ErrorMessage>/<FieldArray>) or composables (useForm/useField/useFieldArray); yup/zod/valibot schemas or fn rules; async validation; i18n via @vee-validate/i18n

## Setup
pnpm i vee-validate; Vue 3 + Composition API; all composables in setup(); optional: yup/zod/valibot, @vee-validate/i18n, @vee-validate/rules
Global config: configure({...})→affects new <Field> only (not useField)

## Core API

**configure(opts)**
validateOnBlur=T; validateOnChange=T; validateOnInput=F; validateOnModelUpdate=T; bails=T; generateMessage:(ctx)→str
⚠ flags→<Field> only, not useField

**Components**

<Form as="form" validationSchema initialValues initialErrors initialTouched validateOnMount=F keepValues=F name="Form" @submit @invalid-submit>
Slot: values;errors;errorBag;meta{touched,dirty,valid,pending,initialValues};isSubmitting;isValidating;submitCount;controlledValues;handleSubmit;submitForm;validate;validateField;handleReset;resetForm;setFieldError;setErrors;setFieldValue;setValues;setFieldTouched;setTouched

<Field name* as="input" rules validateOnMount=F validateOnInput=F validateOnChange=T validateOnBlur=T validateOnModelUpdate=T bails=T label value type unchecked-value standalone=F keepValue>
Slot: field;componentField;value(RO);meta{touched,dirty,valid,validated,pending,initialValue};errors[];errorMessage;resetField;handleReset;validate;handleChange;handleBlur;setTouched;setErrors;checked
⚠ v-bind="field" required for slots; v-model only on <Field> tag not inner input

<ErrorMessage name* as="span">
Slot: {message}; renders nothing if no error; must be in same <Form>; only existing fields

<FieldArray arrayPath*>
Slot: fields[]{value,key,isFirst,isLast}; push;prepend;remove(idx);swap(a,b);insert(idx,val);update(idx,val);replace(arr);move(a,b)
Requires <Form>/useForm parent

**Composables**

useForm(opts?)→{values;errors;errorBag;meta;isSubmitting;isValidating;submitCount;controlledValues;defineField;defineInputBinds;defineComponentBinds;handleSubmit;submitForm;validate;validateField;handleReset;resetForm;setFieldValue;setFieldError;setErrors;setValues;setFieldTouched;setTouched}
opts: validationSchema;initialValues;initialErrors;initialTouched;validateOnMount;keepValuesOnUnmount;name

defineField(path,cfg?)→[model:Ref,props:Obj]
cfg: validateOnMount;validateOnBlur;validateOnChange;validateOnInput;validateOnModelUpdate;syncVModel(bool|str);props:(state)→obj;type='checkbox'

handleSubmit(onValid,onInvalid?)→(evt?)→Promise
onValid: (values,actions)→void|Promise; actions={setFieldValue,setFieldError,setErrors,setValues,setFieldTouched,setTouched,resetForm}
onInvalid: ({values,errors,results})→void
handleSubmit.withControlled(fn)→only controlled values passed

useField(name,rules?,opts?)→{value;setValue;meta;errors;errorMessage;resetField;handleReset;setErrors;validate;handleChange;handleBlur;setTouched;checked}
name: str|()→str
rules: str|fn|yup|zod|valibot; fn sig: (val,ctx)→true|str|false|Promise; ctx={field,value,form,rule:{name,params}}
opts: type;label;initialValue;validateOnMount;bails;standalone;validateOnValueUpdate;keepValueOnUnmount;syncVModel;checkedValue;uncheckedValue;validateOnBlur;validateOnChange;validateOnInput;validateOnModelUpdate

useFieldArray(arrayPath)→{fields:Ref<FieldEntry[]>;push;prepend;remove;swap;insert;update;replace;move}

**Helpers (require form/field context)**
useFieldError(field?)→ComputedRef<str|undef>
useFormErrors()→ComputedRef<Record<str,str>>
useIsFieldDirty/useIsFormDirty()→ComputedRef<bool>
useIsFieldTouched/useIsFormTouched()→ComputedRef<bool>
useIsFieldValid/useIsFormValid()→ComputedRef<bool>
useValidateField(field?)→()→Promise<ValidationResult>
useValidateForm()→()→Promise<FormValidationResult>
useIsSubmitting/useIsValidating()→ComputedRef<bool>
useSubmitCount()→ComputedRef<num>
useResetForm()→()→void
useSubmitForm(cb)→()→void
useFieldValue(field?)→ComputedRef<any>
useFormValues()→ComputedRef<Record<str,any>>

**Validation Rules (@vee-validate/rules)**
defineRule(name,fn); import {required,email,min,max,...} from '@vee-validate/rules'
String fmt: "required|email|min:8|between:1,10"; args: : prefix, , sep; cross-field: @prefix like "confirmed:@password"
Obj fmt: {required:T,between:[1,10]} or {required:T,between:{min:1,max:10}}
Available: alpha;alpha_dash;alpha_num;alpha_spaces;between(min,max);confirmed(target);digits(len);dimensions(w,h);email;not_one_of(...vals);ext(...exts);image;one_of(...vals);integer;is;is_not;length(len);max(len);max_value(max);mimes(...types);min(len);min_value(min);numeric;regex(pat);required;size(kb);url(pat?)

**Schemas**
Yup: yup.object({field:yup.string().required().email()})
Zod: z.object({field:z.string().nonempty().email()}); ⚠ refine/superRefine skip if keys missing
Valibot: v.object({field:v.pipe(v.string(),v.email())})
Dynamic: computed(()→schema)

**Nested Paths**
Dot: links.twitter→{links:{twitter:''}}
Array: links[0]→{links:['']}
⚠ Avoid nesting: [links.twitter]→{'links.twitter':''}
⚠ Arrays only if key=complete number

**Checkboxes/Radio**
Single checkbox: scalar value
Multiple (same name): array value
useField opts: type='checkbox';checkedValue;uncheckedValue
<Field>: type="checkbox" value={checkedValue} unchecked-value={uncheckedValue}
⚠ MUST: inside Form; same name for group; type set

**i18n (@vee-validate/i18n)**
configure({generateMessage:localize({en,ar})})
setLocale('ar')
localize('en',{messages:{required:'Required'},fields:{pwd:{required:'Pwd required'}},names:{email:'Email Addr'}},{prefix:'{{',suffix:'}}'})
Interpolation: {field} {otherField} 0:{paramName} 1:{paramName}
CDN: VeeValidateI18n.loadLocaleFromURL(url)

**Devtools**
Auto-installed (not UMD/CDN/NODE_ENV=prod|test); inspector "vee-validate"; set name: <Form name="x"/> or useForm({name:'x'})

## Flow
1.Init: useForm/Form→2.Declare: Field/useField→3.Arrays?: FieldArray/useFieldArray→4.Validate: auto/events/manual→5.Submit: handleSubmit/submitForm→6.Reset: resetForm

## Gotchas

**Valid flag**: initially T before validation→combine w/ dirty/touched
**Global cfg**: event flags≠useField
**v-model**: conflicts w/ v-bind="field" on inner input; v-model only on <Field> tag
**resetField**: unsafe as event handler unless invoked
**Array ops**: ignore OOB
**Missing fields**: setErrors/setValues for non-existent fields mutate form until reset
**ErrorMessage**: renders nothing if no errors
**Checkbox/radio**: MUST have type set + same name for group; single=scalar, multiple=array
**Custom checkbox**: pass type:'checkbox'+checkedValue in useField opts
**Dynamic names**: useField name MUST be fn/ref/computed for reactivity (v-for indices)
**Destructuring**: ❌const form=useForm(); form.meta not reactive in template; ✅const form=reactive(useForm()) or const {meta}=useForm()
**Initial values**: ⚠undef defaults→incorrect dirty; always set initialValue/<Form initialValues={}
**Path lifecycle**: created lazily; destroyed on unmount unless keepValue
**Multi-step**: use keepValues/keepValuesOnUnmount
**Yup nested**: yup.object({user:yup.object({name:yup.string()})})
**Browser storage**: ⚠NO localStorage/sessionStorage in artifacts; use state/variables only
**Validation triggers**: interaction modes removed v4; reimplement via Composition API
**Pinia**: useForm in store→lifecycle issues
**Masked inputs**: sync formatted vs raw; validate raw via setValue/handleChange
**Slot/custom components**: still require type/value on <Field>
**Zod refine**: missing keys prevent execution
**Regex rule**: avoid g flag (instance reused)
**Array indices**: must be complete numbers for nesting
**meta.valid**: ⚠all fields validated AND valid for useIsFormValid
**Validation fn**: returns T|str|F|Promise; ctx={field,value,form,rule}
**Form submit**: auto-prevents default; no .prevent needed
**ErrorMessage name**: must match Field name exactly
**Controlled values**: controlledValues excludes dynamic setFieldValue; handleSubmit.withControlled passes only these
**Async initial**: use resetForm (not setValues) to set initial+current
**Schema errors**: always flat (not nested); ref by exact name like errors['users[0].name']
**FieldArray**: entry.key=unique ID (NOT index); requires Form/useForm parent
**Slot field binding**: v-bind="field" required for useField custom inputs
**Testing**: flushPromises + waitForExpect for async; test msg existence not content; mock FormContextKey/FieldContextKey
**defineField**: returns [Ref,bindings]; use for cleaner v-model patterns
**submitForm**: for native form submit (page reload)
**validateOnValueUpdate**: useField opt to disable auto validation on value change
**syncVModel**: useField opt; T=emit update:modelValue; str=emit update:{str}
**Standard Schema**: supports standardschema.dev libs (yup,zod,valibot,etc)
**Limits**: no exponential in integer rule; no THREE.CapsuleGeometry (r142+); bundle size for global rules

## Examples

**Schema-driven render**:
```vue
<Form><div v-for="{as,name,label,children,...attrs} in schema.fields" :key="name">
<label :for="name">{{label}}</label>
<Field :as="as" :id="name" :name="name" v-bind="attrs">
<component v-for="({tag,text,...cAttrs},i) in children" :key="i" :is="tag" v-bind="cAttrs">{{text}}</component>
</Field><ErrorMessage :name="name"/></div><button>Submit</button></Form>
```
Schema: {fields:[{name*,label,as,rules,type,...attrs,children:[{tag,value,text}]}]}

**Custom input w/ useField**:
```js
const {value,errorMessage}=useField(()=>props.name,rules,{validateOnValueUpdate:F,syncVModel:T})
```

**Checkbox**:
```js
const {checked,handleChange}=useField(()=>props.name,rules,{type:'checkbox',checkedValue:props.value,uncheckedValue:F})
```
```vue
<Field v-slot="{field}" name="x" type="checkbox" :value="T"><input type="checkbox" v-bind="field" :value="T"/></Field>
```

**defineField**:
```js
const [email,emailProps]=defineField('email',{props:s=>({error:s.errors[0],disabled:s.meta.pending})})
```

**Cross-field validation**:
```js
defineRule('confirmed',(val,[target],ctx)=>val===ctx.form[target]?T:'Must match')
// Usage: rules="confirmed:@password"
```

**Conditional validation**:
```vue
<input :value="value" @input="e=>handleChange(e,!!errorMessage)"/>
```