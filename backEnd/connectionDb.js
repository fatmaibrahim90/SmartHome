const mongoose=require('mongoose');
const url = 'mongodb://127.0.0.1:27017/IotBakEnd';


const connect = async () => {
    await mongoose.connect(url)
    console.log("you are connected to your database")
}

module.exports = connect;