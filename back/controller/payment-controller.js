const Appointment = require("../model/Appointment");
const Payment = require("../model/Payment");
const Billings = require("../model/Billings");
const sequelize = require("../db/dbconnection");
const { exportDecryptedData } = require("../auth/secure");
const { QueryTypes } = require("sequelize");
const Notification = require("../model/Notification");

const processPayment = async(req,res,next)=>{
    const {userId} = req.user
    const {paymentMethod,appointmentId,processedPaymentId} = req.body;

    try{
        const convertedAppId = await exportDecryptedData(appointmentId);

        const dateNow = new Date();

        const composedTime = `${dateNow.getHours()}:${dateNow.getMinutes()}:${dateNow.getSeconds()}`;
        
        const queryAppDetails = await sequelize.query(`
            select e.totalAmount,e.serviceDescription,e.numberOfHours,
        DATEDIFF(e.enddate, e.startdate) as countDays from Appointment e
        where e.appointmentId = :appId`,
        {replacements:{appId:+convertedAppId},
        type: QueryTypes.SELECT})
        

        const {totalAmount,serviceDescription,numberOfHours,countDays} = queryAppDetails[0]
        const hoursBilled = numberOfHours * countDays;
       const createPayment = await sequelize.transaction(async(t)=>{

           const paymentCreated = await Payment.create({
                paymentMethod:paymentMethod,
                appointmentId:+convertedAppId,
                processedPaymentId:processedPaymentId,
                payerId: userId
            },{transaction: t})

            await Billings.create({
                appointmentId:+convertedAppId,
                time:composedTime,
                serviceProvided: serviceDescription,
                hoursBilled: hoursBilled,
                payMethod:paymentMethod,
                totalPay:totalAmount
            },{transaction:t})


            return paymentCreated

       })
    
        await Appointment.update({
            statusId: 3
        },{
            where:{
                appointmentId:+convertedAppId
            }
        })

           // Retrieve the updated appointment details within the transaction
           const updatedAppointment = await Appointment.findOne({
            where: { appointmentId: convertedAppId }
        });
        
        const resultNotif = await sequelize.transaction(async(t)=>{
            const notifCreate = await Notification.create({
                appointmentId: convertedAppId,
                seniorId: updatedAppointment.dataValues.seniorId,
                assistantId: updatedAppointment.dataValues.assistantId,
                statusId: updatedAppointment.dataValues.statusId, 
                assistantReadFlag:false,
                isFromReminder:false,
                readFlag: false,
                isFromReminder:false
            }, { transaction: t });

            return notifCreate;
        })

       res.status(201).send({
        isSuccess: true,
        message: "Successfully paid the appointment"
    })
    }catch(e){

        next(e);
    }
}

module.exports = {
    processPayment
}