import React from "react";

const Footer = () => {
  const date = new Date().toISOString();
  const year = date.slice(0, 4);
  return (
    <footer className="flex w-screen justify-center items-center bg-foreground text-background px-20 py-5">
      <p className="text-background font-semibold text-center">
        &copy; {year} LawConnect. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
