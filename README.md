# 🔦 ShadowScanner: A Covert Data Detection Tool

A lightweight, browser-based tool designed to scan for data hidden in the digital shadows of your images. It uses a Chi-Square statistical attack to detect signs of LSB (Least Significant Bit) steganography.
---

## 🎯 Core Purpose

In the world of cybersecurity, steganography allows messages to lurk in the shadows of seemingly innocent files. **ShadowScanner** is a defensive tool that brings these secrets into the light. It analyzes images directly in your browser to find statistical anomalies that indicate data is concealed using LSB steganography.

This project was built to be a simple, accessible, and privacy-focused tool for:
* Cybersecurity students learning about covert channels.
* Digital forensics enthusiasts.
* Participants in Capture The Flag (CTF) competitions.

---

## ✨ Key Features

* **100% Client-Side:** All analysis happens in your browser. Your images are never uploaded to a server, ensuring complete privacy.
* **LSB Detection:** Specifically targets the detection of Least Significant Bit steganography in PNG and BMP images.
* **Statistical Analysis:** Implements a **Chi-Square attack** to measure the statistical randomness of pixel data and determine the likelihood of a hidden payload.
* **User-Friendly Interface:** A clean, simple "upload and scan" workflow with clear, color-coded results.
* **Single File Deployment:** The entire tool is contained within a single HTML file, making it incredibly easy to use and share.

---

## 🛠️ Technology Stack

* **Frontend:** HTML5, Tailwind CSS
* **Core Logic:** Vanilla JavaScript

---

## 🔬 How It Works

ShadowScanner loads an image onto a hidden HTML canvas to access its raw pixel data. It then performs a **Chi-Square statistical test** on this data.

In a natural, unaltered image, the values of adjacent pixels have a certain statistical relationship. LSB steganography, which overwrites the least significant bits of pixel data to hide a message, disrupts this relationship and makes the data appear more random—like noise in the shadows.

The Chi-Square test effectively measures how far the image's statistical properties deviate from what is expected of a "clean" image. A high probability score indicates that the data is statistically random, pointing to a high likelihood of a message hidden from view.

---

## 🚀 How to Use

1.  **Clone the repository or download the `index.html` file.**
    ```bash
    git clone [https://github.com/sjashwant21/ShadowScanner.git](https://github.com/sjashwant21/ShadowScanner.git)
    ```
2.  **Navigate to the project directory.**
    ```bash
    cd ShadowScanner
    ```
3.  **Open the `index.html` file in any modern web browser** (like Chrome, Firefox, or Edge).
4.  Click the **"Upload Image"** button and select an image file you want to scan.
5.  Click the **"Scan for Hidden Data"** button.
6.  View the probability score and the conclusion in the results section.

---

## 🗺️ Future Enhancements

* [ ] Support for more image formats (e.g., JPEG, WebP).
* [ ] Implementation of other steganalysis techniques (like RS Analysis).
* [ ] Option to analyze specific color channels (R, G, B, Alpha).
* [ ] Batch scanning for processing multiple images at once.

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
