---
title: "ToolJet: Complete Guide to Open-Source Low-Code Platform for Building Internal Tools"
date: "2026-08-16"
description: "Deep analysis of ToolJet open-source low-code platform - 39.5k Stars solution for building internal tools, covering architecture, plugin system, deployment, and tutorials"
tags:
  - ToolJet
  - Low-Code
  - Open Source
  - Internal Tools
  - Drag-and-Drop
  - Plugin System
  - React
  - Node.js
categories:
  - Low-Code Platform
  - Open Source
  - Internal Tools
  - Rapid Development
  - Enterprise Digitalization
---

# ToolJet: Complete Guide to Open-Source Low-Code Platform for Building Internal Tools

## Project Background and Core Problems

### The Internal Tools Dilemma

In modern enterprise digital transformation, **internal tools development** is often overlooked but critically important. Every enterprise has numerous internal needs: CRM systems, data dashboards, ticket systems, approval workflows, etc. However, traditional development approaches face many challenges:

| Pain Point | Traditional Development | Low-Code Platform |
|------------|------------------------|-------------------|
| **Development Cycle** | Weeks or even months | Hours to days |
| **Technical Barrier** | Requires professional developers | Business users can get started |
| **Maintenance Cost** | High maintenance fees | Visual maintenance |
| **Iteration Speed** | Slow, depends on development schedule | Fast, takes effect immediately |
| **Cost** | High labor costs | Significantly reduced |

### Why Choose ToolJet?

ToolJet was created to solve these problems. Released in 2021, it quickly became a star project in the open-source low-code platform field:

```
┌─────────────────────────────────────────────────────────────────┐
│                      ToolJet Core Metrics                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⭐ GitHub Stars:     39,500+                                   │
│  🍴 Forks:            5,300+                                     │
│  📊 Contributors:     200+                                       │
│  🔌 Data Sources:     80+                                        │
│  🧩 Components:       60+                                        │
│  📦 License:          AGPL-3.0                                   │
│  🌍 Deployment:       Self-hosted/Cloud/Hybrid                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Overview

### What is ToolJet?

ToolJet is an **open-source low-code platform** specifically designed for rapidly building and deploying internal tools, business applications, and data dashboards. Its core philosophy is:

> **"Enable development teams to build powerful internal tools with minimal time and effort, instead of reinventing the wheel."**

### Key Features at a Glance

| Feature | Description |
|---------|-------------|
| 🎨 **Visual Builder** | Drag-and-drop UI builder with 60+ responsive components |
| 🔗 **Data Source Integration** | Connect to 80+ data sources including databases, APIs, SaaS services |
| 📊 **Built-in Database** | ToolJet Database - no-code database solution |
| 🔄 **Multi-page Apps** | Support for complex multi-page applications and routing |
| 👥 **Collaborative Editing** | Real-time collaboration, multiple users editing simultaneously |
| 💻 **Code Execution** | Support for native JavaScript and Python execution |
| 🔌 **Plugin System** | Extend custom plugins via CLI |
| 🛡️ **Security Features** | AES-256-GCM encryption, SSO, role-based access control |
| ☁️ **Flexible Deployment** | Docker, Kubernetes, cloud provider one-click deployment |

---

## Deep Dive: Architecture Design

### Overall Architecture

ToolJet employs a modern microservices architecture design, primarily divided into the following core parts:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            ToolJet Architecture                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐              │
│   │  Frontend   │     │   Backend   │     │    CLI      │              │
│   │  (React)    │────▶│  (Node.js)  │────▶│  Plugin     │              │
│   └─────────────┘     └─────────────┘     └─────────────┘              │
│         │                   │                   │                       │
│         ▼                   ▼                   ▼                       │
│   ┌─────────────────────────────────────────────────────────┐          │
│   │                    Data Source Connection Layer          │          │
│   │  PostgreSQL │ MySQL │ MongoDB │ Redis │ S3 │ REST API  │          │
│   └─────────────────────────────────────────────────────────┘          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

Built with React, featuring:

- **Component-based Design**: 60+ pre-built components, freely combinable
- **State Management**: Using React Query for server state management
- **Drag-and-Drop Engine**: Based on react-dnd
- **Responsive Layout**: Supports desktop and mobile devices

**Core Tech Stack**:
```javascript
// Frontend Tech Stack
{
  "framework": "React 18",
  "language": "TypeScript",
  "state": "React Query + Zustand",
  "styling": "Tailwind CSS",
  "drag-drop": "react-dnd",
  "routing": "React Router"
}
```

### Backend Architecture

Built with Node.js, focused on API services and data processing:

- **RESTful API**: Complete CRUD operations
- **Data Proxy**: All data requests pass through backend proxy for security
- **Plugin Runner**: Isolated environment for plugin execution
- **Cache Layer**: Redis cache for query acceleration

**Core Tech Stack**:
```javascript
// Backend Tech Stack
{
  "runtime": "Node.js",
  "framework": "Express",
  "orm": "TypeORM",
  "cache": "Redis",
  "queue": "Bull",
  "database": "PostgreSQL"
}
```

### Plugin System Architecture

ToolJet's plugin system is one of its most distinctive features. Each plugin is an independent module containing:

```
┌─────────────────────────────────────────────────────────────┐
│                      Plugin Structure                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  my-plugin/                                                  │
│  ├── manifest.json          # Plugin metadata                │
│  ├── operations.json        # Define available operations    │
│  ├── index.html             # Frontend components            │
│  ├── icon.svg               # Plugin icon                    │
│  └── package.json           # Dependencies                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Design Philosophy

