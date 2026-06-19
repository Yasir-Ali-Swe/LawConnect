"use client"
import React from 'react'
import { useParams } from 'next/navigation'
const ClerkCourtOfficerDetailPage = () => {
    const { courtOfficerId } = useParams();
  return (
    <div className='h-full flex items-center justify-center'>
        <h1 className='text-foreground text-2xl font-semibold'>Clerk court Officer Detail Page for court Officer id {courtOfficerId} assigne case to court officer </h1>
    </div>
  )
}

export default ClerkCourtOfficerDetailPage