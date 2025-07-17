# 💼 Mustathmir

**Mustathmir** is a role-based mobile application built with **React Native (Expo)** and powered by **Supabase**. It bridges the gap between **investors** and **business owners**, allowing both parties to connect, message, and collaborate.

Users are assigned a **role** during registration (Investor or Business Owner), and the app customizes their experience based on that role — from the dashboard to the interaction options.

---

## 🚀 Features

### 🧑‍💼 Investor Dashboard
- Discover a list of **business owners** and their ventures
- View their bios, project summaries, and contact options

<img src="https://github.com/user-attachments/assets/f23e2f78-1c4c-4f60-89c5-828f13de509e" width="200"/>

---

### 👩‍💼 Business Owner Dashboard
- Browse a list of **potential investors**
- View investor bios, interests, and funding focus

<img src="https://github.com/user-attachments/assets/0149a231-638e-4888-ab71-cc57d21277bb" width="200"/>

---

### 💬 Messaging & Notifications
- Real-time notifications when someone contacts you
- In-app messaging screen to send/receive messages
- Messages stored in Supabase
<img src="https://github.com/user-attachments/assets/4f354acc-0c6b-4940-be31-4c21c0a8e824" width="200"/>

---


### 👤 Profile Screen
- View and update user info based on role
- Editable fields: fullname, rol, city, sector, profile picture
- Role is fixed once selected during registration  

---

### ⚙️ Settings Screen
- Privacy Policy, Terms of Service
- Logout, clear local cache, toggle notifications  
<img src="https://github.com/user-attachments/assets/a1435a68-e49c-4229-87e2-6e79a0769495" width="200"/>

---


## 🧠 Role-Based Architecture

- Upon sign-up, users select a **role** (`investor` or `owner`)
- App renders:
  - `InvestorProfile` for investors
  - `OwnerProfile` for business owners
- Navigation and data are filtered accordingly
<img src="https://github.com/user-attachments/assets/b5ee4fad-ddad-46be-a718-01bd2e8aaa6f" width="200"/>
<img src="https://github.com/user-attachments/assets/e2472be7-1105-4a2f-9394-41400985c6ad" width="200"/>

---![6037317124785030983](


## 🔐 Authentication & User Data

### Supabase Auth
- Email/password sign-up and login
- Token-based session handling
- Supabase handles password security and session refresh

### Extended User Profile
Additional fields collected during sign-up and stored in `profiles` table:
| Field                     | Type   | Description                             |
|---------------------------|--------|-----------------------------------------|
| `id`                      | UUID   | Supabase user ID                        |
| `email`                   | Text   | Authenticated email                     |
| `role`                    | Text   | `investor` or `owner`                   |
| `full_name`               | Text   | Full name                               |
| `city`                    | Text   | Brief bio or description                |
| `sector`                  | Text   | Optional location field                 |
| `profile_picture`         | Text   | optional picture (stored in storage     |

---

## 🛠️ Tech Stack

- **React Native (Expo)**
- **Supabase** (Auth, Database, Realtime)
- **AsyncStorage** for local caching
- **React Navigation** for role-based navigation
- **stylesheeyt** for styling

---

## 📦 Installation

### Prerequisites
- Node.js & npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase project (see below)

---

1. **Clone the repository**

```bash
git clone https://github.com/aymen-Dahmoun/mustathmir_prototype
cd mustathmir_prototype
