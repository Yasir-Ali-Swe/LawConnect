import React from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col ">
      <div className="px-4 bg-foreground">
        <Navbar />
      </div>
      <main className="px-4 md:px-12 flex-1 overflow-x-hidden">{children}</main>
      <Footer />
    </div>
  );
};

export default layout;
