const user = require("../model/User");
const userProfile = require("../model/UserProfile");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const auth = require("../auth/auth");
const sequelize = require("../db/dbconnection");
const senior = require("../model/Senior");
const { exportDecryptedData,exportEncryptedData } = require("../auth/secure");
const relationship = require("../model/Relationship");
const healthStatusModel = require("../model/HealthStatus");
const xperience = require("../model/Experience");
const { QueryTypes } = require("sequelize");
const nodemailer = require('nodemailer');
const brg = require("../model/Barangay");
const Barangay = require("../model/Barangay");

// Create transporter using SMTP
// const transporter = nodemailer.createTransport({
//     service: 'Gmail',  // Or replace with 'Yahoo' if using Yahoo
//     auth: {
//         user: process.env.EMAIL,
//         pass: process.env.EMAIL_PASS,
//     },
//     tls: {
//         rejectUnauthorized: false,
//     },
// });

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,  // or 587 for TLS
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});


  // Test the connection
transporter.verify((error, success) => {
    if (error) {
      console.log("Error setting up email:", error);
    } else {
      console.log("Email setup complete and ready to send.");
    }
  });

  // Function to send a test email
const sendTestEmail = async (req, res) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL,
            to: 'tetsu.kala@gmail.com',  // Replace with the recipient's email
            subject: 'Test Email from Node.js',
            text: 'This is a test email sent from Node.js using Nodemailer!',
        };

        await transporter.sendMail(mailOptions);    
        res.status(200).send("Test email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send("Failed to send test email.");
    }
};

const sendEmailForgotPassword = async (req, res, next) => {
    try {
        // Replace this with the source of the email, e.g., req.body.email if req.user.email is undefined
        const email = req.body.email;

        if (!email) {
            return res.status(400).send("Email is required.");
        }

        const userInfo = await userProfile.findOne({
            where: { email: email }
        });
        console.log(userInfo);

        if (!userInfo) {
            return res.status(404).send("User not found.");
        }

        //console.log(userInfo);
        // Proceed with generating a reset link and sending the email here
        
        const generateUserFriendlyPassword = () => {
          const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#$%&*';
          let password = '';
          for (let i = 0; i < 12; i++) {
              password += characters.charAt(Math.floor(Math.random() * characters.length));
          }
          return password;
      };
      
      const newPassword = generateUserFriendlyPassword();
      
      const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: 'Your Password Has Been Changed - We Care',
          text: `Hi ${userInfo.firstname} ${userInfo.lastname},\n\nYour password has been successfully reset. 
          Below is your newly generated password. Please log in and update your password immediately for added security.\n\n
          New Password: ${newPassword}\n\n
          If you did not request this password reset, please contact our support team immediately.\n\n
          Best regards,\nWe Care Support Team`,
      };
      
        // Generate a new temporary password
        const tempPassword = `${newPassword}`;

        // Encrypt the password only if it's provided
        let hashedPassword   = await bcrypt.hash(tempPassword, saltRounds);

        // Update the user's password in the database
       const passchange = await user.update(
            { password: hashedPassword },
            { where: { email: email } }
        );
        console.log(hashedPassword);
        console.log(passchange);
        
        await transporter.sendMail(mailOptions);    
        res.send("User found. Proceeding to send reset email.");
        
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send("Failed to send test email."); 
    }
}



// const addNewUserHandler = async (req, res, next) => {
//     try {
//     let {
//         lastname, firstname, email, userType, street,
//         barangayId, contactNumber, gender, birthDate,
//         numOfYears, experienceDescription, rate, 
//         password, seniorNumber, prescribeMeds, 
//         healthStatus, remarks, relationships
//     } = req.body;


//     // Parse relationships if it's a string
//     if (typeof relationships === 'string') {
//         try {
//         relationships = JSON.parse(relationships); // Parse the string into an array of objects
//         } catch (error) {
//         return res.status(400).send({
//             isSuccess: false,
//             message: "Invalid relationships data"
//         });
//         }
//     }

//     // Ensure relationships is always an array
//     relationships = Array.isArray(relationships) ? relationships : [];
//     let newExperience = null;

//     // Encrypt password
//     const encryptedPassword = await bcrypt.hash(password, saltRounds);

//     // Validate password length
//     if (password?.length < 8 || password?.length > 26) {
//         return res.status(400).send({
//         isSuccess: false,
//         message: "Error with Password Length"
//         });
//     }

