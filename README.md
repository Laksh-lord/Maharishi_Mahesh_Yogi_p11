
# ResidentResolve 🏠

**ResidentResolve** is a modern, responsive Hostel Complaint & Maintenance Portal designed to streamline communication between students, hostel wardens, and maintenance workers.

## 🚀 Features

### 🎓 Student Portal
- **Raise Complaints**: Log maintenance issues (Plumbing, Electricity, etc.) easily.
- **AI-Powered Priority**: Integrated with **Gemini AI** to automatically determine the urgency of an issue based on the student's description.
- **Status Tracking**: Visual progress tracker from "Submitted" to "Closed".
- **Feedback Loop**: Rate and provide feedback once a task is resolved.

### 🛡️ Warden Dashboard
- **Command Center**: Overview of all active complaints across different hostels.
- **Smart Analytics**: Visual charts showing the distribution of issues by category.
- **Task Delegation**: Assign specific specialists to complaints.
- **Focus Filters**: Filter by status, category, or priority.

### 🛠️ Worker Portal
- **Role-Based Focus**: Specialists (Plumbers, Electricians, etc.) only see tasks relevant to their field.
- **Direct Assignment**: View and accept new jobs or focus on assigned workload.
- **Resolution Tracking**: Add technical remarks before marking a task as resolved.

## 🛠️ Tech Stack
- **Frontend**: React (ESM via importmap)
- **Styling**: Tailwind CSS
- **AI Engine**: Google Gemini API
- **State Management**: LocalStorage MockStore (easily swappable for Firestore)
- **Visualization**: Recharts

## 🔑 Demo Credentials
Explore the application using these pre-configured accounts (Password: *anything*):

| Role | Email |
| :--- | :--- |
| **Student** | `student@test.com` |
| **Warden** | `warden@test.com` |
| **Worker** | `worker@test.com` |

## 💻 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ResidentResolve.git
   ```
2. **Setup environment**:
   - The app uses `process.env.API_KEY` for Gemini AI features. Ensure your environment provides a valid Google GenAI API key.
3. **Run**:
   - Open `index.html` in a modern browser or use a simple local server like `live-server` or Vite.

## 📄 License
Distributed under the MIT License.
