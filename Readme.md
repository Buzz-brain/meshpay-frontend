<div align="center">
  <h1>🌐 MeshPay</h1>
  <h3>Empowering Digital Payments Without Internet</h3>
  <img src="https://img.shields.io/badge/LoRa-Enabled-blue?style=flat-square" alt="LoRa Enabled" />
  <img src="https://img.shields.io/badge/WiFi-Offline-green?style=flat-square" alt="WiFi Offline" />
  <img src="https://img.shields.io/badge/JSON-Lightweight-yellow?style=flat-square" alt="JSON Lightweight" />
</div>

---

## 🔍 What is MeshPay?

<b>MeshPay</b> is a simple but powerful digital payment system that allows people to make payments even when there is <b>no internet connection</b>, especially useful in <b>rural or underserved areas</b> in Africa.

Imagine a small town with no good internet. People can still pay digitally using MeshPay by connecting to nearby devices using their phones, just like how you'd connect to a Wi-Fi signal. These devices form a <b>local payment network</b>, where each transaction is passed through nearby nodes (devices) to a central point where it's approved, <i>all without needing the internet</i>.

---

## 🧠 How the Whole System Works

### 🏗 1. System Structure

* The system is built like a <b>star network</b>, not a full mesh. That means:
  * Users connect to a <b>Node</b> (a small device like an ESP32 microcontroller).
  * The Node then talks to a <b>Gateway</b> (another device with LoRa).
  * The Gateway forwards all messages to a <b>Central Brain</b> (a local PC or server that holds the business logic and makes the final decisions).

#### 🧠 Central Brain

* This is a <b>local computer</b> (for now, a PC during prototyping).
* It holds all the main <b>logic and rules</b> for processing transactions.
* It is written in <b>JavaScript</b>, not Python, to keep it lightweight and easy to manage.
* It listens for incoming data and responds to nodes.

### 🛰 2. LoRa Communication

* <b>LoRa</b> is a special kind of wireless technology that sends data <b>very far</b> using <b>very little power</b>.
* Each node sends transaction data to the gateway using LoRa.
* Even if there's no internet, this LoRa link keeps the system connected internally.

### 📡 3. WebSockets on the Nodes

* Each <b>Node</b> broadcasts a small Wi-Fi hotspot.
* A user can <b>connect to the Node via Wi-Fi</b> using a basic phone app or browser.
* Communication between the user and the node happens in <b>real-time</b> using <b>WebSockets</b> (this keeps the connection open so information can flow both ways instantly).

---

## 📦 Data Format

* All communication is done using <b>compressed JSON files</b>.
* JSON is used because:
  * It is lightweight (small in size).
  * Easy to understand and process.
  * Works well in <b>low-bandwidth</b> situations (like LoRa networks).

---

## ⚙ What Happens When a User Sends a Payment Request?

1. The user connects to a nearby <b>Node’s Wi-Fi</b>.
2. The user sends a request (e.g., “send 100 naira to merchant X”).
3. The Node receives the request and <b>forwards it using LoRa</b> to the <b>Gateway</b>.
4. The Gateway forwards the request to the <b>Central Brain (PC)</b>.
5. The Central Brain processes it and sends back a <b>response</b> (e.g., “transaction successful”).
6. The response goes back through the Gateway → Node → User in real time.

---

## 🛠 Hardware and Tools Involved

| Component              | Role                                                      |
| ---------------------- | --------------------------------------------------------- |
| <b>ESP32</b>              | Low-power device used as Node, broadcasts Wi-Fi           |
| <b>LoRa Module</b>        | Used for long-range communication between Node & Gateway  |
| <b>Gateway Node</b>       | Collects all LoRa messages and forwards them to the Brain |
| <b>Central Brain (PC)</b> | Processes all logic, written in <b>JavaScript</b>            |
| <b>WebSocket</b>          | Real-time connection between Node and User                |
| <b>JSON</b>               | Lightweight format used to transfer all messages          |

---

## 🌍 Why Is This System Important?

* Works <b>without full-time internet</b>.
* Saves power and data.
* Designed for <b>Africa’s rural environments</b> where internet and electricity are unreliable.
* Can support other use cases like:
  * <b>Health records</b>
  * <b>Education</b>
  * <b>Agricultural info sharing</b>
  * <b>Mobile money</b>

---

## 💡 Summary in Simple Words

<b>MeshPay</b> is a local payment system that uses:

* Tiny devices,
* Long-distance wireless communication (LoRa),
* A local computer brain (written in JavaScript),
* And real-time Wi-Fi connections (WebSocket + JSON).

Together, they help people send money or communicate without needing a central internet connection, perfect for villages or places with poor infrastructure.

---
