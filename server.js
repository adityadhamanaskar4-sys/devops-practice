const Express=require('express');
const app=Express();
const mongoose=require('mongoose');
const User=require('./schemas/userschema');
const dotenv=require('dotenv');
dotenv.config();
app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());
const instance=process.env.APP_NAME
async function connect(){
    try{
        await mongoose.connect("mongodb://aditya:abcdef@host.docker.internal:27017/test?authSource=admin");
        console.log("connected to db");
    }catch(err){
        console.log(err);
    }
}
connect();
app.get('/',(req,res)=>{
    res.sendFile(__dirname+"/views/index.html");
    console.log("index page served by "+instance);
})
app.post('/submit',async (req,res)=>{
    try{
        const user= await User.create(req.body);
        res.send("User saved successfully <a href='/'>View Users</a>");
    }catch(err){
        res.status(500).send("Error saving user");
    }
})
app.get('/users',async (req,res)=>{
    try{
        const users= await User.find();
        res.json(users);
    }catch(err){
        res.status(500).send("Error fetching users");
    }
});
app.delete('/users/:id',async (req,res)=>{
    try{
        const user= await User.findByIdAndDelete(req.params.id);
        if(!user){
            return res.status(404).send("User not found");
        }
        res.send("User deleted successfully");
    }catch(err){
        res.status(500).send("Error deleting user");
    }   
});
app.put('/users/:id',async (req,res)=>{
    try{
        const user= await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if(!user){
            return res.status(404).send("User not found");
        }
        res.json(user);
    }catch(err){
        res.status(500).send("Error updating user");
    }
});
app.listen(3000,()=>{console.log(`${instance} running on port 3000`)});