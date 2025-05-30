import Image from "next/image";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import Info from "@/components/landing/Info";
import Featured from "@/components/landing/Featured";
import InviteCTA from "@/components/landing/InviteCTA";
export default function Home() {
  return (
    <div className="flex-1 max-w-5xl mx-auto px-2 py-12 flex justify-center items-center">
      <div className="flex flex-col gap-14 ">
      <Hero></Hero>
      <Info></Info>
      <Featured></Featured>
      <InviteCTA></InviteCTA>
      </div>
      
    </div>
  );
}
