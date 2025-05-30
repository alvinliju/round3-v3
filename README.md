# bachmanfunded.xyz (formerly round3)

**Note:**  
We have rebranded from **round3** to **bachmanfunded.xyz** due to loss of access to our previous domain. All future development and updates will continue under the new name and domain.

## Why the Change?

We unfortunately lost access to the previous domain (round3), so we have pivoted and rebranded to **bachmanfunded.xyz**. All links, documentation, and branding have been updated accordingly.

### For Creators
- **Get paid for sharing updates** about your real work.
- **Get funded by your peers.**
- No extra writing, no pressure—just share what you're building.
- **Invite-only:** To create an account, you need an invite.

### For Readers
- **Support someone cool for just $5/month.**
- **Get real updates, ask questions, and access unique opportunities.**
- Know a founder who should be here? Invite them!

---

## 🧠 Personal Story: Why This Exists

I started building Round3 v2 three months ago. Here's the thing—I have crippling ADHD, and honestly, I've never finished a good project in my life. Every time I start something, I get distracted, lose focus, or just... abandon it halfway through.

This project is different. This is my personal testimony.

I didn't know Go very well when I started this. I thought maybe I could use my ADHD to my advantage this time—hyperfocus on one thing until it's done. And somehow, it worked. 

Looking at this code now, it's not perfect. I'm using in-memory maps because I was learning. The email HTML is literally just the URL string. There's a function called `fuckit()` because I was frustrated with routing. But you know what? **It works.**

The whole authentication flow works. The invite system works. Writers can post updates, readers can subscribe. I built a complete API that handles JWTs, magic links, CORS, middleware—all while learning Go.

It feels incredible to see the whole thing functioning. For the first time, I built something complete.

---

## 🛠️ How Does the Backend Work?

Built from scratch with Go (while learning Go):
- **Magic link authentication:** No passwords, just secure email links with JWT tokens
- **Invite-only system:** Writers need invites to join, complete with email verification
- **Subscription model:** Readers can subscribe to writers they want to follow
- **RESTful API:** Clean endpoints that work with any frontend
- **In-memory storage:** Maps and slices for now—keeping it simple while I learn
- **Email integration:** Using Resend for magic links and notifications
- **CORS ready:** Frontend can connect without issues

---

## 📋 API Endpoints

### 1. Invite a Writer
```bash
curl -X POST http://localhost:8080/invite-writer \
  -H "Content-Type: application/json" \
  -d '{"Email": "creator@example.com"}'
```

### 2. Writer Accepts Invite
```bash
curl -X POST http://localhost:8080/accept-invite \
  -H "Content-Type: application/json" \
  -d '{"ID": "invite-uuid", "Email": "creator@example.com", "Name": "Creator Name", "Website": "https://example.com"}'
```

### 3. Request Magic Link Login
```bash
curl -X POST http://localhost:8080/login/request \
  -H "Content-Type: application/json" \
  -d '{"WriterEmail": "creator@example.com"}'
```

### 4. Verify Magic Link & Get JWT
```bash
curl -X POST http://localhost:8080/login/verify \
  -H "Content-Type: application/json" \
  -d '{"Token": "magic-link-token"}'
```

### 5. Post an Update (Protected)
```bash
curl -X POST http://localhost:8080/post-update \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"Title": "My First Post", "Body": "This is my first update."}'
```

### 6. Subscribe to a Writer
```bash
curl -X POST http://localhost:8080/subscribe \
  -H "Content-Type: application/json" \
  -d '{"WriterEmail": "creator@example.com", "SubscriberEmail": "reader@example.com"}'
```

### 7. Discover Writers
```bash
curl -X GET http://localhost:8080/writers
```

---

## 💡 Why This Approach?

Building with **first principles thinking**:
- What's the fastest, simplest way for a founder to share their journey?
- How do we keep onboarding and authentication frictionless?
- How can readers support and interact with creators, not just consume content?

**Everything is designed for speed, simplicity, and real connection.**

---

## 🧑‍💻 Still Learning — Feedback Welcome!

> I'm still learning Go and building in public!
> 
> Yeah, I know the email HTML is just the URL string. I know I should probably use a database instead of maps. I know there's a function called `fuckit()` in my router (I was frustrated that day).
> 
> But this whole thing **works**. The authentication is secure, the API is clean, and I learned a ton building it.
> 
> If you spot ways to make it better or more "industry standard," please open an issue or PR. I'd love to learn from you.
> 
> This might be my first finished project, but I want it to be good.

---

## 🎯 What's Next?

- ✅ Backend API (Done!)
- 🔄 Frontend with React (In progress)
- 📊 Proper database (PostgreSQL probably)
- 💳 Payment processing for subscriptions  
- 📱 Mobile app maybe?
- 🎨 Better email templates (more than just URLs lol)

The backend works and handles everything I need. Now I just need to keep the momentum going and connect it to a proper frontend.

---

## 📄 License

MIT

---

**Built with Go, Gin, ADHD hyperfocus, and pure determination.**

*Thanks for checking out Round3. This one's personal.*