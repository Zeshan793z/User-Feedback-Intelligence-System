 import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async(req:any,res:any)=>{

const {name,email,password} = req.body;

const hash = await bcrypt.hash(password,10);

const user = await User.create({
name,
email,
password:hash
});

res.json(user);

};

export const login = async(req:any,res:any)=>{

const {email,password} = req.body;

const user = await User.findOne({email});

if(!user){
return res.status(400).json({message:"User not found"});
}

const match = await bcrypt.compare(password,user.password);

if(!match){
return res.status(400).json({message:"Invalid password"});
}

const token = jwt.sign(
{id:user._id,role:user.role},
process.env.JWT_SECRET as string
);

res.json({
token,
role:user.role,
name:user.name
});
};