//     // Handle profile image file if uploaded (assume using something like multer)
//     let profileImagePath = null;
//     let IdDocImage = null;
    
//     if (req.file) {
//         // profileImagePath = req.file.path; Save file path if uploaded
//         profileImagePath = req.file.path.split('profilePictures')[1];
//         IdDocImage = req.file.path.split('IdDocImage')[1];
//     }


//     // Main transaction block
//     await sequelize.transaction(async (t) => {
//         // Only create the Experience record if all experience fields are provided
//         if (userType === "assistant") {
//         newExperience = await xperience.create({
//             numOfYears: numOfYears,
//             experienceDescription: experienceDescription,
//             rate: rate
//         }, { transaction: t });
//         }

//         // Create new user profile
//         const newUserProfile = await userProfile.create({
//         lastname: lastname,
//         firstname: firstname,
//         email: email,
//         userType: userType,
//         street: street,
//         barangayId: barangayId,
//         contactNumber: contactNumber,
//         gender: gender,
//         birthDate: birthDate,
//         experienceId: newExperience ? newExperience.dataValues.experienceId : null, // Use null, not 0
//         profileImage: profileImagePath || null, // Save file path or set to null
//         IdDocImage: IdDocImage || null,
//         approveFlg:true
//         }, { transaction: t });

//         // Create user record
//         await user.create({
//         userId: newUserProfile.dataValues.userId,
//         email: email,
//         password: encryptedPassword
//         }, { transaction: t });

//         // Other logic for seniors, healthStatus, and relationships...
//         if (userType === "senior") {
//         const newHealthStatus = await healthStatusModel.create({
//             healthStatus: healthStatus
//         }, { transaction: t });

//         // Create senior record
//         const newSenior = await senior.create({
//             userId: newUserProfile.dataValues.userId,
//             seniorNumber: seniorNumber || null,
//             healthStatusId: newHealthStatus.dataValues.healthStatusId,
//             prescribeMeds: prescribeMeds,
//             remarks: remarks
//         }, { transaction: t });

//         // Handle relationships if provided
//         if (Array.isArray(relationships) && relationships.length > 0) {
//             const relationshipsWithSeniorId = relationships.map(rel => ({
//             name: rel.name || null,
//             age: rel.age || null,
//             relationship: rel.relationship || null,
//             civilstatus: rel.civilstatus || null,
//             occupation: rel.occupation || null,
//             contactNumber: rel.contactNumber || null,
//             seniorId: newSenior.dataValues.seniorId
//             }));

//             await relationship.bulkCreate(relationshipsWithSeniorId, { transaction: t, validate: true });
//         }
//         }

//         return newUserProfile;
//     });

//     res.status(200).send({
//         isSuccess: true,
//         message: "Successfully Registered New User"
//     });

//     } catch (e) {
//     console.log(e);  // Log the error for debugging
//     next(e);  // Pass the error to the next middleware (e.g., error handler)
//     }
// };