### Core Principles

ToolJet's design philosophy centers on several core principles:

#### 1. Democratizing Development

> **"Enable non-technical users to build professional-grade internal tools."**

ToolJet lowers the development barrier through visual interfaces while retaining code extension capabilities for technical teams when deep customization is needed.

#### 2. Security First

All data operations pass through the backend proxy - the frontend never connects directly to databases:

```
┌─────────────────────────────────────────────────────────────┐
│                    Secure Data Flow                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Frontend Component  ───▶  ToolJet API  ───▶  Data Source  │
│                               │                              │
│                               ▼                              │
│                        ┌──────────────┐                     │
│                        │ Security     │  • Authentication   │
│                        │ Checks       │  • Authorization    │
│                        │ Data Masking │  • SQL Injection    │
│                        └──────────────┘  • Sensitive Data   │
│                                            Filtering         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Open & Extensible

- **Fully Open Source**: Transparent code, auditable
- **Plugin Ecosystem**: Anyone can create and share plugins
- **Custom Components**: Support for deep UI and behavior customization

#### 4. Performance Oriented

- **Component Lazy Loading**: Load only visible components
- **Query Caching**: Reduce duplicate requests
- **Virtual Scrolling**: Efficient rendering of large data lists
- **Connection Pooling**: Database connection reuse

### Differences from Traditional Low-Code Platforms

| Dimension | ToolJet | Traditional SaaS Low-Code |
|-----------|---------|--------------------------|
| **Data Control** | Fully autonomous, self-hosted | Data on third-party platform |
| **Customization** | Open source, freely modifiable | Limited by platform capabilities |
| **Cost** | Free and open source, scale on demand | Per-user/per-feature pricing |
| **Vendor Lock-in** | None, fully autonomous | Highly dependent |
| **Community Ecosystem** | Open source community driven | Vendor led |

---

## Quick Start Tutorial

### Environment Requirements

Before starting, ensure your system meets the following requirements:

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **Memory** | 4 GB | 8 GB+ |
| **Disk** | 10 GB | 20 GB+ |
| **Docker** | 20.x+ | Latest version |
| **Node.js** | 18.x+ | 20.x LTS |

### Method 1: Docker Quick Deployment (Recommended)

This is the simplest way to get started:

```bash
# 1. Pull ToolJet image
docker pull tooljet/try:ee-lts-latest

# 2. Run container
docker run -d \
  --name tooljet \
  -p 8082:80 \
  -v tooljet_data:/var/lib/postgresql/13/main \
  --restart unless-stopped \
  tooljet/try:ee-lts-latest

# 3. Access application
# Open browser and visit http://localhost:8082
```

**Note**: First startup takes a few minutes for database initialization.

### Method 2: Local Development Environment

For users who want to deeply understand and customize:

```bash
# 1. Clone repository
git clone https://github.com/ToolJet/ToolJet.git
cd ToolJet

