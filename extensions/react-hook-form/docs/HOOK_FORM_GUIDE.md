# React Hook Form Guide

## Quick Start

React Hook Form is configured in this project. See the [official documentation](https://react-hook-form.com/) for complete details.

## Essential Patterns

### Basic Form
Simple form handling:

```tsx
import { useForm } from 'react-hook-form';

interface FormData {
  firstName: string;
  email: string;
  age: number;
}

function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    await submitForm(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('firstName', { required: 'First name is required' })}
        placeholder="First Name"
      />
      {errors.firstName && <span>{errors.firstName.message}</span>}

      <input
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^\S+@\S+$/i,
            message: 'Invalid email address',
          },
        })}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Validation with Yup
Schema-based validation:

```tsx
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  age: yup.number().min(18, 'Must be 18 or older'),
});

function FormWithYup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName')} />
      {errors.firstName && <span>{errors.firstName.message}</span>}
      
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register('age')} type="number" />
      {errors.age && <span>{errors.age.message}</span>}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Controlled Components
Working with UI libraries:

```tsx
import { Controller } from 'react-hook-form';
import { TextField, Checkbox } from '@mui/material';

function ControlledForm() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="textField"
        control={control}
        defaultValue=""
        rules={{ required: 'This field is required' }}
        render={({ field, fieldState: { error } }) => (
          <TextField
            {...field}
            label="Name"
            error={!!error}
            helperText={error?.message}
          />
        )}
      />

      <Controller
        name="checkbox"
        control={control}
        defaultValue={false}
        render={({ field }) => (
          <Checkbox
            {...field}
            checked={field.value}
          />
        )}
      />
    </form>
  );
}
```

### Dynamic Fields
Handle dynamic form fields:

```tsx
import { useFieldArray } from 'react-hook-form';

function DynamicForm() {
  const { control, register, handleSubmit } = useForm({
    defaultValues: {
      users: [{ name: '', email: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'users',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id}>
          <input
            {...register(`users.${index}.name` as const, {
              required: 'Name is required',
            })}
            placeholder="Name"
          />
          <input
            {...register(`users.${index}.email` as const, {
              required: 'Email is required',
            })}
            placeholder="Email"
          />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
        </div>
      ))}
      
      <button type="button" onClick={() => append({ name: '', email: '' })}>
        Add User
      </button>
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Advanced Patterns

### Form Reset and Default Values
```tsx
const { reset, setValue } = useForm({
  defaultValues: {
    firstName: '',
    email: '',
  },
});

// Reset to default values
const handleReset = () => reset();

// Set specific field value
const handleSetEmail = () => setValue('email', 'test@example.com');

// Reset with new values
const handleResetWithData = () => reset({
  firstName: 'John',
  email: 'john@example.com',
});
```

### Watch Values
Monitor form changes:

```tsx
const { watch, register } = useForm();
const watchedValues = watch(); // Watch all fields
const firstName = watch('firstName'); // Watch specific field

// Watch with callback
useEffect(() => {
  const subscription = watch((value, { name, type }) => {
    console.log(value, name, type);
  });
  return () => subscription.unsubscribe();
}, [watch]);
```

## Performance Tips

- Use `defaultValues` to avoid unnecessary re-renders
- Implement proper validation strategies
- Use `mode: 'onBlur'` for better UX
- Leverage `Controller` for complex UI components

## Common Issues

### Uncontrolled to Controlled Warning
Always provide default values:
```tsx
const { register } = useForm({
  defaultValues: {
    name: '', // Always provide default
  },
});
```

### Validation Timing
Configure validation mode:
```tsx
const form = useForm({
  mode: 'onBlur', // or 'onChange', 'onSubmit'
  reValidateMode: 'onChange',
});
```

### TypeScript Issues
Properly type your form data:
```tsx
interface FormData {
  name: string;
  email: string;
}

const { register } = useForm<FormData>();
```

## Resources

- [React Hook Form Documentation](https://react-hook-form.com/)
- [API Reference](https://react-hook-form.com/api)
- [Examples](https://react-hook-form.com/get-started#Quickstart) 