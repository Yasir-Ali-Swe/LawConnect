import React from "react";

const Footer = () => {
  const date = new Date().toISOString();
  const year = date.slice(0, 4);
  return (
    <footer className="flex w-screen justify-center items-center bg-foreground text-background py-2 xl:py-4">
      <p className="text-background font-medium text-center text-md xl:text-md">
        &copy; {year} LawConnect. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
