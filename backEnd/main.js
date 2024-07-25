    // import 
    const express = require('express');
    const cors = require('cors');
    const connect=require('./connectionDb');

    // routes
    const userRoute=require('./src/routers/userRoute')
    const blogRoute=require('./src/routers/blogRoute')
    const commentRoute=require('./src/routers/commentRoute')



    //seting the port
    const port=process.env.PORT || 8000;

    //creat the server
    const app=express();
    const http =require('http').createServer(app);


    // connection with database
    connect()
    // place image 
    app.use(express.static('src/images'));

    app.use(cors("*"));
    app.use(express.json({}));

    app.use(express.urlencoded());


    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.set("Access-Control-Expose-Headers", "*");
        res.setHeader(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept, Authorization, authorization'
        );
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

        next();
    });
    


    //routes middleware
    app.use("/blog", blogRoute);
    app.use("/comment", commentRoute);
    app.use("/users",userRoute)








    app.listen(port,()=>{
        console.log(`server is running on port :`+port)
    }
    )