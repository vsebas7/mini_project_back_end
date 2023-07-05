import * as Yup from "yup"

export const PublishBlogSchema = Yup.object({
    title: Yup.string()
    .required("Title is required"),
    content: Yup.string()
    .required("Content is required"),
    country: Yup.string()
    .required("Country is required"),
    category: Yup.string()
    .required("Category is required"),
    keywords: Yup.string()
    .required("Keywords is required"),
    picture: Yup.string()
    .required("Picture is required"),
    // date: Yup.string()
    // .required("Date is required"),
});