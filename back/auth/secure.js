const CryptoJS = require("crypto-js");


const exportEncryptedData = async (data)=>{
    let encryptedResult;
    try{
        const ciphertext = await CryptoJS.AES.encrypt(data, process.env.ENCRYPTION_KEY).toString();
        encryptedResult = ciphertext
    }catch(e){
        throw new Error("Something went wrong");
    }

    return encryptedResult;

}

// Decrypt

const exportDecryptedData = async (data)=>{
    let decryptedData;

    try {
        const bytes  = await CryptoJS.AES.decrypt(data, process.env.ENCRYPTION_KEY);
    
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
       
        decryptedData = originalText;
    }catch(e){
        throw new Error("Something went wrong");
    }   

    return decryptedData;
}

module.exports = {
    exportEncryptedData,
    exportDecryptedData
}