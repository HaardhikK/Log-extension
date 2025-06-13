# 📝 Quick Notepad - Chrome Extension

**Quick Notepad** is a sleek, section-based notepad Chrome extension — perfect for jotting down quick ideas. It supports dark mode, image pasting, highlighting, and more, all inside a fixed-size draggable popup window.

---

## 🚀 Features

- 📁 Organize notes into multiple **named sections**
- ✏️ **Highlight** selected text
- 🌙 **Dark mode** toggle
- 🖼️ **Paste** or **drag-drop images** directly into the editor
- 🧹 **Clear section** content with one click
- 📋 **Copy** plain text (excludes images)
- 🔠 Adjustable **font size**
- 📌 Opens in a **fixed-size, draggable popup window**
- 💾 Data stored using `chrome.storage.session` for privacy-safe, session-based notes

---

## 🛠 How to Install

**1.** Clone or download this repository to your computer  
**2.** Open **Google Chrome** and go to: `chrome://extensions/`  
**3.** Enable **Developer Mode** (top-right corner toggle)  
**4.** Click **"Load unpacked"**, then select the folder where this extension is located  
**5.** The extension icon will now appear in your Chrome toolbar — click it to launch the notepad

---

## 📓 How to Use

- Click the **+** to add a new section  
- Click the **✎** icon to rename a section  
- Click the **❌** button to delete the current section  
- **Highlight** selected text with the 🖍️ button  
- Toggle **Dark Mode** with the 🌙 button  
- Clear section with the **🗑** icon  
- Use the **Copy** button to copy all plain text  
- Paste or drop images directly into the editor

> Notes are saved automatically during the browser session

---

## 🔧 Technical Notes

- Opens in a **popup window** (not a default extension popup), so you can drag and reposition it  
- Fixed size: **360×520 px**, positioned at **right-middle** of your screen  
- Data stored via `chrome.storage.session` — not persisted across browser restarts  
- Supports theme switching with CSS variables

---