const addNewUserHandler = async (req, res, next) => {
    console.log(req.files);
    try {
      let {
        lastname, firstname, email, userType, street,
        barangayId, contactNumber, gender, birthDate,
        numOfYears, experienceDescription, rate, 
        password, seniorNumber, prescribeMeds, 
        healthStatus, remarks, relationships
      } = req.body;
  
      // Parse relationships if it's a string
      if (typeof relationships === 'string') {
        try {
          relationships = JSON.parse(relationships);
        } catch (error) {
          return res.status(400).send({
            isSuccess: false,
            message: "Invalid relationships data"
          });
        }
      }
  
      relationships = Array.isArray(relationships) ? relationships : [];
  
      const encryptedPassword = await bcrypt.hash(password, saltRounds);
  
      if (password?.length < 8 || password?.length > 26) {
        return res.status(400).send({
          isSuccess: false,
          message: "Error with Password Length"
        });
      }
  
      // File handling for profile image and ID document
      let profileImagePath = null;
      let IdDocImagePath = null;
      let approvFlg = false;
  
      if (req.files) {
        if (req.files['profileImage']) {
          profileImagePath = req.files['profileImage'][0].path.split('profilePictures')[1];
        }
        if (req.files['idDocImage']) {
          IdDocImagePath = req.files['idDocImage'][0].path.split('idDocImage')[1];
        }
      }
      console.log(profileImagePath)
      console.log(IdDocImagePath)


      await sequelize.transaction(async (t) => {
        let newExperience = null;
  
        if (userType === "assistant") {
          newExperience = await xperience.create({
            numOfYears: numOfYears,
            experienceDescription: experienceDescription,
            rate: rate
          }, { transaction: t });
          approvFlg = false;
        }
  
        const newUserProfile = await userProfile.create({
          lastname,
          firstname,
          email,
          userType,
          street,
          barangayId,
          contactNumber,
          gender,
          birthDate,
          experienceId: newExperience ? newExperience.dataValues.experienceId : null,
          profileImage: profileImagePath || null,
          idDocImage: IdDocImagePath || null,
          approveFlg: approvFlg
        }, { transaction: t });
  
        await user.create({
          userId: newUserProfile.dataValues.userId,
          email,
          password: encryptedPassword
        }, { transaction: t });
  
        if (userType === "senior") {
          const newHealthStatus = await healthStatusModel.create({
            healthStatus: healthStatus
          }, { transaction: t });
  
          const newSenior = await senior.create({
            userId: newUserProfile.dataValues.userId,
            seniorNumber: seniorNumber || null,
            healthStatusId: newHealthStatus.dataValues.healthStatusId,
            prescribeMeds: prescribeMeds,
            remarks: remarks
          }, { transaction: t });
  
          if (Array.isArray(relationships) && relationships.length > 0) {
            const relationshipsWithSeniorId = relationships.map(rel => ({
              name: rel.name || null,
              age: rel.age || null,
              relationship: rel.relationship || null,
              civilstatus: rel.civilstatus || null,
              occupation: rel.occupation || null,
              contactNumber: rel.contactNumber || null,
              seniorId: newSenior.dataValues.seniorId
            }));
  
            await relationship.bulkCreate(relationshipsWithSeniorId, { transaction: t, validate: true });
          }
        }
      });
  
      res.status(200).send({
        isSuccess: true,
        message: "Successfully Registered New User"
      });
  
    } catch (e) {
      console.log(e);
      next(e);
    }
  };
  



const addNewAdmin = async () => {
    try {
      await sequelize.transaction(async (t) => {
        const encryptedPassword = "$2a$12$DMmMUQ8NjaljttqG/CKr/udGXpnkRDT5i3M5eaF3Q7kipUcj8Acw6";
  
        // Check if admin already exists
        const existingAdmin = await user.findOne({
          where: { email: "admin12345@gmail.com" },
          transaction: t,
        });
  
        if (existingAdmin) {
          console.log("Admin with this email already exists. Skipping creation.");
          return;
        }
  
        const newAdminExperience = await xperience.create(
          {
            numOfYears: 1,
            experienceDescription: "This experience is for dummy experience",
            rate: 7777,
          },
          { transaction: t }
        );
  
        const newAdminBrg = await brg.create(
          {
            barangay: "Pasil",
          },
          { transaction: t }
        );
  
        const newUserProfile = await userProfile.create(
          {
            lastname: "admin",
            firstname: "admin",
            email: "admin12345@gmail.com",
            userType: "admin",
            street: "street admin 01",
            barangayId: newAdminBrg.dataValues.barangayId,
            contactNumber: "095671854328",
            gender: "male",
            birthDate: new Date(),
            experienceId: newAdminExperience.dataValues.experienceId,
            profileImage: null,
            approveFlg: true,
          },
          { transaction: t }
        );
  
        await user.create(
          {
            userId: newUserProfile.dataValues.userId,
            email: "admin12345@gmail.com",
            password: encryptedPassword,
          },
          { transaction: t }
        );
  
        console.log("Admin initialized successfully.");
      });
    } catch (error) {
      console.error("Error initializing admin:", error);
      throw error;
    }
  };
  
  

const saveUserRegistrationInSession = (req,res,next)=>{
    const {lastname,firstname,
        email,userType, street,
        barangayId,
        contactNumber,gender,birthDate,
        experienceId,password} = req.body;
    req.session.data = {lastname,firstname,
        email,userType, street,
        barangayId,
        contactNumber,gender,birthDate,
        experienceId,password}

    req.session.save();
}

const grabSession = async(req,res,next)=>{
    
    res.status(201).send(
        {data: req.session.data}
    )
}

