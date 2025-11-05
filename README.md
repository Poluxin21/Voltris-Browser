# 🌐 Voltris Browser

Voltris Browser is an experimental web browser built with **Rust**, using **Tao** for window and event loop management and **Wry** for WebView rendering and frontend communication. The UI is powered by **Vite** + **Node.js**, providing a modern, fast, and modular development experience.

---

## 🚀 Main Technologies

| Technology         | Role                               |
| ------------------ | ---------------------------------- |
| **Rust**           | Core of the browser                |
| **Tao**            | Window & event loop system         |
| **Wry**            | WebView and bridge to the frontend |
| **Vite**           | Fast web-based UI                  |
| **Node.js + Yarn** | UI dev server                      |

---

## 🧩 Project Goals

* Build a lightweight and performance-focused browser
* Provide an ideal environment for **developers**
* Explore Rust capabilities with Wry + Tao
* Evolve into an extensible ecosystem in the future

---

## 📦 Installation & Running

### ✅ Requirements

Make sure you have installed:

* **Rust**
* **Node.js** + **Yarn**
* Git

---

### ▶️ Run the Project

1. **Clone the repository**

```bash
git clone https://github.com/Poluxin21/Voltris-Browser
cd Voltris-Browser
```

2. **Start the UI**

```bash
cd ui
yarn install
yarn run dev
```

3. **Run the Rust Browser Core**

Open another terminal at the project root and run:

```bash
cargo run
```

---

## 🛠️ Project Structure

```
Voltris-Browser/
│
├─ ui/               # UI built with Vite
│  ├─ src/
│  └─ ...
│
├─ src/              # Rust code using Tao + Wry
│  ├─ main.rs
│  └─ ...
│
├─ Cargo.toml
└─ README.md
```

---

## 🤝 Contributing

Contributions are welcome!

You may help with:

* Suggestions and feature ideas (issues)
* Bug fixes & improvements
* Development of the Rust core
* UI interactions and enhancements
* Performance benchmarks & optimizations

---

## 📜 License

MIT 

---
