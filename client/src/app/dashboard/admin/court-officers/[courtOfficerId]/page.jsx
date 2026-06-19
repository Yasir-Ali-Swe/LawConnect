"use client"
import React from 'react'
import { useParams } from 'next/navigation'
const AdminCourtOfficerDetailPage = () => {
    const { courtOfficerId } = useParams();
  return (
    <div className='h-full flex items-center justify-center'>
        <h1 className='text-foreground text-2xl font-semibold'>Admin court Officer Detail Page for court Officer id : {courtOfficerId}</h1>
    </div>
  )
}

export default AdminCourtOfficerDetailPage