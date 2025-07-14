import z from "zod";
export declare const signupInput: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SignupInput = z.infer<typeof signupInput>;
export declare const signInInput: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export type SignInInput = z.infer<typeof signInInput>;
export declare const createBlogInput: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
}, z.core.$strip>;
export type CreateBlogInput = z.infer<typeof createBlogInput>;
export declare const updateBlogInput: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    id: z.ZodNumber;
}, z.core.$strip>;
export type UpdateBlogInput = z.infer<typeof updateBlogInput>;
