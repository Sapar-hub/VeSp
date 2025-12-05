# Vector Space

## Overview
Vector Space is an interactive web application designed to visualize and manipulate mathematical objects like vectors, matrices, and points in 2D and 3D space. It provides a dynamic environment for exploring linear algebra concepts, performing transformations, and understanding coordinate systems through an intuitive user interface. Users can define expressions using a custom mathematical syntax, which the application evaluates to render objects and their relationships.

## Features
- **Interactive 2D/3D Visualization:** Manipulate vectors, points, and matrices in real-time.
- **Expression Engine:** Define and evaluate mathematical expressions to create and modify scene objects.
- **Scene Management:** Authenticated users can save, load, update, and delete their customized scenes.
- **Transformation Tools:** Apply linear transformations to objects and change basis vectors.
- **Projection Explorer:** Explore projections and their effects on objects.
- **Notifications:** Real-time feedback on operations and errors.

## GRACE Methodology
This project adheres to the **GRACE** methodology for software development, emphasizing a **Contract-First** approach. This means that architectural decisions and component interfaces are meticulously defined through formal XML contracts (specifically `Architecture.xml`, `DevelopmentPlan.xml`, and `RequirementsAnalysis.xml`) *before* implementation begins. This strategy is crucial for:
-   **Preventing "Big Ball of Mud"**: By establishing clear boundaries and responsibilities early, we avoid an unstructured and unmanageable codebase.
-   **Mitigating "Architectural Drift"**: The contracts serve as a single source of truth, ensuring that implementation remains aligned with the intended design and preventing deviations over time.
-   **Formal Verification**: Adherence to these contracts provides a form of formal verification, ensuring the system's components integrate as designed and fulfill their specified roles, directly referencing principles discussed in software architecture lectures.

The pillars of GRACE are:
- **G**oal-oriented development
- **R**eusable components
- **A**gile practices
- **C**lean architecture
- **E**volving design

## Tech Stack
### Frontend
- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A strongly typed superset of JavaScript.
- **Zustand**: A small, fast, and scalable bear-bones state-management solution.
- **KaTeX**: Fast math typesetting for the web.
- **Konva.js**: For 2D canvas drawing.
- **Three.js**: For 3D rendering.
- **Vite**: A fast build tool.

### Backend
- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express.js**: A minimal and flexible Node.js web application framework.
- **TypeScript**: For type-safe backend development.
- **Prisma**: A next-generation ORM for Node.js and TypeScript.
- **PostgreSQL**: A powerful, open source object-relational database system.
- **JWT (JSON Web Tokens)**: For secure authentication.

### Infrastructure
- **Docker**: For containerization of the application services.
- **Docker Compose**: For defining and running multi-container Docker applications.
- **GitHub Actions**: Implemented for Continuous Integration (CI) to automate testing and linting on every push.

## Getting Started

### Prerequisites
- Docker and Docker Compose installed on your machine.
- Node.js and npm (or yarn) if you plan to develop the frontend or backend outside of Docker.

### Running the Full Stack with Docker Compose

1.  **Clone the repository:**
    ```bash
    git clone [your-repository-url]
    cd VectorSpace
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file in the root directory of the project (where `docker-compose.yml` is located) with the following content:
    ```
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=your_db_name
    JWT_SECRET=a_very_secret_key_for_jwt_signing
    ```
    Replace `your_db_user`, `your_db_password`, `your_db_name`, and `a_very_secret_key_for_jwt_signing` with strong, unique values.

3.  **Build and Start Services:**
    From the root directory, run:
    ```bash
    docker-compose up --build
    ```
    This command will:
    - Build the Docker images for the backend API and frontend.
    - Start the PostgreSQL database, backend API, and frontend services.
    - The backend API will be available at `http://localhost:3000`.
    - Access API documentation at `http://localhost:3000/api-docs`.
<<<<<<< HEAD
    - The frontend will be available at `http://localhost:8080`.
=======
    - The frontend will be available at `http://localhost:5173`.
>>>>>>> b1965e62d0481f392bc3b7496c157a86a13ad9cb

4.  **Database Migrations (First Run):**
    After the services are up and running for the first time, you'll need to apply database migrations. Open a new terminal in the project root and run:
    ```bash
    docker-compose exec api npx prisma migrate dev --name init
    ```
    Follow any prompts. This will create the necessary tables in your PostgreSQL database.

5.  **Access the Application:**
    Open your web browser and navigate to `http://localhost:5173`.

### Frontend Development (Outside Docker)
If you wish to develop the frontend outside the Docker container (e.g., for hot-reloading):

1.  **Install dependencies:**
    ```bash
    cd frontend # Assuming your frontend is in a 'frontend' directory, adjust if different
    npm install
    ```
2.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The frontend will typically run on `http://localhost:5173`. Ensure your backend is running (either via Docker Compose or separately).

### Backend Development (Outside Docker)
If you wish to develop the backend outside the Docker container:

1.  **Install dependencies:**
    ```bash
    cd backend
    npm install
    ```
2.  **Set up database (if not using Docker Compose for DB):**
    Ensure you have a PostgreSQL database running and update the `DATABASE_URL` in your backend's `.env` file or directly in `prisma/schema.prisma`.
3.  **Run migrations:**
    ```bash
    npx prisma migrate dev --name init
    ```
4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The backend will typically run on `http://localhost:3000`.

## Project Structure
-   `backend/`: Contains the Node.js/Express.js API.
-   `src/`: Contains the React frontend application.
-   `docker-compose.yml`: Defines the multi-container Docker application.
-   `README.md`: This file.
-   `...` (other configuration files and assets)

## Contributing
Contributions are welcome! Please follow the GRACE methodology and submit pull requests.

## License
[Specify your project's license here]