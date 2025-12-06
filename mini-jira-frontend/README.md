# Mini Jira Frontend

This is the frontend application for the Mini Jira project, a task management system.

## Tech Stack

- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/)
- **UI Component Library**: [Material UI (MUI)](https://mui.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Emotion
- **Routing**: [React Router](https://reactrouter.com/)
- **Data Fetching**: Axios & TanStack Query

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Getting Started

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Run Development Server**

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:5173` (or the port shown in your terminal).

3.  **Build for Production**

    ```bash
    npm run build
    ```

4.  **Preview Production Build**

    ```bash
    npm run preview
    ```

## Project Structure

- `src/components`: Reusable UI components
- `src/layouts`: Application layout components (e.g., MainLayout)
- `src/pages`: Page components corresponding to routes
- `src/store`: Redux store configuration and slices
- `src/utils`: Utility functions and helpers
