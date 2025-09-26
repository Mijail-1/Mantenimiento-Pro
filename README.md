# Mantenimiento Pro

**Mantenimiento Pro** is a modern Progressive Web App (PWA) designed to streamline and digitize the management of cleaning and maintenance tasks within educational institutions. It provides a real-time connection between administrative staff (supervisors) and maintenance personnel (workers), enhancing efficiency and accountability.

The application is built as a mobile-first experience, simulating a native app interface within a web browser, and is fully installable on mobile devices for easy access and offline functionality.

## ✨ Core Features

The application supports two distinct user roles, each with a tailored interface and set of functionalities.

### 👤 Admin (Supervisor) View

-   **📊 Interactive Dashboard:** Get a quick overview of key metrics, including pending tasks, new incidents, and active staff members. Visualize task completion progress and incident breakdowns by category.
-   **📝 Task Management:** Create new tasks, add detailed descriptions, set priorities (Low, Medium, High), assign them to specific staff members, and set due dates.
-   **🔍 Task Monitoring:** View a comprehensive list of all tasks, filterable by status, and dive into a detailed view for each task to see its status, assignee, and comment history.
-   **🚨 Incident Management:** Review incidents reported by workers, complete with photos and descriptions. Seamlessly convert a new incident into an assignable task with a single click.
-   **👥 Staff Management:** Add new staff members to the system and edit their details (phone number, password).
-   **💬 Direct Communication:** Initiate WhatsApp chats directly with any staff member from the app.

### 👷 Worker (Staff) View

-   **✅ My Tasks:** A clear and simple list of all tasks assigned to the logged-in user. Workers can view task details, including descriptions, priority, and due dates.
-   **✔️ Task Completion:** Mark tasks as complete with a simple checkbox, providing immediate status updates to the system.
-   **📢 Incident Reporting:** Easily report new incidents (e.g., maintenance issues, supply shortages). The reporting form allows for categorization, a detailed description, and an optional photo upload directly from the device's camera or gallery.
-   **💬 Supervisor Chat:** Quickly open a WhatsApp chat with the supervisor for urgent communications.
-   **👤 Simple Profile:** A straightforward profile view displaying the user's name.

## 🚀 Technology Stack

This project is built with a modern frontend stack, emphasizing performance, developer experience, and scalability.

-   **Framework:** [React](https://react.dev/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **PWA:** Custom Service Worker for offline caching and a Web App Manifest for installability.
-   **State Management:** React Hooks (`useState`) for local component state. All data is currently mocked and managed at the root `App` component level.

## ⚙️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Node.js](https://nodejs.org/) (which includes npm) installed on your system.

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd mantenimiento-pro
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, typically available at `http://localhost:5173`. Open this URL in your browser to see the application.

### Building for Production

To create a production-ready build of the application, run:

```bash
npm run build
```

This command bundles the app into static files in the `dist` directory, optimized for performance. You can preview the production build locally with `npm run preview`.

## 📱 PWA Functionality

Mantenimiento Pro is designed as a Progressive Web App, offering features typically associated with native applications:

-   **Installable:** On supported browsers (like Chrome on Android or Safari on iOS), users will be prompted to "Add to Home Screen," allowing the app to be launched like a native app.
-   **Offline Capable:** The service worker (`public/service-worker.js`) implements a "cache-first" strategy. After the first visit, the application's shell and assets are cached, allowing it to load instantly and run even without an internet connection.


para que funcione en netifly(esto lo cambio yo personalmente):
1: borrar el index en github
2: borrar esta parte   <script type="importmap">
{
  "imports": {
    "react/": "https://aistudiocdn.com/react@^19.1.1/",
    "react": "https://aistudiocdn.com/react@^19.1.1",
    "vite": "https://aistudiocdn.com/vite@^7.1.7",
    "@vitejs/plugin-react": "https://aistudiocdn.com/@vitejs/plugin-react@^5.0.3",
    "react-dom/": "https://aistudiocdn.com/react-dom@^19.1.1/"
  }
}
</script>
de index.html
