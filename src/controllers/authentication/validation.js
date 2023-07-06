import * as Yup from "yup"
import YupPassword from 'yup-password';
YupPassword(Yup);

export const RegisterValidationSchema = Yup.object({
    username : Yup.string().required("Username is required"),
    password : Yup.string().required("Password is required"),
    email : Yup.string().email("Invalid email").required("Email is required"),
    phone : Yup.string().required("Phone is required")
})

export const LoginValidationSchema = Yup.object({
    username : Yup.string().required("Username is required"),
    password : Yup.string().required("Password is required")
})

export const EmailValidationSchema = Yup.object({
    email : Yup.string().email("Invalid email").required("Email is required")
})

export const IsEmail = async (email) => {
    return await EmailValidationSchema.isValid({ email })
}

export const changePasswordSchema = Yup.object({
  password: Yup.string()
    .required("Password is required")
    .notOneOf([Yup.ref('oldpassword')],"New and Current Password can't be the same")
    .min(6, 'password must contain 6 or more characters with at least one of each: uppercase, special character')
    .minUppercase(1, 'password must contain at least 1 upper case letter')
    .minSymbols(1, 'password must contain at least 1 special character')
});

export const changeUsernameSchema = Yup.object().shape({
  username : Yup.string()
  .min(5,'Username minimum 5 characters'),
});

export const changeEmailSchema = Yup.object().shape({
  email: Yup.string().email(),
});

export const changePhoneSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/[0-9]/,'phone must be a number')
    .matches(/0[0-9]/,'phone must start with 0')
    .min(10,'phone must contain 10 or more digits'),
});