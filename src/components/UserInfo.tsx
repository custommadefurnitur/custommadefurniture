'use client';
import { signOut } from "next-auth/react";

export default function UserInfo(){
    return(
        <div className="flex justify-center items-center h-screen">
            <div className="shadow-md shadow-white p-8 bg-zinc-300/10 flex flex-col gap-2 h-fit w-fit">
                <div>Name: <span className="font-bold">John</span></div>
                <div>Email: <span className="font-bold">john@gmail.com</span></div>
                <button className="bg-red-500 text-wite font-bold px-6 py-3 mt-3" onClick={()=>signOut()}>Log out</button>
            </div>
        </div>
    );
}