# 2. Install dependencies
npm install

# 3. Copy environment configuration
cp .env.example .env

# 4. Start database services
docker-compose up -d postgres redis

# 5. Run database migrations
npm run db:migrate

# 6. Seed data (optional)
npm run db:seed

# 7. Start development server
npm run dev

# 8. Visit http://localhost:8082
```

### Method 3: Kubernetes Deployment

For production environments:

```yaml
# Deploy using Helm
helm repo add tooljet https://tooljet.github.io/helm-charts
helm install tooljet tooljet/tooljet \
  --set database.url=postgresql://user:pass@host:5432/tooljet \
  --set redis.url=redis://host:6379 \
  --namespace tooljet \
  --create-namespace
```

---

## Hands-On Tutorial: Building a Task Tracker Application

### Step 1: Create a New Application

1. Log in to ToolJet Dashboard
2. Click **Create new app**
3. Enter application name: `Task Tracker`
4. Choose blank canvas or template

### Step 2: Configure Data Source

1. Click **Data Sources** in the left panel
2. Select **ToolJet Database**
3. Create tasks table:

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(50) DEFAULT 'medium',
  assignee VARCHAR(100),
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 3: Build UI Interface

Drag the following components from the left panel to the canvas:

```
┌─────────────────────────────────────────────────────────────┐
│  Task Tracker Application                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │  📋 New Task     │  │  Task List                      │  │
│  │                  │  │  ┌─────────────────────────┐   │  │
│  │  Title: [______] │  │  │ ☐ Task 1  [Pending] [H] │   │  │
│  │                  │  │  │ ☐ Task 2  [In Prog] [M] │   │  │
│  │  Description:    │  │  │ ☑ Task 3  [Done] [L]    │   │  │
│  │  [____________]  │  │  └─────────────────────────┘   │  │
│  │                  │  │                                 │  │
│  │  Priority: [▼]   │  │                                 │  │
│  │                  │  │                                 │  │
│  │  [Add Task]      │  │                                 │  │
│  └─────────────────┘  └─────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Component Configuration**:

| Component | Property | Configuration |
|-----------|----------|---------------|
| **Text Input (Title)** | variableName | `taskTitle` |
| **Text Area (Description)** | variableName | `taskDescription` |
| **Dropdown (Priority)** | options | `[{label: 'High', value: 'high'}, {label: 'Medium', value: 'medium'}, {label: 'Low', value: 'low'}]` |
| **Button** | text | `Add Task` |
| **Table** | data | `{{queries.tasks.data}}` |

### Step 4: Create Data Query

1. Click **Queries** panel
2. Add new query: `tasks`
3. Select data source: `ToolJet Database`
4. Enter SQL:

```sql
SELECT * FROM tasks ORDER BY created_at DESC;
```

5. Set auto-refresh interval: 5 seconds

### Step 5: Configure Event Handlers

Add click event to button:

| Event | Action | Configuration |
|-------|--------|---------------|
| `onClick` | Run Query | `queries.createTask` |

Create `createTask` query:

```sql
INSERT INTO tasks (title, description, priority)
VALUES ('{{components.taskTitle.value}}',
        '{{components.taskDescription.value}}',
        '{{components.priorityDropdown.value}}');
```

### Step 6: Preview and Publish

1. Click **Preview** in the upper right to preview effects
2. Test add, edit, delete functions
3. Click **Publish** when ready

---

## Data Source Integration Details

### Supported Data Source Categories

ToolJet supports 80+ data sources, divided into the following categories:

#### 1. Database Category

| Data Source | Type | Description |
|-------------|------|-------------|
| PostgreSQL | Relational | Most recommended, best performance |
| MySQL | Relational | Widely used |
| MongoDB | Document | Flexible schema |
| Redis | Key-Value | Cache and sessions |
| Elasticsearch | Search Engine | Logs and search |

#### 2. API Category

| Data Source | Description |
|-------------|-------------|
| REST API | Generic REST interface |
| GraphQL | GraphQL endpoints |
| WebSocket | Real-time communication |
| gRPC | High-performance RPC |

#### 3. Cloud Services Category

