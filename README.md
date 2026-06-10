# INTEGRATIVE-PROJECT-CLINICAL-MANAGEMENT-SYSTEM
## 2. README para el Proyecto de la Clínica (Clinical Management System)

A comprehensive, full-stack scheduling ecosystem designed for medical clinics. It features a patient-facing web application for online booking and a robust desktop administration software for healthcare staff.

---

##  Project Overview

This collaborative integrative project addresses real-world clinical workflow challenges. It bridges the gap between customer service and internal operations by providing two synchronized environments connected to a centralized relational database:
1. **Web Platform:** For patients to register, browse medical specialties, and manage their schedules.
2. **Desktop System (NetBeans):** For administrators and doctors to manage internal workflows, update appointment statuses, and review logs.

---

##  My Contribution & Core Responsibilities

As the **Web & Database Integration Developer**, my role centered on bridging the gap between the frontend user experience and the data layer:

- **Database Connection Layer:** Architected and implemented the core connection scripts using **JavaScript**, establishing asynchronous data communication pipelines between the web interface and the server.
- **Dynamic Scheduling Module:** Programmed the system logic that filters and categorizes available medical appointments based on specific specialties.
- **Real-Time Data Synchronization:** Engineered the database polling/event-handling mechanism for the appointment history module. This ensures that any status modifications or scheduling changes made by doctors on the desktop backend instantly reflect on the patient's web history dashboard.

---

##  Key Features

- **Dual-Environment Architecture:** Seamless data exchange between a JavaScript web frontend and a Java (NetBeans) desktop core.
- **Smart Appointment History:** Tracks both upcoming scheduled sessions and historical medical consultations.
- **Dynamic Specialty Categorization:** Allows users to easily browse and select relevant medical practitioners.

---

##  Tech Stack

- **Frontend Web:** HTML5, CSS3, JavaScript (ES6+)
- **Desktop Environment:** Java (NetBeans IDE)
- **Database Engine:** SQL Relational Database (MySQL / PostgreSQL)
- **Version Control:** Git & GitHub

---

##  Repository Structure

├── web-client/         # Web application source files (HTML, CSS, JS)
├── desktop-app/        # Java/NetBeans desktop application source files
├── database/           # SQL scripts, schemas, and relational models
└── README.md           # Project documentation
