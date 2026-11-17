# UniFlow – Student Organizer App

**PS/2022/100**
**A.L.H.K. LIYANAGE**
**Mobile Application Development**
**Demostration video link: https://drive.google.com/file/d/1hmIO5QW7AZxcFTVWSexABFhpLbgKeMkz/view?usp=sharing** 

**UniFlow** is a mobile student organizer application designed to help university students manage their academic activities and stay organized in one place.

The application provides a centralized space for managing tasks, tracking schedules, organizing important items, and receiving notifications.

## Features

- **Dashboard:** Access the main student organizer interface.
- **Task Management:** Create, view, and manage academic tasks and assignments.
- **Task Details:** View individual task information.
- **Schedule Management:** Organize academic events and view daily schedules.
- **Calendar:** View scheduled events and task due dates.
- **Favorites:** Keep important items easily accessible.
- **Notifications:** Receive notifications through the application.
- **Student Profile:** Manage student profile information.
- **Local Data Storage:** Store selected application data on the device.

## Technology Stack

| Technology | Purpose |
|---|---|
| React Native | Mobile application development |
| Expo | Development and application tooling |
| Expo Router | File-based navigation |
| JavaScript | Application programming |
| React Context API | Shared application state |
| AsyncStorage | Local data persistence |
| Expo Notifications | Notification functionality |
| React Native Components | Mobile user interface |

## Project Structure

```text
UniFlow/
│
├── app/
│   ├── (tabs)/
│   │   ├── _layout.js
│   │   ├── index.js
│   │   ├── favorites.js
│   │   ├── notifications.js
│   │   ├── profile.js
│   │   ├── schedule/
│   │   │   └── index.js
│   │   └── tasks/
│   │       ├── _layout.js
│   │       ├── index.js
│   │       └── [id].js
│   │
│   ├── _layout.js
│   └── index.js
│
├── context/
│   ├── AppStateContext.js
│   ├── ProfileContext.js
│   └── TaskContext.js
│
├── services/
│   └── notificationService.js
│
├── assets/
├── app.json
├── package.json
└── package-lock.json
```

## Getting Started

Follow these instructions to run UniFlow on your local machine.

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm
- [Visual Studio Code](https://code.visualstudio.com/)
- [Expo Go](https://expo.dev/go) on your mobile device

### 1. Clone the Repository

```bash
git clone https://github.com/himara0819/UniFlow.git
```

### 2. Navigate to the Project Directory

```bash
cd UniFlow
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npx expo start
```

### 5. Run the Application

- Open Expo Go on your mobile device.
- Make sure your computer and mobile device are connected to the same Wi-Fi network.
- Scan the QR code displayed in the terminal or browser.
- Wait for the application to load.

## Development

UniFlow is developed using a component-based architecture with shared application state managed through React Context.

The application uses Expo Router for navigation and separates application screens, shared contexts, and supporting services into dedicated directories.

## Future Improvements

Potential future enhancements include:

- Cloud-based data synchronization.
- Student authentication and account management.
- Advanced academic calendar functionality.
- Improved task reminders and notifications.
- Enhanced productivity analytics.
- Additional customization options.

## Repository

GitHub: https://github.com/himara0819/UniFlow

---

**UniFlow – Organize Your Academic Life, All in One Place.**
