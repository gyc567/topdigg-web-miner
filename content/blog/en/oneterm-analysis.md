---
title: 'OneTerm Deep Dive: VeOps Open-Source Bastion Host — an Enterprise Security Access & Ops Audit Solution Based on the 4A Concept'
description: "A complete analysis of OneTerm by VeOps — a simple, lightweight, flexible enterprise bastion host built on the 4A security concept (Authentication, Authorization, Account, Audit). With a Go backend, Vue.js frontend, and Apache Guacamole proxy, it delivers multi-protocol secure access (SSH/RDP/VNC/Telnet/databases), session recording & replay, command control, time/IP access policies, OAuth2/LDAP/CAS SSO, SFTP file transfer, and one-click asset sync with VeOps CMDB. From core ideas and architecture to design philosophy, full Docker Compose deployment tutorial, and feature list."
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["OneTerm", "Bastion Host", "Jump Server", "4A Security", "SSH", "RDP", "VNC", "DevOps", "Go", "VeOps"]
categories: ["Deep Dive"]
keywords: ["OneTerm", "bastion host", "jump server", "4A security", "authentication", "authorization", "audit", "SSH", "RDP", "VNC", "session recording", "command control", "Docker deployment", "ops security"]
---

# OneTerm Deep Dive: VeOps Open-Source Bastion Host — an Enterprise Security Access & Ops Audit Solution Based on the 4A Concept

> Core idea: **A bastion host's essence is "one entry point to rule all servers" — funneling scattered remote access into a single secured node.** OneTerm is VeOps's open-source enterprise bastion host, built on the **4A security concept** (Authentication / Authorization / Account / Audit) with a **Go backend + Vue.js frontend + Apache Guacamole proxy** stack that delivers end-to-end ops security from authentication to audit. It supports SSH, RDP, VNC, Telnet, MySQL, PostgreSQL, MongoDB, Redis and more, providing session recording & replay, command template control, time/IP access policies, OAuth2/LDAP/CAS single sign-on, SFTP file transfer, and one-click asset sync with VeOps CMDB. A single `docker compose up -d` deploys the whole thing — solving enterprise ops security with maximum simplicity.

---

## 1. Project Overview

### 1.1 What Is It?

**OneTerm** is an **enterprise bastion host** (jump server) by VeOps. Its core proposition: **place a security checkpoint between users and servers** — all remote connections must pass OneTerm's authentication and authorization before reaching the target server.

Built on the **4A security concept**:

- **Authentication**: Who are you? (username/password, MFA, OAuth2/LDAP/CAS)
- **Authorization**: What can you access? (fine-grained role-based permissions)
- **Account**: Centrally manage user accounts and credentials
- **Audit**: What did you do? (full operation logs and session recording)

### 1.2 Key Facts

- Repository: `https://github.com/veops/oneterm`
- Stars: **1,524**
- Forks: **157**
- Author: **VeOps**
- Created: 2024-01-30
- Last push: 2026-02-03
- Latest release: v25.9.1 (2025-09-16)
- License: **AGPL-3.0**
- Language: **Go** (backend), **Vue.js** (frontend), Ant Design Vue (UI library)
- Commits: 389
- Contributors: 6
- Website: `v1ops.com`
- Online demo: `oneterm.v1ops.com` (demo/123456)

### 1.3 What Problem Does It Solve?

Enterprises have dozens or hundreds of servers needing remote management. The traditional approach — exposing SSH ports directly on every server — leads to scattered password management, zero operation audit trails, and catastrophic blast radius on breach. OneTerm's answer: **a bastion host as the sole entry point** — all connections pass through authentication and authorization, all operations are recorded, passwords are centrally managed. Even if one server is compromised, the attacker can't move laterally — because all traffic must flow through OneTerm.

---

## 2. Core Ideas

### 2.1 4A — The Four Pillars of Secure Ops

OneTerm's entire design revolves around **4A**:

- **Authentication**: Who are you? Supports username/password, MFA, OAuth2, LDAP, CAS SSO
- **Authorization**: What can you do? RBAC with fine-grained control down to the command level
- **Account**: Centralized credential management with password vaulting and automated rotation
- **Audit**: What did you do? Full operation logs, session recording & replay, command risk classification

### 2.2 Single Entry Point — Minimize Attack Surface

OneTerm exposes only one port (default 8666 for Web + 2222 for SSH); all servers stay internal. Even if an attacker breaches OneTerm, they only see authorized resources — not the entire internal network. This is textbook **attack surface minimization**.