| Service | Category |
|---------|----------|
| AWS S3 | Object Storage |
| Google Sheets | Online Spreadsheets |
| Slack | Team Collaboration |
| Stripe | Payment Processing |
| Salesforce | CRM |
| Notion | Knowledge Management |

---

## Enterprise Features

### Security Features

#### 1. Data Encryption
- Transport Layer: TLS 1.3
- Storage Layer: AES-256-GCM
- Key Management: HashiCorp Vault integration support

#### 2. Access Control

```javascript
// Fine-grained permission configuration example
{
  "roles": [
    {
      "name": "admin",
      "permissions": ["*"]
    },
    {
      "name": "developer",
      "permissions": [
        "app:read",
        "app:write",
        "datasource:read",
        "query:execute"
      ]
    },
    {
      "name": "viewer",
      "permissions": [
        "app:read",
        "query:read"
      ]
    }
  ]
}
```

#### 3. SSO Integration

Multiple SSO protocols supported:
- SAML 2.0
- OAuth 2.0
- LDAP/Active Directory
- OIDC

### Team Collaboration

- **Real-time Collaboration**: Multiple users editing the same application simultaneously
- **Version Control**: Complete application version history
- **Comment System**: Add comments and discussions on components
- **Audit Log**: Record all operation history

---

## Summary and Conclusions

### Core Insights

#### 1. Core Value of Low-Code

The core value of low-code platforms is not "eliminating code", but:

> **"Automate repetitive work, let professionals do professional work."**

ToolJet quickly meets business needs through visual building while retaining code extension capabilities for customized needs.

#### 2. Strategic Significance of Open Source

Choosing an open-source low-code platform means:

| Dimension | Advantage |
|-----------|-----------|
| **Data Sovereignty** | Data completely under your control |
| **Cost Control** | No vendor lock-in, scale on demand |
| **Freedom to Customize** | Freely modify to meet specific needs |
| **Long-term Viability** | Not dependent on a single vendor's survival |

#### 3. Architecture Design Insights

ToolJet's architecture design provides excellent reference:

- **Frontend-Backend Separation**: Easy independent scaling and maintenance
- **Plugin Design**: Highly extensible
- **Security First**: All data through backend proxy
- **Performance Oriented**: Considers large data volume scenarios

### Use Cases

✅ **Highly Recommended for ToolJet**:

- Small and medium enterprises needing to quickly build internal tools
- Development teams needing rapid prototype validation
- Data-sensitive applications requiring private deployment
- Scenarios needing deep integration with existing systems

⚠️ **Needs Evaluation**:

- Very complex business processes (consider professional development)
- Ultra-high concurrency scenarios (requires additional optimization)
- Highly customized mobile applications

❌ **Not Ideal For**:

- Consumer-facing applications
- Games or multimedia applications
- Applications requiring OS-level functionality

---

## Resource Links

### Official Resources

| Resource | Link |
|----------|------|
| 🌐 Official Website | https://tooljet.com |
| 📚 Documentation | https://docs.tooljet.com |
| 💻 GitHub Repository | https://github.com/ToolJet/ToolJet |
| 💬 Slack Community | https://tooljet.com/slack |
| 🐦 Twitter | @ToolJet |

### Deployment Resources

| Platform | Documentation Link |
|----------|-------------------|
| Docker | https://docs.tooljet.com/docs/setup/docker |
| Kubernetes | https://docs.tooljet.com/docs/setup/kubernetes |
| AWS | https://docs.tooljet.com/docs/setup/ec2 |
| GCP | https://docs.tooljet.com/docs/setup/kubernetes-gke |
| Azure | https://docs.tooljet.com/docs/setup/kubernetes-aks |

---

## Conclusion

ToolJet represents an important direction in open-source low-code platforms—**providing sufficiently powerful features to meet enterprise needs while maintaining openness and customizability**.

Its design philosophy reminds us: **The value of technology lies not in how complex it is, but in whether it can truly solve practical problems**. For teams needing to quickly build internal tools, ToolJet is a worthwhile choice.

> **"Don't build it from scratch, build it with ToolJet."**

---

*This article is based on the ToolJet open-source project (AGPL-3.0 License). Information is sourced from GitHub repository and official documentation.*
