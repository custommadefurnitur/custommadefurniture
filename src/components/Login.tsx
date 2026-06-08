'use client';
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [error, seterror] = useState('');

  const handlesubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      seterror('Fill all fields');
      setTimeout(() => { seterror(''); }, 2000);
      return;
    }

    try {
      const res = await fetch("api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (res.ok) {
        e.currentTarget.reset();
        // Add redirect logic here (e.g., router.push('/dashboard'))
      } else {
        seterror("Invalid credentials");
        setTimeout(() => { seterror(''); }, 2000);
        console.log("Login failed.");
      }
    } catch (error) {
      console.log("Error during login", error);
    }
  }

  return (
    <div className="bg-white/[0.04] h-fit  border rounded rounded-[50px] pb-5 max-w-3xl mx-auto mt-10 border-t-4 border-green-400">
        
      <form onSubmit={handlesubmit} className="w-[80%] mx-auto h-max flex flex-col gap-4 items-start py-4">
        <h1>Login</h1>
        <label className="text-xl font-bold">Email</label>
        <input 
          type="email" 
          name="email" 
          placeholder="ex:name@mail.com" 
          onChange={(e) => setemail(e.target.value)} 
          className="w-full px-8 py-2 text-grey/[0.5] border rounded"
        />

        <label className="text-xl font-bold">Password</label>
        <input 
          type="password" 
          name="password" 
          placeholder="***********" 
          onChange={(e) => setpassword(e.target.value)} 
          className="w-full px-8 py-2 text-grey/[0.5] border rounded"
        />

        {error && (
          <p className="border border-red-800 px-2 shadow-red bg-red-400 font-bold text-red-800 rounded text-lg tracking-tight font-mono">
            {error}
          </p>
        )}

        <button type="submit" className="px-4 py-2 bg-green-700 border rounded text-lg font-bold text-white ml-auto">
          Login
        </button>
      </form>

      <Link prefetch={false} href={'/signup'} className="text-end mt-2">
        <p className="px-14">Don&apos;t have an account? <span className="underline">Register</span></p>
      </Link>
    </div>
  );
}