### 2.3 Session Recording — The "Black Box" for Post-Incident Investigation

Every user session is fully recorded and stored (supporting local, S3, OSS, COS, MinIO, Azure Blob backends). When a security event occurs, administrators can replay the user's complete operation sequence like video footage — this is the core requirement for compliance auditing.

### 2.4 CMDB Integration — Assets as Code

OneTerm deeply integrates with VeOps CMDB (also open source), supporting one-click asset import. This keeps the bastion host's asset inventory in sync with the enterprise CMDB, eliminating manual list maintenance errors.

---

## 3. Architecture

### 3.1 Service Composition (Docker Compose)

OneTerm deploys as 5 Docker services:

- **oneterm-api**: Go backend API (port 2222 SSH / 8888 HTTP)
- **oneterm-guacd**: Apache Guacamole daemon (RDP/VNC/Telnet proxy, port 14822)
- **mysql**: MySQL 8.2.0 (port 13306)
- **redis**: Redis 7.2.3 (port 16379)
- **oneterm-ui**: Vue.js frontend + Nginx (port 8666)
- **acl-api**: ACL permission service (Flask/Python, port 5000)

### 3.2 Backend Structure

```
backend/
├── cmd/server/main.go           # Entry point
├── internal/
│   ├── api/                     # HTTP API layer (controllers, middleware, router, Swagger)
│   ├── connector/protocols/     # Protocol handlers: ssh.go, guacd.go, telnet.go, web.go, db/
│   ├── guacd/                   # Guacamole connection management
│   ├── service/                 # Business logic (account, asset, authorization, session)
│   ├── repository/              # Data access layer
│   ├── model/                   # Data models
│   ├── sshsrv/                  # SSH server implementation
│   ├── session/                 # Session recording and parsing
│   ├── web_proxy/               # Web proxy
│   └── tunneling/               # SSH tunnel management
└── pkg/storage/providers/       # Storage backends: s3, oss, cos, obs, oos, minio, azure, local
```

### 3.3 Frontend Structure

```
oneterm-ui/src/modules/oneterm/views/
├── access/          # Access control, authorization rules
├── assets/          # Asset management
├── connect/         # Terminal, Guacamole client, file management
├── log/             # Login logs, operation logs
├── replay/          # Session replay
├── session/         # Active sessions, history
└── workStation/     # Main workstation UI
```

---

## 4. Design Philosophy

### 4.1 "Simple, Lightweight" Is Intentional

The README opens with: **"A Simple, Lightweight, Flexible Bastion Host."** It doesn't aim to be a massive ops platform — it focuses solely on "secure access + audit." This means `docker compose up -d` deploys it, and ops teams don't need to learn a complex system.

### 4.2 4A Is Not a Slogan — It's an Architectural Constraint

4A in OneTerm isn't a poster on the wall — it's a hard architectural constraint: every connection must authenticate first, then be authorized, all operations must be audited, all accounts centrally managed. Remove any one of these four and it's not a bastion host.

### 4.3 Open Source but Not Stripped Down

Despite being open source, OneTerm covers enterprise bastion host essentials: MFA, LDAP/OAuth2/CAS SSO, command template control, time/IP access policies, multi-storage backends, CMDB integration. It doesn't "cripple" the open-source version — AGPL-3.0 ensures code remains open.

### 4.4 Leverage Mature Components, Don't Reinvent

OneTerm didn't write its own RDP/VNC proxy — it integrates Apache Guacamole (battle-tested remote desktop gateway). It didn't build its own permission system — it uses a separate ACL service. This "stand on giants" strategy lets OneTerm focus on core bastion host logic.

---

## 5. Step-by-Step Tutorial

### 5.1 Quick Deploy (Default Password)

```bash
git clone https://github.com/veops/oneterm.git
cd oneterm/deploy
docker compose up -d
```

Visit `http://127.0.0.1:8666`, username `admin`, password `123456`.

### 5.2 Secure Deploy (Custom Passwords)

```bash
git clone https://github.com/veops/oneterm.git
cd oneterm/deploy
./setup.sh          # Interactive secure password generation
docker compose up -d
```

### 5.3 Port Mapping

- **8666**: Web UI (Nginx + Vue.js)
- **2222**: SSH proxy
- **13306**: MySQL
- **16379**: Redis
- **14822**: Guacamole (RDP/VNC/Telnet proxy)

### 5.4 Development Setup