const getUserDataUsingAuthenticationToken = 
async(req,res,next)=>{
   try{
    const userInfo = await userProfile.findOne({
        where:{
            userId:req.user.userId
        }
    })
    const encryptedId = await exportEncryptedData(String(req.user.userId));

    if(!userInfo){
        return res.status(400).send({
            isSuccess: false,
            message: "Something went wrong!",
        })
    }

    delete userInfo?.dataValues.userId;


    res.status(200).send({
        isSuccess: true,
        message: "Successfully retrieve user's information",
        data: {
            userId: encryptedId,
            ...userInfo?.dataValues
        }
    })
   }catch(e){
    next(e)
   }
}


// const updateUserHandlerForProfile = async (req, res, next) => {
//     console.log(req.user.userId);
//     try {
//         let userId = req.user.userId;
//         let {
//             lastname, firstname, email, userType, street,
//             barangayId, contactNumber, gender, birthDate,
//             experienceId, password
//         } = req.body;
    
//         let profileImagePath = null;
//         if (req.file) {
//             //profileImagePath = req.file.path; //Save file path if uploaded
//             profileImagePath = req.file.path.split('profilePictures')[1];
//             //profileImagePath = path.relative(path.join(__dirname, '../profilePictures'), req.file.path);
//         }
    
//         let encryptedPassword = await bcrypt.hash(password, saltRounds);
    
//         let updateData = {
//             firstname,
//             lastname,
//             email,
//             userType,
//             barangayId,
//             contactNumber,
//             gender,
//             birthDate,
//             street,
//             profileImage: profileImagePath || null, // Save file path or set to null
//             experienceId: experienceId || null
//         };

//         let userDataAcc = {
//             email,
//             encryptedPassword
//         };

//         const updateUserProfile = await userProfile.update(updateData, {
//             where: { userId }
//         });

//         const updateUserAcc = await user.update(userDataAcc , {
//             where: { userId }
//         });

//         res.status(200).send({
//             isSuccess: true,
//             message: "User Data Updated",
//             data: updateUserProfile?.dataValues
//         });
//     } catch (e) {
//         next(e);
//     }
// };

const updateUserHandlerForProfile = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            lastname, firstname, email, userType, street,
            barangayId, contactNumber, gender, birthDate,
            experienceId, password
        } = req.body;

        // let profileImagePath = null;
        // if (req.file) {
        //     // Assume the static directory `profilePictures` is correctly set for serving images
        //     profileImagePath = req.file.path.split('profilePictures')[1];
        // }

      // File handling for profile image and ID document
      let profileImagePath = null;
      let IdDocImagePath = null;
  
      if (req.files) {
        if (req.files['profileImage']) {
          profileImagePath = req.files['profileImage'][0].path.split('profilePictures')[1];
        }
        if (req.files['IdDocImage']) {
          IdDocImagePath = req.files['IdDocImage'][0].path.split('IdDocImage')[1];
        }
      }
        

        // Encrypt the password only if it's provided
        let encryptedPassword;
        if (password) {
            encryptedPassword = await bcrypt.hash(password, saltRounds);
        }

        // Prepare data for userProfile update
        const updateData = {
            firstname,
            lastname,
            email,
            userType,
            barangayId,
            contactNumber,
            gender,
            birthDate,
            street,
            profileImage: profileImagePath || null,
            IdDocImage: IdDocImagePath || null,
            experienceId: experienceId || 1
        };

        // Prepare data for user account update
        const userDataAcc = {
            email
        };
        if (encryptedPassword) {
            userDataAcc.password = encryptedPassword;
        }

        // Update userProfile data
        const updateUserProfile = await userProfile.update(updateData, {
            where: { userId }
        });

        // Update user account data if needed
        const updateUserAcc = await user.update(userDataAcc, {
            where: { userId }
        });

        res.status(200).send({
            isSuccess: true,
            message: "User Data Updated",
            data: updateUserProfile?.dataValues
        });
    } catch (e) {
        next(e);
    }
};


const authenticationHandler = async(req,res,next)=>{

    const {
        email,
        password
    } = req.body;
   
    try{   
    const userAuthenticate = await user.findOne({
        where: {
            email: email
        }
    })

    if(userAuthenticate?.dataValues){
        const isPasswordMatches = await bcrypt.compare(password,userAuthenticate?.dataValues?.password);
        
        if(isPasswordMatches) {

            const userProfileData = await userProfile.findOne({
                where:{
                    userId: userAuthenticate?.dataValues.userId
                }
            })
            const token= await auth.createAccessToken(userProfileData?.dataValues);
    
            res.status(200).send({
                isSuccess: true,
                message: "Successfully Logged in",
                data:{
                    token: token
                }
            })
        }else {
            res.status(201).send({
                isSuccess: false,
                message: "Invalid credentials"
            })
        }
    }else {
        res.status(200).send({
            isSuccess: false,
            message: "Credentials not recognize"
        })        
    }
    }catch(e){
        next(e)
    }
}

