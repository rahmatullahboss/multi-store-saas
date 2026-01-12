# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - heading "Multi-Store SaaS" [level=1] [ref=e5]
    - paragraph [ref=e6]: Login
  - generic [ref=e7]:
    - generic [ref=e8]:
      - generic [ref=e9]:
        - paragraph [ref=e10]: ইমেইল বা পাসওয়ার্ড ভুল
        - paragraph [ref=e11]: "Error Code: USER_NOT_FOUND"
      - generic [ref=e12]:
        - generic [ref=e13]: Email
        - textbox "Email" [ref=e14]:
          - /placeholder: you@example.com
          - text: wrong@example.com
      - generic [ref=e15]:
        - generic [ref=e16]:
          - generic [ref=e17]: Password
          - link "Forgot Password?" [ref=e18] [cursor=pointer]:
            - /url: /auth/forgot-password
        - generic [ref=e19]:
          - textbox "Password" [ref=e20]:
            - /placeholder: ••••••••
            - text: wrongpassword
          - button [ref=e21]:
            - img [ref=e22]
      - button "Login" [ref=e25]
    - generic [ref=e26]:
      - generic [ref=e31]: orContinueWith
      - button "Google দিয়ে চালিয়ে যান" [ref=e32]:
        - img [ref=e33]
        - text: Google দিয়ে চালিয়ে যান
    - paragraph [ref=e39]:
      - text: Don't have an account?
      - link "Register" [ref=e40] [cursor=pointer]:
        - /url: /auth/register
```