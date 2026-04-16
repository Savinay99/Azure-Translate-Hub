# Azure AI Translator Dashboard

A modern, fully functional, and interactive web application for real-time translation powered by Microsoft Azure Cognitive Services. Built with pure HTML, CSS, and JavaScript, this dashboard features a premium glassmorphism UI, voice input, text-to-speech, and local credential management.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-production%20ready-green.svg)

## 🚀 Features

### Core Functionality
- **Azure Integration**: Connects directly to the Azure Translator API v3.0.
- **Smart Detection**: Automatically detects source language if not specified.
- **Multi-Language Support**: Supports Hindi, English, French, Spanish, German, Japanese, Chinese, and more.
- **Secure Credential Management**: Option to save API Key and Region locally using `localStorage` for quick access.

### Advanced UX/UI
- **Glassmorphism Design**: Modern, blurred glass cards with animated gradient backgrounds.
- **Dark/Light Mode**: Seamless theme switching with persistent preference.
- **Responsive Layout**: Fully adaptive grid system for mobile, tablet, and desktop.
- **Interactive Animations**: Smooth transitions, hover effects, and loading states.

### Productivity Tools
- **Voice Input**: Speak to type using the Web Speech API.
- **Text-to-Speech**: Listen to the translated output.
- **Translation History**: Automatically saves the last 5 translations for quick reference.
- **Keyboard Shortcuts**: Press `Ctrl + Enter` to translate instantly.
- **Copy to Clipboard**: One-click copying of translated text.

## 🛠️ Tech Stack

- **HTML5**: Semantic structure and accessibility.
- **CSS3**: Custom properties, Flexbox/Grid, Backdrop-filter, and Keyframe animations.
- **JavaScript (ES6+)**: Modular logic, Fetch API, Async/Await, and LocalStorage management.
- **External Assets**:
  - [Font Awesome](https://fontawesome.com/) for icons.
  - [Google Fonts](https://fonts.google.com/) (Inter) for typography.

## 📋 Prerequisites

1. **Microsoft Azure Account**: You need an active Azure subscription.
2. **Translator Resource**: Create a "Translator" resource in the Azure Portal.
3. **API Key & Region**: Locate your Key and Region (e.g., `centralindia`, `uaenorth`) in the Azure Portal under "Keys and Endpoint".

## 🚀 Getting Started

### 1. Clone the Repository