const retrieveListUserDetails = async(req,res,next)=>{
    const {userId} = req.user;
    try{
        const loggedinUser = await userProfile.findOne({
            where:{
                userId: userId
            }
        })

        const loggedinUserType = loggedinUser?.dataValues.userType;


        const userType = loggedinUserType === 'senior' ? 'assistant': 'senior';
        console.log("type:"+userType);
        console.log("userId:"+ userId);
        let approveFlg = true;
        if(userType === 'senior'){
            approveFlg = false;
        }
        const userList = await sequelize.query(`
            SELECT 
                e.userId, 
                e.profileImage, 
                CONCAT_WS(" ", e.firstName, e.lastName) AS fullName,
                f.messageContent, 
                f.date, 
                f.date, 
                f.contentType,
                f.readFlag,
                f.contentType,
                f.senderId,
                f.messageId
            FROM 
                collabproj.userProfile e
            LEFT JOIN 
                (SELECT 
                    MAX(messageId) AS latestMessageId, 
                    CASE 
                        WHEN senderId = :loggedInUserId THEN recipientId 
                        ELSE senderId 
                    END AS otherUserId
                FROM 
                    collabproj.message
                WHERE 
                    senderId = :loggedInUserId OR recipientId = :loggedInUserId  
                GROUP BY 
                    otherUserId  
                ) AS latestMessage 
                ON e.userId = latestMessage.otherUserId  
            LEFT JOIN 
                collabproj.message f 
                ON f.messageId = latestMessage.latestMessageId 
            WHERE 
                e.userType = :userType
            and e.approveFlg = :approveFlg
                ORDER BY 
            f.date DESC `,{
                    replacements:{loggedInUserId: userId,userType: userType, approveFlg:approveFlg},
                    type:QueryTypes.SELECT
                })

        const newList = await userList.map(async(val)=>{
          
            val['userId'] = await exportEncryptedData(String(val.userId));
            val['isFromLoggedInUser'] = Number(val.senderId) === Number(userId);
            return val;
        });

        res.status(201).send({
            isSuccess:true,
            message: "Successfully retrieve users",
            data: await Promise.all(newList)
        })
    }catch(e){
        next(e)
    }
}

const processProfile = async (req,res,next)=>{
    try{
        console.log("Request")
        console.log(req.file);

        res.status(201).send({
            isSuccess: true,
            message: "Kwan mn ni"
        })
    }catch(e){
        next(e)
    }
}

const getAssistantDetails = async(req,res,next)=>{
    try{
        const {assistantId} = req.params;
        const assistantIdDec = await exportDecryptedData(assistantId);

        console.log(assistantIdDec)
        const results = await sequelize.query(
            'select userId, email, profileImage, concat_ws(" ",firstName,lastName) as fullName from UserProfile where userId = :userId ',{
                type: QueryTypes.SELECT,
                replacements: { userId: Number(assistantIdDec) },
            }   
        )

        const newResults = results.map(val=>{
            val["userId"] = assistantId;

            return val;
        })        

        res.status(201).send({
            isSuccess: true,
            message: "Successfully retrieved Assistant Details",
            data:{...newResults[0]}
        })

    }catch(e){
        next(e)
    }
}



// Function to fetch all user emails
async function fetchAllEmails(req, res, next) {
    try {
      // Use Sequelize's `findAll` method to get all user emails
      const users = await user.findAll({
        attributes: ['email'], // Select only the email field
      });
      
      // Map the results to extract only the emails
      const emails = users.map(user => user.email);
      
      // Send the emails as a response
      res.status(200).json(emails);
      
    } catch (error) {
        next(error); // Corrected error handling
    }
}


module.exports = {
    addNewUserHandler,
    grabSession,
    saveUserRegistrationInSession,
    authenticationHandler,
    getUserDataUsingAuthenticationToken,
    updateUserHandlerForProfile,
    retrieveListUserDetails,
    processProfile,
    getAssistantDetails,
    fetchAllEmails,
    sendTestEmail,
    sendEmailForgotPassword,
    addNewAdmin
}