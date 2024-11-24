const { response } = require('express');
const jwt = require('jsonwebtoken');

const secret_key = "CourseBookingAPIB303";

module.exports.createAccessToken= async (user)=>{	

	const user_data ={
        userId:user.userId,
        email: user.email,
		userType:user.userType
    }


    return jwt.sign(user_data, secret_key,{});
}

module.exports.verify = (request, response, next) => {
	let token = request.headers.authorization;

	if (typeof token === "undefined"){
		return response.status(400)
		.send({isSuccess: false,
			message: 'Failed, please include token in the header of the request.'})
	}

	// This will remove the default 'Bearer ' from the token in the authorization header, leaving only the token itself
	token = token.slice(7, token.length);

	jwt.verify(token, secret_key, (error, decoded_token) => {
		if(error){
			return response.send({
				isSuccess: false,
				message: error.message
			})
		}
        request.user = decoded_token;
		next();
	})
}

module.exports.verifyAdmin = (req,res,next) =>{
	if(req.user.userType === "admin") {
		return next();
	}

	return res.status(400).send({
		isSuccess: false,
		message: "Loggedin User is not an Admin. Access Denied."
	})
}


module.exports.verifySenior = (req,res,next)=>{
	if(req.user.userType === "senior") {
		return next();
	}

	return res.status(400).send({
		isSuccess: false,
		message: "Loggedin User is not a Senior. Access Denied"
	})
}

module.exports.verifyAssistant = (req,res,next)=>{
	if(req.user.userType === "assistant") {
		return next();
	}

	return res.status(400).send({
		isSuccess: false,
		message: "Loggedin User is not an Assistant. Access Denied"
	})
}

