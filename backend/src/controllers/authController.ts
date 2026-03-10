import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hash,
      role: "user", // default role
    });

    // generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // return token + user info
    res.json({
      token,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

//Fresh start in the Top/ Roll back to bottom if needed

//  import User from "../models/User";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// export const register = async(req:any,res:any)=>{

// const {name,email,password} = req.body;

// const hash = await bcrypt.hash(password,10);

// const user = await User.create({
// name,
// email,
// password:hash
// });

// res.json(user);

// };

// export const login = async(req:any,res:any)=>{

// const {email,password} = req.body;

// const user = await User.findOne({email});

// if(!user){
// return res.status(400).json({message:"User not found"});
// }

// const match = await bcrypt.compare(password,user.password);

// if(!match){
// return res.status(400).json({message:"Invalid password"});
// }

// const token = jwt.sign(
// {id:user._id,role:user.role},
// process.env.JWT_SECRET as string
// );

// res.json({
// token,
// role:user.role,
// name:user.name
// });
// };