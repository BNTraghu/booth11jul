# Fix "Email not confirmed" for newly created users

New users created from the admin portal get "Email not confirmed" when they try to log in because Supabase is set to require email confirmation.

## Option A – Quick fix (recommended)

Turn off email confirmation for the project:

1. Open **Supabase Dashboard** → your project.
2. Go to **Authentication** → **Providers** → **Email**.
3. Turn **OFF** "Confirm email".
4. Save.

After this, both super-admin-created users (signUp) and org-admin-created users (Edge Function) can log in immediately without clicking a confirmation link.

---

## Option B – Keep "Confirm email" on

If you want to keep confirmation for other signup flows, make sure every **server-side** user creation sets the user as confirmed.

### 1. Edge Function `create-org-user` (org-admin-created users)

When creating the user with the GoTrue **Admin API**, pass `email_confirm: true`.

**JavaScript/TypeScript (Supabase Auth Admin):**

```ts
const { data, error } = await supabase.auth.admin.createUser({
  email: email,
  password: password,
  email_confirm: true,  // required so they can log in without confirmation link
  user_metadata: { name, ... },
});
```

**REST (GoTrue):**  
POST body should include `"email_confirm": true`.

### 2. Super-admin-created users (Add User page)

The app uses `supabase.auth.signUp()` for this path. The client API cannot set `email_confirm`. So you must either:

- Use **Option A** (disable "Confirm email"), or  
- Replace this flow with an Edge Function that uses `auth.admin.createUser()` with `email_confirm: true` (same pattern as above) and call that from the Add User page instead of `signUp`.
