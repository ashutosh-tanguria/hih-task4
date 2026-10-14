# BAYORA: Secure Adversarial AI Safety-Testing Platform

> **"Test the AI. Trust the Arena."**  
> *Policy-enforced multi-tenant infrastructure for concurrent Red Team attacks, Blue Team defenses, and target LLM evaluations with zero cross-tenant leakage.*  
> **Solution for PS-04: Securing Adversarial AI Safety Testing Infrastructure**

---

## 1. Problem Statement & Core Thesis

In standard AI safety evaluations, Red Teams (adversaries), Blue Teams (defenders), and the Target LLM often run in a flat, shared container environment. This creates catastrophic security risks:
- Red Team attack payloads can be monitored by Blue before a test concludes.
- Blue Team defense logic and classifier weights can be inferred or reverse-engineered by Red.
- Shared prefix/KV caches in modern inference engines (e.g., vLLM) create an observable **timing side-channel**, allowing one tenant to infer what another tenant queried.
- Context contamination can survive evaluation teardowns.

**The Core Rule of Bayora:**  
> *"Communication is allowed; observation is not."*

```
RED ──┐
      │       capability-controlled inference
      ├──────> INFERENCE GATEWAY ──────> TARGET LLM
      │
BLUE ─┘

RED  -X- BLUE        (Cilium NetworkPolicy default-deny)
RED  -X- host        (gVisor user-space application kernel)
BLUE -X- host        (gVisor user-space application kernel)
RED  -X- target raw  (Direct socket bypass blocked; gateway only)
BLUE -X- target raw  (Direct socket bypass blocked; gateway only)
```

---

## 2. The 4-Plane Architecture

1. **Control Plane**:
   - Manages reproducible evaluation capsules, schedules workloads, coordinates state, and compiles human-readable security contracts into cluster policies.
   - *Stack:* Next.js 15, Fastify, PostgreSQL, BullMQ.
2. **Security Plane**:
   - Enforces namespace boundaries (`bayora-red`, `bayora-blue`, `bayora-target`), default-deny CNI NetworkPolicies, non-root execution, dropped Linux capabilities, and `runsc (gVisor)` application-kernel syscall intercept.
   - *Stack:* Kubernetes, gVisor, seccomp, cgroups v2, OPA Gatekeeper.
3. **Inference Plane**:
   - Mediates model interactions through a capability gateway. Enforces per-tenant vLLM prefix-cache salting, token budgets, and rate limits.
   - *Stack:* Inference Gateway (port 8443, mTLS), vLLM (APC Cache-Salted).
4. **Evidence Plane**:
   - Generates an immutable, append-only linear SHA-256 hash chain of all events, signed with Ed25519 root keys.
   - *Stack:* SHA-256 Hash Chain, OpenTelemetry, Signed Checkpoints.

---

## 3. The 3 Moments of Bayora

| Moment | Focus | Demonstration |
|---|---|---|
| **BLOCKED** | Boundary Isolation | Automated execution of 8 boundary probes (Red→Blue network access, direct model socket scans, procfs escapes, canary secret theft) showing deterministic packet drops. |
| **MEASURED** | Side-Channel Lab | Quantitative TTFT latency comparison between Blue Idle and Blue Busy. Baseline shared cache exhibits high timing leakage (AUC 0.894); Bayora's cache salting drops AUC to **0.512 (chance noise floor)**. |
| **VERIFIED** | Cryptographic Audit | Live linear SHA-256 hash chain with instant tamper detection if any event is doctored in offline storage. |

---

## 4. Key Interactive Modules

The platform is accessible via the **Security Console** (`/console/overview`):

1. **Overview Dashboard** (`/console/overview`): Real-time SecOps status, active sandboxes table, Red vs Blue posture, and forensic event stream.
2. **Evaluations Management** (`/console/evaluations`): Multi-step wizard to create, freeze, and run reproducible evaluation capsules.
3. **Sandbox & Isolation** (`/console/sandbox`): Dynamic topology graph with 8 automated boundary probes and terminal outputs.
4. **Red Team Workbench** (`/console/red-team`): Adversarial playground supporting HarmBench, AdvBench GCG, Gandalf, and ToxiGen.
5. **Blue Team Workbench** (`/console/blue-team`): Defensive mitigations matrix (Llama-Guard 3, GCG suffix traps, honeytoken filters) and before/after impact metrics.
6. **Inference Gateway** (`/console/gateway`): Capability authorization broker and request simulator testing authorized `model.inference` vs blocked `admin.reset`.
7. **Side-Channel Lab** (`/console/side-channel`): Live benchmark comparing Baseline vs Resource-Isolated vs Cache-Salted modes with AUC, accuracy, and mutual information.
8. **LLM Cache & Canaries** (`/console/llm-security`): Prefix-cache isolation analysis and post-reset contamination canary checks.
9. **Audit & Evidence** (`/console/audit`): Linear SHA-256 hash chain with 1-click verifier, safe tampering demo, and capsule download.
10. **Security Policies** (`/console/policies`): YAML contract editor with 1-click **Policy Compiler** outputting NetworkPolicies, OPA Gatekeeper constraints, and Gateway JSON.
11. **Findings & Regression Gate** (`/console/findings`): Categorized vulnerability findings, automated CI/CD security regression gates, and NIST AI RMF 1.0 reports.
12. **Settings** (`/console/settings`): Cluster mode switches, RBAC role simulation, and demo state reset.

---

## 5. Quickstart

### Prerequisites
- Node.js >= 20
- pnpm >= 10

### 1. Install Dependencies
```powershell
pnpm install
```

### 2. Environment Setup
The `.env` file is pre-configured at root:
```env
PORT=4000
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:3000
```

### 3. Run Development Servers
```powershell
pnpm dev
```
- **Security Console (Frontend):** [http://localhost:3000](http://localhost:3000)
- **API Engine (Backend):** [http://localhost:4000](http://localhost:4000)

### 4. Run Test Suite
```powershell
pnpm --filter @oosc/api test
```
*All 24 automated tests (including NIST SHA-256 test vectors, hash-chain tamper detection, and capability authorization) execute in < 2 seconds.*

### 5. Build for Production
```powershell
pnpm --filter @oosc/web build
```

---

## 6. Threat Model & Residual Risk

| Threat Vector | Enforced Control | Verification Experiment | Residual Risk |
|---|---|---|---|
| **Cross-Tenant Network** | Default-deny Cilium NetworkPolicy | TCP connection drop probe | Zero residual risk for direct L3/L4. |
| **Container Escape to Host** | gVisor user-space application kernel | Syscall interception probe | gVisor Sentry vulnerability defense-in-depth. |
| **Shared Prefix-Cache Timing** | vLLM per-tenant cache salt keying | TTFT idle/busy distribution test | Logical cache separated; sub-ms DRAM bus contention persists. |
| **Session Contamination** | Teardown hook & salt cycling | Synthetic canary extraction check | Protects inference session; does not cover model weights. |
| **Forensic Record Tampering** | Linear SHA-256 hash chain | Tamper detection block verifier | Full chain rewrite requires compromising offline root key. |

---

## 7. License
MIT License. Built for PS-04: Securing Adversarial AI Safety Testing Infrastructure.
