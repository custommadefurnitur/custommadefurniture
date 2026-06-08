'use client';
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function SignupPage(){
    const [name,setname] = useState('');
    const [email,setemail] = useState('');
    const [password,setpassword] = useState('');
    const [error,seterror] = useState('');
    const router = useRouter();
    const handlesubmit = async (e: FormEvent<HTMLFormElement>)=> {
        e.preventDefault();
        try{
            const isExists = await fetch("api/userExists",{
                method:"POST",
                headers:{
                    "Content-Type" : "application/json",
                },
                body:JSON.stringify({email})
            });
            const {exists} = await isExists.json();
            if(exists){
                seterror("user Already exists");
                setTimeout(()=>{seterror('');},2000);
                return;
            }

            const res = await fetch("api/signup" ,{
                method:"Post",
                headers:{
                    "Content-Type":"application/json",
                },
                body:JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });
            if(res.ok){
                e.currentTarget.reset();
                router.replace("/login");
            }else{
                console.log("registration failed.");
            }
        }catch(error){
            console.log("Error during registration",error);
        }
        if(!name || !email || !password){
            seterror('Please Fill all');
            setTimeout(()=>{seterror('');},2000);
        }
    }
    return(
        <div className=" bg-white/[0.04] h-fit max-w-3xl border rounded mx-auto rounded-[50px] pb-5 mt-10 border-t-4 border-green-400">
            
            <form onSubmit={handlesubmit} className="w-[80%] mx-auto h-max flex flex-col gap-4 items-start py-4">
                <h1>Register</h1>
                <label className="text-xl font-bold">Name</label>
                <input type="text" name="name" placeholder="your name..." onChange={(e)=>setname(e.target.value)} className="w-full px-8 py-2 text-grey/[0.5] border rounded "/>
                <label className="text-xl font-bold">Email</label>
                <input type="email" name="email" placeholder="ex:name@mail.com" onChange={(e)=>setemail(e.target.value)} className="w-full px-8 py-2 text-grey/[0.5] border rounded "/>
                <label className="text-xl font-bold">Password</label>
                <input type="password" name="password" placeholder="***********" onChange={(e)=>setpassword(e.target.value)} className="w-full px-8 py-2 text-grey/[0.5] border rounded "/>
                {
                error && <p className="border border-red-800 px-2 shadow-red bg-red-400 font-bold text-red-800 rounded text-lg tracking-tight font-mono">{error}</p>
                }
                <button type="submit" className="px-4 py-2 bg-green-700 border rounded text-lg font-bold text-white ml-auto">Signup</button>
            </form>
            <Link prefetch={false} href={'/login'} className="text-end mt-2"><p className="px-14">Already have a account? <span className="underline">Login</span></p></Link>
        </div>
    );
}
