const mongoose = require('mongoose');

async function connectDB (){
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        const connection  = mongoose.connection
        connection.on('connection',()=>{
            console.log('connected to the DB successfully')
        })
        connection.on('error',()=>{
            console.log('connection error')
        })
    } 
    catch(err){
        console.log(err,'something wrong err')
    }
}

module.exports = connectDB;