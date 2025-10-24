const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const xlsx = require("xlsx");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Middleware raj bhai xpress.json());

// Set up file storage using Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// API to handle file upload and process data
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;

    // Read the uploaded Excel file
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Filter students with attendance < 60%
        const lowAttendanceStudents = sheetData.filter(student => student.Attendance < 60);

        res.json({
            message: "File processed successfully!",
            students: lowAttendanceStudents
        });

        // Delete the uploaded file after processing
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error("Error processing file:", error);
        res.status(500).json({ message: "Error processing file" });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
