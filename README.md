# 🔐 EasyChat — Secure End-to-End Encrypted Chat Application

EasyChat is a **secure, real-time, one-to-one chat application** built with a strong focus on **privacy, cryptography, and cloud-native deployment**.  
It guarantees **true end-to-end encryption (E2EE)**, ensuring that only the communicating users can read messages — **not even the server or database**.

---

### 🔗 Live Application
(Please wait for 2–3 minutes while the server wakes up.)
👉 https://easychateasy.vercel.app
## 🧩 Overview

EasyChat enables authenticated users to exchange messages securely in real time using modern cryptographic standards.

The system is designed so that:

- 🔒 Messages are encrypted on the client before transmission
- 🚫 The server never sees plaintext data
- 🔐 Only encrypted payloads are stored in the database
- ⚙️ All sensitive configuration is handled via environment variables

---

## ✨ Key Features

- 🔐 True End-to-End Encryption (E2EE)
- 🔑 Elliptic Curve Diffie-Hellman (ECDH) for secure key exchange
- 🧊 AES-256-GCM for message encryption
- 🪪 JWT-based authentication & authorization
- ⚡ Real-time messaging using WebSockets
- ☁️ Cloud-native, containerized deployment
- 📦 No secrets committed to source control

---

## 🔒 Security & Cryptography

EasyChat follows industry-grade cryptographic practices:

- Client-side key generation and encryption
- Secure key exchange using ECDH
- Message encryption with AES-256-GCM
- Stateless authentication via JWT
- Database stores only encrypted messages

> 🔐 Even if the database is compromised, message content remains unreadable.

---

## ⚙️ Architecture

### 🖥️ Backend

- Built with Spring Boot (MVC architecture)
- WebSockets for real-time communication
- JWT for stateless authentication
- Encrypted chat persistence using PostgreSQL
- Fully Dockerized for cloud deployment

### 🌐 Frontend

- Built using React
- Responsive UI (desktop & mobile)
- Performs all cryptographic operations client-side
- Communicates via REST APIs and WebSockets

---

## ☁️ Deployment & Infrastructure

- Frontend: Deployed on Vercel
- Backend: Dockerized Spring Boot app deployed on Render
- Database: PostgreSQL hosted on Neon
- Monorepo with isolated frontend & backend deployments



---

## 🔧 Environment Configuration

EasyChat uses an environment-driven configuration model to support multiple environments and to avoid hardcoding secrets.

---

## 🖥️ Backend Configuration (Spring Boot)

application.properties:

    server.port=${PORT}
    spring.datasource.url=${SPRING_DATASOURCE_URL}
    spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
    spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}

    jwt.secret=${JWT_SECRET}

    mailjet.api-key=${MAILJET_API_KEY}
    mailjet.secret-key=${MAILJET_SECRET_KEY}

    app.base-url=${APP_BASE_URL}

### 📄 Example .env (Backend – Local)

    PORT=8080

    SPRING_DATASOURCE_URL=jdbc:postgresql://<host>/<database>
    SPRING_DATASOURCE_USERNAME=<username>
    SPRING_DATASOURCE_PASSWORD=<password>

    JWT_SECRET=<secure-secret>

    MAILJET_API_KEY=<mailjet-api-key>
    MAILJET_SECRET_KEY=<mailjet-secret-key>

    APP_BASE_URL=https://easychateasy.vercel.app

📌 .env files are intentionally excluded from version control.

---

## 🌐 Frontend Configuration (React)

The frontend reads environment variables at build time using the REACT_APP_ prefix.

### 📄 Example .env (Frontend – Local)

    REACT_APP_API_BASE=http://localhost:8080

This defines the base API URL for backend communication.

In production, the same variable is configured via Vercel Environment Settings.

---

## 🛡️ Privacy First

EasyChat is designed with a zero-trust server model:

- No plaintext messages
- No shared encryption keys
- No secret leakage
- No hardcoded credentials

---

## 👤 Author

Tanmay Zade

---

## ⭐ Support

If you find EasyChat useful or inspiring, please consider giving it a ⭐  
Your support helps drive further improvements and features 🚀