```bash
# Frontend dev (hot reload)
./dev-start.sh frontend

# Backend dev (hot reload)
./dev-start.sh backend

# Full environment
./dev-start.sh full

# Stop
./dev-start.sh stop
```

**Requirements**: Docker, Node.js 14.17.6+, Go 1.21.3+

### 5.5 Connect to Servers

After deployment:

1. Add assets (server IP, port, protocol)
2. Create users and assign authorization rules
3. User logs in → Workstation → select target server → Connect
4. Browser opens Web terminal (SSH) or Guacamole client (RDP/VNC)

### 5.6 Session Recording & Replay

All operations are automatically recorded after connection. Administrators can:

- View active sessions (real-time monitoring)
- Replay historical sessions (full operation playback)
- Export session logs

### 5.7 Command Control

Configure command templates in authorization rules:

- **Allowed command whitelist**: only specific commands permitted
- **Forbidden command blacklist**: block dangerous operations (e.g., `rm -rf`, `drop database`)
- **Command risk levels**: classify by risk, high-risk commands require secondary approval

### 5.8 CMDB Integration

If VeOps CMDB is deployed, one-click asset import syncs server information from CMDB to the bastion host — no manual re-entry needed.

---

## 6. Feature List

- **Multi-protocol support**: SSH, RDP, VNC, Telnet, MySQL, PostgreSQL, MongoDB, Redis
- **Session recording**: full operation capture, local/S3/OSS/COS/MinIO/Azure Blob storage
- **Session replay**: video-like playback of user operations
- **Session sharing**: share active sessions with other users
- **Command control**: command whitelist/blacklist, risk-level classification
- **Time-based access policies**: time-template-based access windows
- **IP whitelist**: IP-based access restrictions
- **Multi-factor authentication (MFA)**: via ACL service integration
- **OAuth2/LDAP/CAS**: enterprise SSO
- **Password management**: centralized vaulting, credential pass-through, auto-rotation
- **Web terminal**: browser-based SSH terminal (WebSocket)
- **Web proxy**: clientless web-based server access
- **File transfer**: SFTP upload/download
- **Storage backends**: local, S3, OSS, COS, OBS, OOS, MinIO, Azure Blob
- **CMDB integration**: one-click asset sync with VeOps CMDB
- **Statistics dashboard**: asset status, user rankings
- **Quick commands**: pre-defined command shortcuts
- **Docker deploy**: `docker compose up -d` one-command deployment

---

## 7. Key Takeaways

1. **A bastion host's value isn't in "technical complexity" — it's in "policy enforcement."** Many enterprises have bastion hosts nobody uses because ops staff find them cumbersome. OneTerm's Web terminal and one-click deploy lower the barrier, making policy enforcement feasible. Simplicity isn't laziness — it's the means by which security strategy actually gets implemented.

2. **4A is the minimum complete set for secure ops.** Authentication solves "who are you," authorization solves "what can you do," accounts solve "how to manage you," audit solves "what did you do" — these four dimensions cover core ops security requirements. OneTerm doesn't try to be a massive ops platform; it does 4A deeply.

3. **Docker Compose deploy is the best expression of "lightweight."** One command starts 6 services; 30 minutes from zero to running — a huge draw for SMBs. Complexity is encapsulated in Docker images; ops teams don't need to understand Go compilation, Vue.js builds, or MySQL configuration.

4. **Apache Guacamole exemplifies "don't reinvent the wheel."** RDP/VNC proxying is an extremely complex protocol implementation. OneTerm chose to integrate Guacamole rather than build from scratch — letting it focus on core bastion host logic (authentication, authorization, audit).

5. **AGPL-3.0 is a double-edged sword.** It ensures code remains open (all modifications must be contributed back), but it also means enterprises building SaaS services must open-source their modifications — a potential concern in commercial contexts.

6. **CMDB integration is "assets as code" in practice.** A bastion host's asset list maintained manually quickly becomes stale. CMDB integration keeps assets auto-synced, ensuring the bastion host always knows "which servers need protection."

---

## References

- Repository: `https://github.com/veops/oneterm`
- Website: `https://v1ops.com/`
- Online demo: `https://oneterm.v1ops.com/` (demo/123456)
- Product docs: `https://v1ops.com/docs/design/`
- VeOps CMDB: `https://github.com/veops/cmdb`
- VeOps ACL: `https://github.com/veops/acl`
- VeOps Messenger: `https://github.com/veops/messenger`
- Apache Guacamole: `https://guacamole.apache.org/`