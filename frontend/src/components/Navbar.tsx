import { Link,useNavigate } from "react-router-dom";

export default function Navbar(){

const role = localStorage.getItem("role");

const navigate = useNavigate();

const logout = ()=>{

localStorage.clear();

navigate("/login");

};

return(

<nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between">

<h1 className="font-bold text-xl">
Feedback Intelligence
</h1>

<div className="space-x-6">

<Link to="/">Dashboard</Link>

{role==="admin" && (
<Link to="/admin">Admin</Link>
)}

<button onClick={logout}>
Logout
</button>

</div>

</nav>

);

}