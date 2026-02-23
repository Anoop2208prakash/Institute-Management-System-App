const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

// 1. Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Multer Configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret';

// --- API ROUTES ---

/**
 * 1. FETCH ROLES (Required for Registration Screen)
 */
app.get('/api/roles', async (req, res) => {
  try {
    const roles = await prisma.role.findMany();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch roles" });
  }
});

/**
 * 2. FETCH CLASSES (Required for Registration Screen)
 */
app.get('/api/classes', async (req, res) => {
  try {
    const classes = await prisma.class.findMany();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch classes" });
  }
});

/**
 * 3. AUTHENTICATION (Login)
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        role: true,
        studentProfile: true,
        teacherProfile: true,
        adminProfile: true 
      }
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account disabled." });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    res.json({ message: "Login successful", token, user: userWithoutPassword });

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * 4. STUDENT REGISTRATION
 */
app.post('/api/students/register', upload.single('avatar'), async (req, res) => {
  try {
    const { 
      email, password, roleId, 
      fullName, admissionNo, dob, gender, classId, 
      phone, address, bloodGroup, needsHostel 
    } = req.body;

    let avatarUrl = null;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'ims_avatars' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      avatarUrl = result.secure_url;
    }

    const newStudentData = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password, 
          avatar: avatarUrl,
          roleId,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          admissionNo,
          fullName,
          dob: new Date(dob),
          gender, 
          classId,
          phone,
          address,
          bloodGroup,
          needsHostel: needsHostel === 'true' || needsHostel === true,
        },
      });

      return { user, student };
    });

    res.status(201).json({ 
      message: "Student Registered successfully!", 
      data: newStudentData 
    });

  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Registration Failed", details: error.message });
  }
});

/**
 * 5. UTILITY & TEST ROUTES
 */
app.get('/test-db', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ message: "Database connected successfully (Prisma 5.22.0)!" });
  } catch (error) {
    res.status(500).json({ error: "DB Connection Failed", details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('IMS Native App Server is running with full Auth and Data support.');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});