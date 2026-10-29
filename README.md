# 🚀 CryptoX — Enterprise Cryptocurrency Trading & Portfolio Platform

<div align="center">

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.0-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-7.1.0-6DB33F?style=for-the-badge&logo=spring-security&logoColor=white)
![React](https://img.shields.io/badge/React-19.0.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-8.2.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![CoinGecko](https://img.shields.io/badge/CoinGecko-Market_API-8DC63F?style=for-the-badge&logo=coingecko&logoColor=white)

**A high-performance, full-stack cryptocurrency exchange and asset management platform engineered with a Spring Boot 4 REST API, MySQL, and a modern React 19 trading terminal.**

[Features](#-key-features) • [Architecture](#-system-architecture) • [Trading Lifecycle](#-step-by-step-trading-lifecycle) • [File Structure](#-project-directory-map) • [Database Schema](#-database-schema--entity-relationships) • [API Catalog](#-rest-api-catalog) • [Getting Started](#-setup--deployment-guide) • [Diagnostics Log](#-engineering--bug-diagnostics-chronicle)

</div>

---

## 📖 Executive Summary

**CryptoX** is an enterprise-grade digital asset exchange and portfolio tracking system. Designed to mirror tier-1 exchanges like Binance and Coinbase, CryptoX decouples real-time cryptocurrency telemetry from sensitive financial transactions. It provides traders with interactive technical analysis charts, instant limit/market order execution, automated wallet bookkeeping, two-factor authentication (2FA), bank withdrawal processing, and an intelligent AI Trading Copilot.

---

## 🏛️ System Architecture

CryptoX implements a decoupled client-server architecture with stateless JWT security, in-memory caching for market feeds, and ACID-compliant transaction processing:

```mermaid
flowchart TB
    subgraph ClientLayer ["Client Layer (React 19 + Vite) :5173"]
        UI["Dark-Mode Trading Terminal & Dashboard"]
        Charts["Interactive SVG/Canvas Price Charts (1D, 7D, 30D, 1Y)"]
        State["State Management: AuthContext | WalletContext | ToastContext"]
        AxiosClient["apiClient (Axios Proxy + Bearer Token Interceptor)"]
        Copilot["Floating AI Trading Copilot"]

        UI --> State
        Charts --> State
        Copilot --> State
        State --> AxiosClient
    end

    subgraph SecurityLayer ["Security & Routing Layer"]
        CORS["CORS Filter (Allow Origins: :5173, :3000)"]
        JWTVal["JwtTokenValidator (Stateless Filter)"]
        FilterChain["Spring Security 7 Filter Chain"]

        CORS --> JWTVal --> FilterChain
    end

    subgraph ServiceLayer ["Service Layer (Spring Boot 4.1.0) :5454"]
        AuthCtrl["AuthController (/auth/**)"]
        CoinCtrl["CoinController (/coins/**)"]
        WalletCtrl["WalletController (/api/wallet/**)"]
        OrderCtrl["OrderController (/api/orders/**)"]
        AssetCtrl["AssetController (/api/assets/**)"]
        WithdrawCtrl["WithdrawalController (/api/withdrawal/**)"]
        
        CoinService["CoinServiceImpl + 60s In-Memory Cache"]
        OrderService["OrderServiceImpl (Trade Engine)"]
        WalletService["WalletServiceImpl (Fiat Balances)"]
    end

    subgraph DataLayer ["Data & External Integration Layer"]
        MySQL[("MySQL 8 Database: my_treadingappdb")]
        CoinGecko["CoinGecko Market API (HTTPS)"]
        Gateways["Payment Gateways (Stripe & Razorpay)"]
    end

    AxiosClient -->|REST Calls| SecurityLayer
    FilterChain --> AuthCtrl & CoinCtrl & WalletCtrl & OrderCtrl & AssetCtrl & WithdrawCtrl
    CoinCtrl --> CoinService
    OrderCtrl --> OrderService
    WalletCtrl --> WalletService
    CoinService --> CoinGecko
    CoinService --> MySQL
    OrderService & WalletService --> MySQL
    WalletService --> Gateways
```

---

## ✨ Key Features

- **📊 Live Markets & Precision Analytics**: Paginated feeds of top cryptocurrencies with 24h highs, lows, trading volumes, market capitalizations, and percentage changes.
- **📈 Advanced Technical Charts**: Multi-timeframe interactive price series (1D, 7D, 30D, 1Y) with dynamic cursor inspection and crosshair price labels.
- **⚡ Instant Trade Execution**: Atomic BUY and SELL order matching engine with pre-trade balance validation and instant asset balance allocation.
- **💼 Multi-Asset Portfolio Tracker**: Real-time portfolio net worth tracking, average buy-price calculations, and unrealized profit/loss metrics.
- **💳 Fiat Wallet & Payments**: Integrated Stripe and Razorpay deposit flows, wallet-to-wallet transfers, bank withdrawal requests, and immutable transaction ledgers.
- **🔐 Enterprise Security & 2FA**: Stateless JWT authentication, BCrypt password hashing, and Two-Factor Authentication via OTP.
- **🤖 Built-in AI Trading Copilot**: Real-time conversational trading assistant for market sentiment analysis, technical indicators, and app navigation.
- **🛡️ High Availability & Offline Resilience**: In-memory response caching (60s TTL) with automatic database failovers to guarantee 100% uptime even during external API outages.

---

## 🔄 Step-by-Step Trading Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Trader as Trader (Browser)
    participant UI as React Frontend (:5173)
    participant Backend as Spring Boot (:5454)
    participant DB as MySQL Database (:3306)
    participant Feed as CoinGecko API

    Trader->>UI: 1. Signs up on /signup or logs in on /signin
    UI->>Backend: POST /auth/signin {email, password}
    Backend->>DB: Verify credentials (BCrypt)
    Backend-->>UI: Return JWT Bearer Token
    Note over UI: Token stored in memory / local storage

    Trader->>UI: 2. Deposits funds on /wallet
    UI->>Backend: PUT /api/wallet/deposit {amount: $10,000}
    Backend->>DB: Update wallet balance + record WalletTransaction
    Backend-->>UI: New balance reflected ($10,000.00)

    Trader->>UI: 3. Opens /trade/bitcoin
    UI->>Backend: GET /coins/details/bitcoin & GET /coins/bitcoin/chart?days=7
    alt Cache Hit (<60s)
        Backend-->>UI: Instant cached response
    else Cache Expired / Miss
        Backend->>Feed: Safe GET /coins/bitcoin
        Feed-->>Backend: Market JSON
        Backend->>DB: Sync latest price to `coin` table
        Backend-->>UI: Return fresh market data
    end

    Trader->>UI: 4. Places order: BUY 0.1 BTC ($8,000)
    UI->>Backend: POST /api/orders/pay {coinId: "bitcoin", quantity: 0.1, type: "BUY"}
    Backend->>DB: Check wallet balance >= $8,000
    Backend->>DB: Deduct $8,000 from Wallet
    Backend->>DB: Credit 0.1 BTC to user's Asset table
    Backend->>DB: Insert Order record (Status: SUCCESS)
    Backend-->>UI: Order confirmation + updated portfolio
```

---

## 📁 Project Directory Map

```
trading/
├── pom.xml                                  # Maven dependencies & build definitions
├── mvnw.cmd / mvnw                          # Maven wrapper executables
├── README.md                                # Master project documentation
│
├── src/main/java/com/tradingapp/            # Backend Core
│   ├── TradingApplication.java              # Spring Boot Application entrypoint
│   ├── config/                              # Security & Application Configuration
│   │   ├── AppConfig.java                   # CORS, SecurityFilterChain, PasswordEncoder
│   │   ├── JwtConstant.java                 # JWT Header & Secret definitions
│   │   ├── JwtProvider.java                 # JWT generation and claim parsing
│   │   └── JwtTokenValidator.java           # Stateless request token validation filter
│   ├── controller/                          # REST API Endpoints
│   │   ├── AuthController.java              # /auth/signup, /auth/signin, /auth/two-factor
│   │   ├── CoinController.java              # /coins, /coins/top50, /coins/trending, /chart
│   │   ├── WalletController.java            # /api/wallet, deposits, transfers
│   │   ├── OrderController.java             # /api/orders, order placement
│   │   ├── AssetController.java             # /api/assets, portfolio holdings
│   │   ├── WatchlistController.java         # /api/watchlist, favorites
│   │   ├── WithdrawalController.java        # /api/withdrawal, payout processing
│   │   ├── PaymentDetailsController.java    # /api/payment-details, bank accounts
│   │   ├── PaymentController.java           # Payment gateway initiation
│   │   └── UserController.java              # User profile & 2FA management
│   ├── modal/                               # JPA Database Entities
│   │   ├── User.java                        # User account model
│   │   ├── Coin.java                        # Cryptocurrency model (with lifecycle hooks)
│   │   ├── Wallet.java                      # Cash wallet model
│   │   ├── WalletTransaction.java           # Wallet transaction ledger
│   │   ├── Order.java                       # Trade order record
│   │   ├── OrderItem.java                   # Order item pricing and quantity
│   │   ├── Asset.java                       # Owned crypto token holding
│   │   ├── Watchlist.java                   # User pinned coins
│   │   ├── Withdrawal.java                  # Payout request model
│   │   ├── PaymentDetails.java              # Bank account information
│   │   └── TwoFactorAuth.java               # 2FA settings & verification status
│   ├── repository/                          # Spring Data JPA Repositories
│   └── service/                             # Business Logic & Integrations
│       ├── CoinServiceImpl.java             # CoinGecko integration, 60s cache & fallbacks
│       ├── OrderServiceImpl.java            # Order execution and balance updates
│       └── WalletServiceImpl.java           # Wallet credit/debit management
│
└── treading-react/                          # Frontend Application (Vite + React 19)
    ├── package.json                         # Node dependencies & scripts
    ├── vite.config.js                       # Vite build setup with backend proxy
    └── src/
        ├── App.jsx                          # Main routing & layout component
        ├── index.css                        # Tailwind CSS v4 styling & dark theme
        ├── api/
        │   ├── apiClient.js                 # Axios instance with Bearer interceptors
        │   ├── authApi.js                   # Authentication API services
        │   ├── coinApi.js                   # Market & charting API services
        │   ├── walletApi.js                 # Wallet and deposit API services
        │   └── mockData.js                  # Comprehensive demo data fallbacks
        ├── context/
        │   ├── AuthContext.jsx              # Global authentication state
        │   ├── WalletContext.jsx            # Live wallet balance & sync state
        │   └── ToastContext.jsx             # Global user notification toasts
        ├── components/
        │   ├── Navbar.jsx                   # Sticky exchange navigation bar
        │   ├── PriceChart.jsx               # Interactive SVG/Canvas financial chart
        │   ├── LiveTicker.jsx               # Scrolling real-time price tape
        │   ├── TradeModal.jsx               # Quick buy/sell modal dialog
        │   ├── SearchModal.jsx              # Spotlight search dialog for coins
        │   └── AICopilot.jsx                # Floating AI trading assistant
        └── page/
            ├── Home/                        # Exchange overview & top gainers
            ├── Trade/                       # Trading terminal with order books
            ├── Market/                      # Searchable, paginated crypto list
            ├── Wallet/                      # Balances, deposits, and transfers
            ├── Portfolio/                   # Asset allocation & performance
            ├── Orders/                      # Open and historical trade orders
            ├── Watchlist/                   # User pinned cryptocurrencies
            ├── Profile/                     # User security & 2FA toggles
            ├── Withdrawal/                  # Bank transfer payout history
            ├── PaymentDetails/              # Saved bank account manager
            └── Auth/                        # Login, Registration & OTP verification
```

---

## 🗄️ Database Schema & Entity Relationships

The MySQL database `my_treadingappdb` is structured around relational integrity:

```mermaid
erDiagram
    USER ||--o{ WALLET : owns
    USER ||--o{ ORDERS : places
    USER ||--o{ ASSET : holds
    USER ||--o{ WATCHLIST : manages
    USER ||--o{ WITHDRAWAL : requests
    USER ||--o{ PAYMENT_DETAILS : registers

    WALLET ||--o{ WALLET_TRANSACTION : records
    ORDERS ||--|| ORDER_ITEM : contains
    ORDER_ITEM }o--|| COIN : references
    ASSET }o--|| COIN : references

    USER {
        bigint id PK
        string email
        string full_name
        string password
        string role
        boolean is_enabled
    }

    COIN {
        string id PK
        string name
        string symbol
        double current_price
        bigint market_cap
        int market_cap_rank
        double price_change_24h
        double price_change_percentage_24h
        double market_cap_change24h
        double market_cap_change_percentage24h
        bigint total_volume
        bigint circulating_supply
        bigint total_supply
        bigint max_supply
        double high24h
        double low24h
        string image
        datetime last_updated
    }

    WALLET {
        bigint id PK
        bigint user_id FK
        decimal balance
    }

    WALLET_TRANSACTION {
        bigint id PK
        bigint wallet_id FK
        string type
        datetime date
        string transfer_id
        string purpose
        decimal amount
    }

    ORDERS {
        bigint id PK
        bigint user_id FK
        string order_type
        decimal price
        datetime timestamp
        string status
        bigint order_item_id FK
    }

    ASSET {
        bigint id PK
        bigint user_id FK
        string coin_id FK
        double quantity
        double buy_price
    }
```

---

## 📡 REST API Catalog

### 1. Public Authentication (`/auth`)
| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Register a new user | `{ "fullName": "Jane Doe", "email": "jane@example.com", "password": "securePassword" }` |
| `POST` | `/auth/signin` | Sign in with email and password | `{ "email": "jane@example.com", "password": "securePassword" }` |
| `POST` | `/auth/two-factor/otp/{otp}` | Complete 2FA login | URL parameter `{otp}` |

### 2. Market Data (`/coins`) — Public
| Method | Endpoint | Description | Query Parameters |
| :--- | :--- | :--- | :--- |
| `GET` | `/coins` | Retrieve paginated crypto list | `?page=1` |
| `GET` | `/coins/top50` | Retrieve Top 50 cryptocurrencies | None |
| `GET` | `/coins/trending` | Retrieve trending tokens | None |
| `GET` | `/coins/search` | Search coins by keyword | `?q=bitcoin` |
| `GET` | `/coins/details/{coinId}` | Retrieve full stats for single coin | None |
| `GET` | `/coins/{coinId}/chart` | Historical price chart series | `?days=7` (1, 7, 30, 365) |

### 3. Core Exchange & User Services (`/api`) — Protected (`Bearer <JWT>`)
| Method | Endpoint | Description | Payload / Action |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Get logged-in user profile | Header: `Authorization: Bearer <jwt>` |
| `GET` | `/api/wallet` | Fetch wallet and USD balance | Header: `Authorization: Bearer <jwt>` |
| `PUT` | `/api/wallet/deposit` | Add funds to wallet balance | `{ "amount": 5000.0 }` |
| `PUT` | `/api/wallet/{id}/transfer` | Send USD to another user wallet | `{ "amount": 250.0, "purpose": "Settlement" }` |
| `POST` | `/api/orders/pay` | Place a BUY or SELL order | `{ "coinId": "bitcoin", "quantity": 0.1, "orderType": "BUY" }` |
| `GET` | `/api/orders` | Fetch user trade order history | Header: `Authorization: Bearer <jwt>` |
| `GET` | `/api/assets` | Retrieve all owned crypto tokens | Header: `Authorization: Bearer <jwt>` |
| `GET` | `/api/watchlist/user` | Retrieve user pinned watchlist | Header: `Authorization: Bearer <jwt>` |
| `PATCH` | `/api/watchlist/add/coin/{id}` | Pin or unpin coin to watchlist | URL parameter `{id}` |
| `POST` | `/api/withdrawal/{amount}` | Submit bank withdrawal request | URL parameter `{amount}` |
| `GET` | `/api/withdrawal` | View withdrawal history and status | Header: `Authorization: Bearer <jwt>` |
| `POST` | `/api/payment-details` | Save user bank account details | `{ "accountNumber": "...", "ifsc": "...", "bankName": "..." }` |
| `GET` | `/api/payment-details` | Retrieve saved bank details | Header: `Authorization: Bearer <jwt>` |

---

## ⚡ Setup & Deployment Guide

### Prerequisites
- **Java Development Kit (JDK)**: Version 21 or higher
- **Node.js**: Version 18 or higher (with npm)
- **MySQL Server**: Version 8.0 or higher

---

### Step 1: Database Setup
1. Start your local MySQL service.
2. Create the target database:
   ```sql
   CREATE DATABASE IF NOT EXISTS my_treadingappdb;
   ```
3. Verify connection settings in [`src/main/resources/application.properties`](file:///c:/Users/DELL/Desktop/trading/src/main/resources/application.properties):
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/my_treadingappdb
   spring.datasource.username=root
   spring.datasource.password=Hussain@1234
   ```

---

### Step 2: Launch the Backend (:5454)
Open a terminal in the project root:
```powershell
.\mvnw.cmd spring-boot:run
```
*Or open the project in IntelliJ IDEA and run `TradingApplication.java`.*

Once initialized, the backend will be live on:
**`http://localhost:5454`**

---

### Step 3: Launch the Frontend (:5173)
Open a second terminal in the frontend directory:
```powershell
cd treading-react
npm install
npm run dev
```

Once initialized, the trading terminal will be live on:
**`http://localhost:5173`**

---

## 🛠️ Engineering & Bug Diagnostics Chronicle

During development and frontend-to-backend integration, 5 critical issues were systematically diagnosed and resolved:

```mermaid
flowchart LR
    Bug1["1. Port 5454 Conflict"] --> Fix1["Killed background PID"]
    Bug2["2. JWT Filter 500 Crash"] --> Fix2["SecurityContextHolder.clearContext()"]
    Bug3["3. Missing Param on /coins"] --> Fix3["Added defaultValue = '1'"]
    Bug4["4. CoinGecko TLS 429 Errors"] --> Fix4["Clean GET headers + 60s Cache"]
    Bug5["5. MySQL Column NOT NULL"] --> Fix5["ALTER TABLE + @PrePersist hooks"]
```

### 1. Port 5454 Conflict (`Port was already in use`)
- **Root Cause**: A background process from an earlier run remained bound to port 5454.
- **Resolution**: Identified the PID via PowerShell `Get-NetTCPConnection` and terminated it, freeing the port.

### 2. Servlet Container Crash on Unauthenticated Requests (`RuntimeException: invalid token...`)
- **Root Cause**: `JwtTokenValidator.java` threw an unhandled `RuntimeException` whenever public requests or demo users connected without a valid JWT. This caused Tomcat to abort with HTTP 500.
- **Resolution**: Replaced the exception throw with `SecurityContextHolder.clearContext()`. Unauthenticated requests pass cleanly to public routes (`/auth/**`, `/coins/**`) and return HTTP 401s only on protected routes.

### 3. Missing Request Parameter on Markets (`Optional int parameter 'page'`)
- **Root Cause**: In `CoinController.java`, the primitive parameter `int page` had no default value, throwing an `IllegalStateException` when `/coins` was requested without query parameters.
- **Resolution**: Updated the controller signature with `@RequestParam(name = "page", defaultValue = "1") int page`.

### 4. CoinGecko TLS Decryption Failure & Rate Limiting (`AEADBadTagException: Tag mismatch` & `429 Too Many Requests`)
- **Root Cause**:
  1. `CoinServiceImpl` was sending `"parameters"` as request body inside HTTP `GET` requests. Cloudflare abruptly closed the TLS 1.3 stream mid-record, causing Java's AES-GCM engine to throw `AEADBadTagException`.
  2. Frequent component re-renders exhausted CoinGecko's public IP rate limits.
- **Resolution**:
  - Replaced the GET request entity with a body-free `HttpEntity<Void>` and added standard browser `User-Agent` headers.
  - Implemented a thread-safe in-memory cache (`ConcurrentHashMap`) with a 60-second TTL.
  - Added robust database fallbacks (`coinRepository.findAll()`) and simulated data generators so the app maintains zero-downtime availability.

### 5. MySQL Column Constraint Violation (`Column 'market_cap_change24h' cannot be null`)
- **Root Cause**:
  - The MySQL `coin` table was configured with strict `NOT NULL` constraints on numeric change fields without defaults.
  - When CoinGecko returned coins with missing change data, Hibernate attempted to write `null`, causing MySQL to reject the statement.
- **Resolution**:
  - Executed `ALTER TABLE coin MODIFY ... NULL DEFAULT 0` in MySQL.
  - Added `@Column(nullable = true)`, default initializers (`0.0`, `0L`), and `@PrePersist`/`@PreUpdate` lifecycle methods (`ensureNonNullFields()`) in `Coin.java`.
  - Updated `getCoinDetails()` to merge with existing records in `coinRepository.findById()`, preserving previously populated fields.

---

## 🔒 Security Architecture

- **Stateless Authentication**: Sessions are never stored on the server (`SessionCreationPolicy.STATELESS`), allowing horizontal scaling.
- **Header Authorization**: Every protected request requires `Authorization: Bearer <token>`.
- **BCrypt Encryption**: Passwords are salted and hashed before reaching the database.
- **CORS Defense**: Requests are restricted to authorized frontend origins (`localhost:5173`, `localhost:3000`).
- **Database Sanitization**: All queries use parameterized JPA/Hibernate statements to prevent SQL injection.

---

<div align="center">

**Developed with ❤️ for Modern Cryptocurrency Trading**  
*CryptoX — Secure. Scalable. Real-Time.*

</div>
