
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AuthorInfo = () => {
  return (
    <div className="bg-bennett-lightBlue p-6 rounded-lg flex flex-col md:flex-row gap-6 items-center md:items-start">
      <div className="flex-shrink-0">
        <Avatar className="w-24 h-24 bg-bennett-navy">
          <AvatarImage src="/lovable-uploads/b9eed837-d3e3-4439-9e6d-a416f2c12d78.png" alt="Charles Bennett" />
          <AvatarFallback className="text-2xl text-white font-serif">CB</AvatarFallback>
        </Avatar>
      </div>
      <div>
        <div className="text-center md:text-left">
          <h3 className="text-lg font-semibold mb-1 mt-1">Charles Bennett, Esq.</h3>
          <p className="text-sm text-bennett-slate mb-3">Consumer Protection Attorney</p>
        </div>
        <p className="text-sm text-bennett-slate">
          Charles Bennett and Richard Faulkner have over 50 years of combined experience in consumer protection law and litigation. The Bennett Legal team has extensive experience with fraud cases, arbitration, and trial advocacy. Charles is a graduate of the SMU Dedman School of Law and is committed to protecting the rights of Texas consumers against predatory business practices in emerging industries like solar energy.
        </p>
      </div>
    </div>
  );
};

export default AuthorInfo;
