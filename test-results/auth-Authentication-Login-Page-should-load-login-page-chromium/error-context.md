# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - img "Ozzyl" [ref=e5]
    - paragraph [ref=e6]: Login
  - generic [ref=e7]:
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]: Email
        - textbox "Email" [ref=e11]:
          - /placeholder: you@example.com
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: Password
          - link "Forgot Password?" [ref=e15] [cursor=pointer]:
            - /url: /auth/forgot-password
        - generic [ref=e16]:
          - textbox "Password" [ref=e17]:
            - /placeholder: ••••••••
          - button [ref=e18]:
            - img [ref=e19]
      - button "Login" [ref=e22]
    - generic [ref=e23]:
      - generic [ref=e28]: Or continue with
      - button "Continue with Google" [ref=e29]:
        - img [ref=e30]
        - text: Continue with Google
    - paragraph [ref=e36]:
      - text: Don't have an account?
      - link "Register" [ref=e37] [cursor=pointer]:
        - /url: /auth/register
```