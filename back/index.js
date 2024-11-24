require('dotenv').config();
const cors = require('cors');
const express = require('express');
const http = require('http'); 
const socketIo = require('socket.io');
const path = require('path');
const multer = require('multer');
const app = express();

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { exportDecryptedData, exportEncryptedData } = require('./auth/secure');
const {sendMessage, uploadFiles} = require('./controller/chat-controller');
const { setupReminderNotifications ,recordPastReminders} = require('./controller/notification-controller');


// Models
const UserProfile = require('./model/UserProfile');
const User = require('./model/User');
// DB connection
const sequelize = require('./db/dbconnection');

// Routes
const loginRoutes = require("./routes/login-routes");
const registerRoutes = require("./routes/register-routes");
const barangayRoutes = require("./routes/barangay-routes");
const experienceRoutes = require("./routes/experience-routes");
const userRoutes = require("./routes/user-routes");
const dashboardRoutes = require("./routes/dashboard-routes");
const setupMessageRoutes = require("./routes/message-routes"); 
const seniorRoutes = require("./routes/senior-routes");
const paymentRoutes = require("./routes/payment-routes");
const appointmentRoutes = require("./routes/appointment-routes");
const adminRoutes = require("./routes/admin-routes");
const noteRoutes  = require ("./routes/notes-routes")
const reminderRoutes = require("./routes/reminder-routes");
const assistantRoutes = require("./routes/assistant-routes");
const emergencyRoutes = require("./routes/emergency-routes");
const notifRoutes = require("./routes/notification-routes")
const ratingsRoutes  = require("./routes/ratings-routes");
const status = require("./routes/status-routes");
const feedbackRoutes = require('./routes/feedback');
const reportRoute = require("./routes/report");




// Controller
const userController = require("./controller/user-controller");
const statusController = require("./controller/status-controller");
const ratingsController = require("./controller/ratings-controller");
// Port
const port = process.env.PORT || 4000;

const options = {
    host: process.env.HOST,
    port: 3306,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DB,
    checkExpirationInterval: 900000,
    expiration: 86400000
};

// CORS Configuration
app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST','DELETE','PUT'],         
    credentials: true                
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/main", loginRoutes);
app.use("/main", registerRoutes);
app.use("/main", userRoutes);
app.use("/experience", experienceRoutes);
app.use("/barangay", barangayRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/senior",seniorRoutes);
app.use("/payment",paymentRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/admin",adminRoutes);
app.use("/reminders",reminderRoutes);
app.use("/assistant",assistantRoutes);
app.use("/emergency", emergencyRoutes);
app.use("/ratings",ratingsRoutes);
app.use("/status",status);
app.use("/report", reportRoute);

// registration files
app.use('/profilePictures', express.static(path.join(__dirname, 'profilePictures')));
app.use('/idDocImage', express.static(path.join(__dirname, 'idDocImage')));

app.use('/feedback', feedbackRoutes);
// Serve uploaded files
app.get('/download/:filename', (req, res) => {
    const file = path.join(__dirname, 'uploads', req.params.filename);
    res.download(file);  // This forces the browser to download the image
});

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO with CORS configuration
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000',  // Allow requests from your frontend
        methods: ['GET', 'POST','DELETE'],
        credentials: true
    }
});

// Initialize reminder notifications AFTER io is initialized
setupReminderNotifications(io);

const sessionStore = new MySQLStore(options);

app.use(session({
    key: process.env.SESSION,
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
}));

sessionStore.onReady().then(() => {

    console.log('MySQLStore ready');
}).catch(error => {
    console.error(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);  // Log the error
    res.status(500).send("Something went wrong");
});


app.use((err,req,res,next)=>{
   
    if(err){
        res.status(500).send({
            isSuccess: false,
            message: err.message
        })
        
    }    
})



// Database connection and server start
async function startServer() {
    try {
        // Database connection
        await sequelize.authenticate();
        console.log('Database connected successfully!');

        // Table will be created if it does not exist yet.
        await sequelize.sync();

        // Set up message routes and pass the io instance
        app.use("/chat", setupMessageRoutes(io));

        app.use("/appointment",appointmentRoutes(io));

        app.use("/notifications",notifRoutes(io));

        app.use("/notes",noteRoutes(io));

        userController.addNewAdmin();
        statusController.addNewStatus();
        ratingsController.createRatingTable()
        server.listen(port, () => {
            console.log(`Server running at ${port}`);
        });
     
    } catch (error) {
        console.log(error);
    }
}

// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);


    socket.on('joinRoom', ({ roomId, senderId }) => {
        // Join the client to the specified room
        socket.join(roomId);

        console.log(`${senderId} joined room: ${JSON.stringify(roomId)}`);
        console.log(roomId)

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

     // Listen for the 'sendMessage' event from the client
     socket.on('sendMessage', async (data) => {
        console.log("sendMessage is triggerred")
        // Call the sendMessage controller
        await sendMessage(data, io);  
        // Emit an event to notify others in the room to fetch new messages
       
    });


    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


startServer();


module.exports = { io };


